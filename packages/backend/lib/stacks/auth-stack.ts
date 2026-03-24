import { aws_cognito } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import nameResource from '../utils/name-resource';

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // UserPool - Stores User Data
    const userPool = new aws_cognito.UserPool(this, nameResource('cognito-pool'), {
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
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new aws_cognito.UserPoolClient(this, nameResource('user-pool-client'), {
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

    new cdk.CfnOutput(this, nameResource('user-pool-id'), { value: userPool.userPoolId });
    new cdk.CfnOutput(this, nameResource('user-pool-client-id'), { value: userPoolClient.userPoolClientId });
  }
}
