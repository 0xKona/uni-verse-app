import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';
import nameResource, { nameStackResource } from '../../utils/name-resource';

interface RemoveFriendProps {
  api: appsync.GraphqlApi;
  table: Table;
}

export class RemoveFriend extends Construct {
  constructor(scope: Construct, id: string, { api, table }: RemoveFriendProps) {
    super(scope, id);

    const fn = new lambdaNodejs.NodejsFunction(this, nameStackResource('remove-friend-fn'), {
      functionName: nameResource('remove-friend-fn'),
      entry: path.join(__dirname, '../../lambda/removeFriend/index.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: { TABLE_NAME: table.tableName },
    });

    // Needs write access to delete both sides of the friendship
    table.grantWriteData(fn);

    const ds = api.addLambdaDataSource(nameStackResource('remove-friend-ds'), fn);

    ds.createResolver(nameStackResource('resolver-remove-friend'), {
      typeName: 'Mutation',
      fieldName: 'removeFriend',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });
  }
}
