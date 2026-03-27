import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import nameResource, { nameStackResource } from '../utils/name-resource';
import { FriendVtlResolvers, FriendLambdaResolvers } from '../constructs/api';

interface ApiStackProps extends cdk.StackProps {
  table: Table;
  userPool: UserPool;
}

/**
 * AppSync GraphQL API stack.
 *
 * Resolver strategy:
 * - VTL resolvers: Simple single-table operations (direct DynamoDB)
 * - Lambda resolvers: Complex logic, transactions, or external services (Cognito)
 *
 * Subscriptions: Handled by @aws_subscribe directive in schema (no resolvers needed)
 */
export class ApiStack extends cdk.Stack {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { table, userPool } = props;

    // GraphQL API with Cognito auth
    this.api = new appsync.GraphqlApi(this, nameStackResource('graphql-api'), {
      name: nameResource('graphql-api'),
      definition: appsync.Definition.fromFile(
        path.join(__dirname, '../graphql/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        },
      },
    });

    // DynamoDB datasource for VTL resolvers
    const tableDs = this.api.addDynamoDbDataSource(nameStackResource('table-ds'), table);

    // Resolvers
    new FriendVtlResolvers(this, nameStackResource('friend-vtl-resolvers'), { tableDs });
    new FriendLambdaResolvers(this, nameStackResource('friend-lambda-resolvers'), {
      api: this.api,
      table,
      userPool,
    });

    // Outputs
    new cdk.CfnOutput(this, nameStackResource('graphql-url'), { value: this.api.graphqlUrl });
    new cdk.CfnOutput(this, nameStackResource('graphql-api-id'), { value: this.api.apiId });
  }
}
