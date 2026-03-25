#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { DataStack } from '../lib/stacks/data-stack';
import { nameStackResource } from '../lib/utils/name-resource';
import { TranslationStack } from '../lib/stacks/translation-stack';

const app = new cdk.App();

const authStack = new AuthStack(app, nameStackResource('auth-stack'), {});

const dataStack = new DataStack(app, nameStackResource('data-stack'), {});

// ApiStack depends on both AuthStack (for Cognito auth) and DataStack (for DynamoDB)
new ApiStack(app, nameStackResource('api-stack'), {
  table: dataStack.table,
  userPool: authStack.userPool,
});

new TranslationStack(app, nameStackResource('translation-stack'), {});
