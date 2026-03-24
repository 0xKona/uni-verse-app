#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { DataStack } from '../lib/stacks/data-stack';
import { ModerationStack } from '../lib/stacks/moderation-stack';
import nameResource from '../lib/utils/name-resource';
import { TranslationStack } from '../lib/stacks/translation-stack';

const app = new cdk.App();
new AuthStack(app, nameResource('auth-stack'), {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new ApiStack(app, nameResource('api-stack'), {});

new DataStack(app, nameResource('data-stack'), {});

new ModerationStack(app, nameResource('moderation-stack'), {});

new TranslationStack(app, nameResource('translation-stack'), {});
