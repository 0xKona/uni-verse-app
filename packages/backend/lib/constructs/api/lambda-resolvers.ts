import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';
import nameResource, { nameStackResource } from '../../utils/name-resource';

// ══════════════════════════════════════════════════════════════════════════════
// Shared Lambda resolver factory
// ══════════════════════════════════════════════════════════════════════════════

interface LambdaResolverConfig {
  name: string;
  entry: string;
  typeName: 'Query' | 'Mutation';
  fieldName: string;
  environment: Record<string, string>;
  grantFn: (fn: lambda.IFunction) => void;
}

function createLambdaResolver(
  scope: Construct,
  api: appsync.GraphqlApi,
  config: LambdaResolverConfig
) {
  // Don't specify logGroup — let Lambda auto-create it to avoid conflicts
  const fn = new lambdaNodejs.NodejsFunction(scope, nameStackResource(`${config.name}-fn`), {
    functionName: nameResource(`${config.name}-fn`),
    entry: config.entry,
    runtime: lambda.Runtime.NODEJS_22_X,
    environment: config.environment,
  });

  config.grantFn(fn);

  const ds = api.addLambdaDataSource(nameStackResource(`${config.name}-ds`), fn);
  ds.createResolver(nameStackResource(`resolver-${config.name}`), {
    typeName: config.typeName,
    fieldName: config.fieldName,
    requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
    responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
  });

  return { fn, ds };
}

// ══════════════════════════════════════════════════════════════════════════════
// Lambda Resolvers
// ══════════════════════════════════════════════════════════════════════════════

interface LambdaResolversProps {
  api: appsync.GraphqlApi;
  table: Table;
  userPool: UserPool;
}

/**
 * Lambda-backed resolvers for operations requiring complex logic:
 * - User queries: Cognito lookups (getUser, getUsers, searchUsers)
 * - Friend mutations: Transactional DynamoDB operations
 */
export class LambdaResolvers extends Construct {
  constructor(scope: Construct, id: string, { api, table, userPool }: LambdaResolversProps) {
    super(scope, id);

    const lambdaDir = path.join(__dirname, '../../lambda');

    // User queries — single Lambda handles getUser, getUsers, searchUsers
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

    const usersDs = api.addLambdaDataSource(nameStackResource('users-ds'), usersLambda);

    // Attach resolvers for all user queries
    ['getUser', 'getUsers', 'searchUsers'].forEach(fieldName => {
      usersDs.createResolver(nameStackResource(`resolver-${fieldName}`), {
        typeName: 'Query',
        fieldName,
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
      });
    });

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
  }
}
