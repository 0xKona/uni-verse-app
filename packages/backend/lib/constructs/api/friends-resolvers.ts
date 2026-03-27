import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { nameStackResource } from '../../utils/name-resource';

interface FriendsResolversProps {
  tableDs: appsync.DynamoDbDataSource;
}

export class FriendsResolvers extends Construct {
  constructor(scope: Construct, id: string, { tableDs }: FriendsResolversProps) {
    super(scope, id);

    /*
     * sendFriendRequest — writes a new item with:
     *   PK=USER#<senderId>, SK=FRIEND#<recipientId>
     *   recipientPK/recipientSK — keys for the recipient-index GSI
     *   status=PENDING
     */
    tableDs.createResolver(nameStackResource('resolver-send-friend-request'), {
      typeName: 'Mutation',
      fieldName: 'sendFriendRequest',
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
            "expressionValues": {
              ":accepted": $util.dynamodb.toDynamoDBJson("ACCEPTED")
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    /*
     * getFriends — queries status-index for all ACCEPTED items where PK=USER#<callerId>.
     * Because accept writes a mirrored item under the recipient's PK, both users
     * will find each other with this same query.
     */
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

    /*
     * getPendingRequests — queries recipient-index for PENDING items where
     * recipientPK=USER#<callerId>. Returns all requests sent *to* the calling user.
     */
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
            "expressionValues": {
              ":status": $util.dynamodb.toDynamoDBJson("PENDING")
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    /*
     * getSentRequests — queries the main table by PK=USER#<callerId>,
     * SK begins_with FRIEND#, filtered to PENDING. Returns outgoing requests.
     */
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
            "expressionValues": {
              ":status": $util.dynamodb.toDynamoDBJson("PENDING")
            }
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    /*
     * cancelFriendRequest — deletes the sender's item. Only callable by the sender
     * since PK is scoped to the calling user's identity.
     */
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
      responseMappingTemplate: appsync.MappingTemplate.fromString(`true`),
    });
  }
}
