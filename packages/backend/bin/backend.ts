import * as cdk from 'aws-cdk-lib/core';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { DataStack } from '../lib/stacks/data-stack';
import { nameStackResource } from '../lib/utils/name-resource';
import { TranslationStack } from '../lib/stacks/translation-stack';

/*
  This is the entry point for the entire backend application. It loads in the various stacks
  and provides each with any required resources from other stacks
*/

const app = new cdk.App();

const authStack = new AuthStack(app, nameStackResource('auth-stack'), {});

const dataStack = new DataStack(app, nameStackResource('data-stack'), {});

// ApiStack depends on both AuthStack (for Cognito auth) and DataStack (for DynamoDB)
new ApiStack(app, nameStackResource('api-stack'), {
  table: dataStack.table,
  userPool: authStack.userPool,
  mediaBucketName: dataStack.mediaBucket.bucketName,
});

new TranslationStack(app, nameStackResource('translation-stack'), {});
