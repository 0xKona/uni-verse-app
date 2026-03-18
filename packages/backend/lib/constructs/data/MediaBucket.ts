import { Aws, RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MediaBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const corsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
    };

    this.bucket = new Bucket(this, 'Bucket', {
      bucketName: `uni-verse-media-${Aws.ACCOUNT_ID}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [corsRule],
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
