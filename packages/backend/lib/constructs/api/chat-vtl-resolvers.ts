import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { nameStackResource } from '../../utils/name-resource';

interface ChatVtlResolversProps {
  tableDs: appsync.DynamoDbDataSource;
}

/**
 * VTL (DynamoDB direct) resolvers for simple chat operations.
 */
export class ChatVtlResolvers extends Construct {
  constructor(scope: Construct, id: string, { tableDs }: ChatVtlResolversProps) {
    super(scope, id);

    this.createGetChats(tableDs);
    this.createMarkChatRead(tableDs);
  }

  /** Returns all chats for the current user. */
  private createGetChats(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-get-chats'), {
      typeName: 'Query',
      fieldName: 'getChats',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "Query",
          "query": {
            "expression": "PK = :pk AND begins_with(SK, :prefix)",
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
              ":prefix": $util.dynamodb.toDynamoDBJson("CHAT#")
            }
          }
        }
      `),
      // Use built in appSync resolver to return all items. 
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  /** Updates lastReadAt on the caller's chat membership item. */
  private createMarkChatRead(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-mark-chat-read'), {
      typeName: 'Mutation',
      fieldName: 'markChatRead',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "UpdateItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
            "SK": $util.dynamodb.toDynamoDBJson("CHAT#$ctx.args.chatId")
          },
          "update": {
            "expression": "SET lastReadAt = :now",
            "expressionValues": {
              ":now": $util.dynamodb.toDynamoDBJson("$util.time.nowISO8601()")
            }
          }
        }
      `),
      // If the update succeeds, just return true.
      responseMappingTemplate: appsync.MappingTemplate.fromString('true'),
    });
  }
}
