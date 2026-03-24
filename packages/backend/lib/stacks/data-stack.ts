import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { UniVerseTable } from '../constructs/data/uni-verse-table';
import { MediaBucket } from '../constructs/data/media-bucket';
import nameResource, { nameStackResource } from '../utils/name-resource';

export class DataStack extends cdk.Stack {
  public readonly table: Table;
  public readonly mediaBucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { table } = new UniVerseTable(this, nameStackResource('table-construct'));
    const { bucket } = new MediaBucket(this, nameStackResource('bucket-construct'));

    this.table = table;
    this.mediaBucket = bucket;

    new cdk.CfnOutput(this, 'TableName', { value: table.tableName });
    new cdk.CfnOutput(this, 'TableStreamArn', { value: table.tableStreamArn! });
    new cdk.CfnOutput(this, 'MediaBucketName', { value: bucket.bucketName });
  }
}
