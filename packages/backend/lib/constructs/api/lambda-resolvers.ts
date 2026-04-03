import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';
import nameResource, { nameStackResource } from '../../utils/name-resource';
import { createLambdaResolver } from './lambda-resolver-factory';

interface LambdaResolversProps {
  api: appsync.GraphqlApi;
  table: Table;
  userPool: UserPool;
  mediaBucketName: string;
}

/**
 * Lambda-backed resolvers for operations requiring complex logic:
 * - User queries: Cognito lookups (getUser, getUsers, searchUsers)
 * - Friend mutations: Transactional DynamoDB operations
 */
export class LambdaResolvers extends Construct {
  constructor(scope: Construct, id: string, { api, table, userPool, mediaBucketName }: LambdaResolversProps) {
    super(scope, id);

    const lambdaDir = path.join(__dirname, '../../lambda');

    // ---------------------------------------------------------------------------------------
    // SETUP USER QUERIES (getUser, getUsers, searchUsers)
    // ---------------------------------------------------------------------------------------
    const usersLambda = new lambdaNodejs.NodejsFunction(this, nameStackResource('users-fn'), {
      functionName: nameResource('users-fn'),
      entry: path.join(lambdaDir, 'users/index.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: { USER_POOL_ID: userPool.userPoolId },
    });

    usersLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ListUsers', 'cognito-idp:AdminGetUser'],
      resources: [userPool.userPoolArn],
    }));

    const usersDataSrc = api.addLambdaDataSource(nameStackResource('users-ds'), usersLambda);

    // Attach resolvers for all user queries
    ['getUser', 'getUsers', 'searchUsers'].forEach(fieldName => {
      usersDataSrc.createResolver(nameStackResource(`resolver-${fieldName}`), {
        typeName: 'Query',
        fieldName,
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
      });
    });

    // ---------------------------------------------------------------------------------------
    // RESOLVER LAMBDA SETUP
    // ---------------------------------------------------------------------------------------

    // respondToFriendRequest — transactional accept/decline
    createLambdaResolver(this, api, {
      name: 'respond-friend-request',
      entry: path.join(lambdaDir, 'respondToFriendRequest/index.ts'),
      typeName: 'Mutation',
      fieldName: 'respondToFriendRequest',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantWriteData(fn),
    });

    // removeFriend — transactional delete both sides
    createLambdaResolver(this, api, {
      name: 'remove-friend',
      entry: path.join(lambdaDir, 'removeFriend/index.ts'),
      typeName: 'Mutation',
      fieldName: 'removeFriend',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantReadWriteData(fn),
    });

    // ── Messaging ──────────────────────────────────────────────────────────

    // userProfile — handles getUserProfile (Query) and setUserProfile (Mutation)
    const { ds: profileDs } = createLambdaResolver(this, api, {
      name: 'user-profile',
      entry: path.join(lambdaDir, 'userProfile/index.ts'),
      typeName: 'Mutation',
      fieldName: 'setUserProfile',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantReadWriteData(fn),
    });

    profileDs.createResolver(nameStackResource('resolver-get-user-profile'), {
      typeName: 'Query',
      fieldName: 'getUserProfile',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    // createChat — creates DM chat with membership items for both users
    createLambdaResolver(this, api, {
      name: 'create-chat',
      entry: path.join(lambdaDir, 'createChat/index.ts'),
      typeName: 'Mutation',
      fieldName: 'createChat',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantReadWriteData(fn),
    });

    // sendMessage — writes message, updates membership previews, translates
    createLambdaResolver(this, api, {
      name: 'send-message',
      entry: path.join(lambdaDir, 'sendMessage/index.ts'),
      typeName: 'Mutation',
      fieldName: 'sendMessage',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => {
        table.grantReadWriteData(fn);
        fn.addToRolePolicy(new iam.PolicyStatement({
          actions: ['translate:TranslateText', 'comprehend:DetectDominantLanguage'],
          resources: ['*'],
        }));
      },
    });

    // getMessages — paginated message history for a chat
    createLambdaResolver(this, api, {
      name: 'get-messages',
      entry: path.join(lambdaDir, 'getMessages/index.ts'),
      typeName: 'Query',
      fieldName: 'getMessages',
      environment: { TABLE_NAME: table.tableName, BUCKET_NAME: mediaBucketName },
      grantFn: (fn) => {
        table.grantReadData(fn);
        fn.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: [`arn:aws:s3:::${mediaBucketName}/*`],
        }));
      },
    });

    // translateMessage — on-demand retrospective translation
    createLambdaResolver(this, api, {
      name: 'translate-message',
      entry: path.join(lambdaDir, 'translateMessage/index.ts'),
      typeName: 'Mutation',
      fieldName: 'translateMessage',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => {
        table.grantReadWriteData(fn);
        fn.addToRolePolicy(new iam.PolicyStatement({
          actions: ['translate:TranslateText', 'comprehend:DetectDominantLanguage'],
          resources: ['*'],
        }));
      },
    });

    // getUploadUrl — pre-signed S3 PUT URL for file uploads
    createLambdaResolver(this, api, {
      name: 'get-upload-url',
      entry: path.join(lambdaDir, 'getUploadUrl/index.ts'),
      typeName: 'Mutation',
      fieldName: 'getUploadUrl',
      environment: { BUCKET_NAME: mediaBucketName, TABLE_NAME: table.tableName },
      grantFn: (fn) => {
        table.grantReadData(fn);
        fn.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [`arn:aws:s3:::${mediaBucketName}/*`],
        }));
      },
    });

    // getAvatarUploadUrl — pre-signed S3 PUT URL scoped to avatars/<userId>/
    createLambdaResolver(this, api, {
      name: 'get-avatar-upload-url',
      entry: path.join(lambdaDir, 'getAvatarUploadUrl/index.ts'),
      typeName: 'Mutation',
      fieldName: 'getAvatarUploadUrl',
      environment: { BUCKET_NAME: mediaBucketName },
      grantFn: (fn) => {
        fn.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [`arn:aws:s3:::${mediaBucketName}/avatars/*`],
        }));
      },
    });
  }
}
