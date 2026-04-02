import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import nameResource, { nameStackResource } from '../../utils/name-resource';

interface LambdaResolverConfig {
  /** Unique name used to derive consistent resource IDs (Lambda, data source, resolver). */
  name: string;
  /** Path to the Lambda handler source file. */
  entry: string;
  /** GraphQL type this resolver attaches to. */
  typeName: 'Query' | 'Mutation';
  /** GraphQL field name this resolver handles (e.g. 'sendMessage'). */
  fieldName: string;
  /** Environment variables passed to the Lambda (e.g. TABLE_NAME, BUCKET_NAME). */
  environment: Record<string, string>;
  /** Callback to grant IAM permissions to the Lambda — keeps the factory generic
   *  while letting each caller specify exactly what access their Lambda needs. */
  grantFn: (fn: lambda.IFunction) => void;
}

/**
 * Factory that wires a Lambda function to an AppSync GraphQL field.
 *
 * For each call it: creates a Lambda, applies IAM permissions via grantFn,
 * registers it as an AppSync data source, and creates a resolver that forwards
 * the full GraphQL context to the Lambda and returns its response.
 *
 * Returns { fn, ds } so callers can reuse the data source for additional
 * resolvers on the same Lambda (e.g. one Lambda handling both a Query and Mutation).
 */
export function createLambdaResolver(
  scope: Construct,
  api: appsync.GraphqlApi,
  config: LambdaResolverConfig
) {
  // Create the Lambda function (log group auto-created by Lambda to avoid conflicts)
  const fn = new lambdaNodejs.NodejsFunction(scope, nameStackResource(`${config.name}-fn`), {
    functionName: nameResource(`${config.name}-fn`),
    entry: config.entry,
    runtime: lambda.Runtime.NODEJS_22_X,
    environment: config.environment,
  });

  // Apply caller-defined IAM permissions (e.g. DynamoDB access, S3, Translate)
  config.grantFn(fn);

  // Register Lambda as an AppSync data source and create the resolver.
  // Uses built-in VTL templates: lambdaRequest() forwards GraphQL context
  // to the Lambda, lambdaResult() passes the Lambda return value back.
  const ds = api.addLambdaDataSource(nameStackResource(`${config.name}-ds`), fn);
  ds.createResolver(nameStackResource(`resolver-${config.name}`), {
    typeName: config.typeName,
    fieldName: config.fieldName,
    requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
    responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
  });

  return { fn, ds };
}