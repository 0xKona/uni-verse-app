import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import nameResource, { nameStackResource } from '../../utils/name-resource';
import { isProd } from '../../utils/constants';

export class MediaBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const corsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
    };

    this.bucket = new Bucket(this, nameStackResource('media-bucket'), {
      bucketName: nameResource('media-bucket'),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [corsRule],
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd, // Only auto-delete in non-prod (required for DESTROY)
    });
  }
}
