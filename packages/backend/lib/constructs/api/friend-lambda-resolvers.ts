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

/** Creates a Lambda-backed AppSync resolver with standard configuration */
function createLambdaResolver(
  scope: Construct,
  api: appsync.GraphqlApi,
  config: LambdaResolverConfig
) {
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

  return fn;
}

// ══════════════════════════════════════════════════════════════════════════════
// Friend Lambda Resolvers
// ══════════════════════════════════════════════════════════════════════════════

interface FriendLambdaResolversProps {
  api: appsync.GraphqlApi;
  table: Table;
  userPool: UserPool;
}

/**
 * Lambda-backed resolvers for friend operations that require complex logic.
 * - searchUsers: Queries Cognito (not DynamoDB)
 * - respondToFriendRequest: Transactional write (update + put)
 * - removeFriend: Transactional delete (both sides)
 */
export class FriendLambdaResolvers extends Construct {
  constructor(scope: Construct, id: string, { api, table, userPool }: FriendLambdaResolversProps) {
    super(scope, id);

    const lambdaDir = path.join(__dirname, '../../lambda');

    // searchUsers — queries Cognito User Pool for users by username/email
    const searchFn = createLambdaResolver(this, api, {
      name: 'search-users',
      entry: path.join(lambdaDir, 'searchUsers/index.ts'),
      typeName: 'Query',
      fieldName: 'searchUsers',
      environment: { USER_POOL_ID: userPool.userPoolId },
      grantFn: (fn) => fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['cognito-idp:ListUsers'],
        resources: [userPool.userPoolArn],
      })),
    });

    // respondToFriendRequest — accept/decline with transactional writes
    createLambdaResolver(this, api, {
      name: 'respond-friend-request',
      entry: path.join(lambdaDir, 'respondToFriendRequest/index.ts'),
      typeName: 'Mutation',
      fieldName: 'respondToFriendRequest',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantWriteData(fn),
    });

    // removeFriend — delete both sides of friendship atomically
    createLambdaResolver(this, api, {
      name: 'remove-friend',
      entry: path.join(lambdaDir, 'removeFriend/index.ts'),
      typeName: 'Mutation',
      fieldName: 'removeFriend',
      environment: { TABLE_NAME: table.tableName },
      grantFn: (fn) => table.grantReadWriteData(fn), // needs read for subscription payload
    });
  }
}
