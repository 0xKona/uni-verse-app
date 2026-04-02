import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { nameStackResource } from '../../utils/name-resource';

interface FriendVtlResolversProps {
  tableDs: appsync.DynamoDbDataSource;
}

/**
 * VTL (DynamoDB direct) resolvers for simple friend operations.
 */
export class FriendVtlResolvers extends Construct {
  constructor(scope: Construct, id: string, { tableDs }: FriendVtlResolversProps) {
    super(scope, id);

    this.createSendFriendRequest(tableDs);
    this.createGetFriends(tableDs);
    this.createGetPendingRequests(tableDs);
    this.createGetSentRequests(tableDs);
    this.createCancelFriendRequest(tableDs);
  }

  /** Creates a PENDING friend request. Fails if already ACCEPTED. */
  private createSendFriendRequest(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-send-friend-request'), {
      typeName: 'Mutation',
      fieldName: 'sendFriendRequest',
      /*
        item stored under senders partition. keyed by the recipient. 
        If connor sends a request to alice, the key is PK = "USER#connor",
        SK = "FRIEND#alice".
      */
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($senderId = $ctx.identity.username)
        #set($recipientId = $ctx.args.recipientId)
        {
          "version": "2017-02-28",
          "operation": "PutItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("USER#$senderId"),
            "SK": $util.dynamodb.toDynamoDBJson("FRIEND#$recipientId")
          },
          "attributeValues": {
            "recipientPK": $util.dynamodb.toDynamoDBJson("USER#$recipientId"),
            "recipientSK": $util.dynamodb.toDynamoDBJson("FRIEND#$senderId"),
            "senderId": $util.dynamodb.toDynamoDBJson("$senderId"),
            "recipientId": $util.dynamodb.toDynamoDBJson("$recipientId"),
            "status": $util.dynamodb.toDynamoDBJson("PENDING"),
            "createdAt": $util.dynamodb.toDynamoDBJson("$util.time.nowISO8601()")
          },
          "condition": {
            "expression": "attribute_not_exists(PK) OR #status <> :accepted",
            "expressionNames": { "#status": "status" },
            "expressionValues": { ":accepted": $util.dynamodb.toDynamoDBJson("ACCEPTED") }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }

  /** Returns all ACCEPTED friends via status-index GSI. */
  private createGetFriends(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-get-friends'), {
      typeName: 'Query',
      fieldName: 'getFriends',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "Query",
          "index": "status-index",
          "query": {
            "expression": "PK = :pk AND #status = :status",
            "expressionNames": { "#status": "status" },
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
              ":status": $util.dynamodb.toDynamoDBJson("ACCEPTED")
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  /** Returns PENDING requests sent TO the caller via recipient-index GSI. */
  private createGetPendingRequests(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-get-pending-requests'), {
      typeName: 'Query',
      fieldName: 'getPendingRequests',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "Query",
          "index": "recipient-index",
          "query": {
            "expression": "recipientPK = :pk AND begins_with(recipientSK, :prefix)",
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
              ":prefix": $util.dynamodb.toDynamoDBJson("FRIEND#")
            }
          },
          "filter": {
            "expression": "#status = :status",
            "expressionNames": { "#status": "status" },
            "expressionValues": { ":status": $util.dynamodb.toDynamoDBJson("PENDING") }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  /** Returns PENDING requests sent BY the caller. */
  private createGetSentRequests(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-get-sent-requests'), {
      typeName: 'Query',
      fieldName: 'getSentRequests',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "Query",
          "query": {
            "expression": "PK = :pk AND begins_with(SK, :prefix)",
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
              ":prefix": $util.dynamodb.toDynamoDBJson("FRIEND#")
            }
          },
          "filter": {
            "expression": "#status = :status",
            "expressionNames": { "#status": "status" },
            "expressionValues": { ":status": $util.dynamodb.toDynamoDBJson("PENDING") }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  /** Deletes a PENDING request sent by the caller. */
  private createCancelFriendRequest(tableDs: appsync.DynamoDbDataSource) {
    tableDs.createResolver(nameStackResource('resolver-cancel-friend-request'), {
      typeName: 'Mutation',
      fieldName: 'cancelFriendRequest',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "DeleteItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("USER#$ctx.identity.username"),
            "SK": $util.dynamodb.toDynamoDBJson("FRIEND#$ctx.args.recipientId")
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString('true'),
    });
  }
}
