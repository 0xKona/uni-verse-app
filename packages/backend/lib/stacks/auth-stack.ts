import { aws_cognito } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // UserPool - Stores User Data
    const userPool = new aws_cognito.UserPool(this, "Uni-Verse-Cognito-Pool", {
      userPoolName: "UniVerseUserPool",
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
  }
}
