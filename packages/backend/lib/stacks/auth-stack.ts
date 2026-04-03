import { aws_cognito } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import nameResource, { nameStackResource } from '../utils/name-resource';

export class AuthStack extends cdk.Stack {
  public readonly userPool: aws_cognito.UserPool;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // UserPool - Stores User Data
    const userPool = new aws_cognito.UserPool(this, nameStackResource('cognito-pool'), {
      userPoolName: nameResource('user-pool'),
      selfSignUpEnabled: true,
      autoVerify: {
        email: true, // Ask Users to Confirm sign up via email
      },
      // Verify and recover accounts via a OTP
      accountRecovery: aws_cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: aws_cognito.VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
    });

    const userPoolClient = new aws_cognito.UserPoolClient(this, nameStackResource('user-pool-client'), {
      userPool,
      authFlows: {
        userSrp: true,
      },
      // Secret not generated as cognito communciated directly from public web and mobile apps
      generateSecret: false,
    });

    /*
      Frontend will communicate directly with cognito to authenticate the frontend user.
      They will then be able to interact with the AppSync API. 
    */

    new cdk.CfnOutput(this, nameStackResource('user-pool-id'), { value: userPool.userPoolId });
    new cdk.CfnOutput(this, nameStackResource('user-pool-client-id'), { value: userPoolClient.userPoolClientId });

    this.userPool = userPool;
  }
}
