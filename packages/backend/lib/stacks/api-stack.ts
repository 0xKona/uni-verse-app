import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import nameResource, { nameStackResource } from '../utils/name-resource';
import { FriendsResolvers } from '../constructs/api/friends-resolvers';
import { FriendsSubscriptions } from '../constructs/api/friends-subscriptions';
import { SearchUsers } from '../constructs/api/search-users';
import { RespondToFriendRequest } from '../constructs/api/respond-to-friend-request';
import { RemoveFriend } from '../constructs/api/remove-friend';

interface ApiStackProps extends cdk.StackProps {
  table: Table;
  userPool: UserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { table, userPool } = props;

    // AppSync GraphQL API — authenticated via Cognito User Pool
    const api = new appsync.GraphqlApi(this, nameStackResource('graphql-api'), {
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

    const tableDs = api.addDynamoDbDataSource(nameStackResource('table-ds'), table);

    new FriendsResolvers(this, nameStackResource('friends-resolvers'), { tableDs });
    new FriendsSubscriptions(this, nameStackResource('friends-subscriptions'));
    new SearchUsers(this, nameStackResource('search-users'), { api, userPool });
    new RespondToFriendRequest(this, nameStackResource('respond-to-friend-request'), { api, table });
    new RemoveFriend(this, nameStackResource('remove-friend'), { api, table });

    new cdk.CfnOutput(this, nameStackResource('graphql-url'), { value: api.graphqlUrl });
    new cdk.CfnOutput(this, nameStackResource('graphql-api-id'), { value: api.apiId });
  }
}
