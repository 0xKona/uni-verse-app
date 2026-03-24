import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';
import nameResource, { nameStackResource } from '../../utils/name-resource';

interface RespondToFriendRequestProps {
  api: appsync.GraphqlApi;
  table: Table;
}

export class RespondToFriendRequest extends Construct {
  constructor(scope: Construct, id: string, { api, table }: RespondToFriendRequestProps) {
    super(scope, id);

    const fn = new lambdaNodejs.NodejsFunction(this, nameStackResource('respond-friend-request-fn'), {
      functionName: nameResource('respond-friend-request-fn'),
      entry: path.join(__dirname, '../../lambda/respondToFriendRequest/index.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: { TABLE_NAME: table.tableName },
    });

    table.grantWriteData(fn);

    const ds = api.addLambdaDataSource(nameStackResource('respond-friend-request-ds'), fn);

    ds.createResolver(nameStackResource('resolver-respond-friend-request'), {
      typeName: 'Mutation',
      fieldName: 'respondToFriendRequest',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });
  }
}
