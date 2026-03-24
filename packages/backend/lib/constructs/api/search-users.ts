import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';
import nameResource, { nameStackResource } from '../../utils/name-resource';

interface SearchUsersProps {
  api: appsync.GraphqlApi;
  userPool: UserPool;
}

export class SearchUsers extends Construct {
  constructor(scope: Construct, id: string, { api, userPool }: SearchUsersProps) {
    super(scope, id);

    /*
     * searchUsers uses a Lambda resolver because user data (username, email)
     * lives in Cognito, not DynamoDB. The Lambda queries the Cognito User Pool
     * directly using the ListUsers API with a filter expression.
     */
    const fn = new lambdaNodejs.NodejsFunction(this, nameStackResource('search-users-fn'), {
      functionName: nameResource('search-users-fn'),
      entry: path.join(__dirname, '../../lambda/searchUsers/index.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    // Grant the Lambda permission to list/search users in the Cognito pool
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ListUsers'],
      resources: [userPool.userPoolArn],
    }));

    const ds = api.addLambdaDataSource(nameStackResource('search-users-ds'), fn);

    ds.createResolver(nameStackResource('resolver-search-users'), {
      typeName: 'Query',
      fieldName: 'searchUsers',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });
  }
}
