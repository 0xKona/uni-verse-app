import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketPolicy, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement, AnyPrincipal } from 'aws-cdk-lib/aws-iam';
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
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,   // allow bucket policy to grant public read
        restrictPublicBuckets: false,
      }),
      cors: [corsRule],
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    });

    // Allow public GET on avatars/* so browsers can load avatar images directly
    this.bucket.addToResourcePolicy(new PolicyStatement({
      principals: [new AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [`${this.bucket.bucketArn}/avatars/*`],
    }));
  }
}
