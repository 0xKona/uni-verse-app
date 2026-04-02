import { DynamoDBClient, TransactWriteItemsCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

interface RespondToFriendReqInterface {
  arguments: { senderId: string, accept: boolean};
  identity: { username: string };
}

export const handler = async (event: RespondToFriendReqInterface) => {
  const recipientId = event.identity.username;
  const { senderId, accept } = event.arguments;

  if (accept) {
    // Update the sender's item to ACCEPTED and write a mirrored item under the recipient's PK 
    // so both users appear in each other's friends list.
    await dynamo.send(new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE_NAME,
            Key: marshall({ PK: `USER#${senderId}`, SK: `FRIEND#${recipientId}` }),
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: marshall({ ':status': 'ACCEPTED' }),
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: marshall({
              PK: `USER#${recipientId}`,
              SK: `FRIEND#${senderId}`,
              senderId,
              recipientId,
              status: 'ACCEPTED',
              createdAt: new Date().toISOString(),
            }),
          },
        },
      ],
    }));

    return { senderId, recipientId, status: 'ACCEPTED', createdAt: new Date().toISOString() };
  } else {
    // Decline — delete the item so the sender can resend later
    await dynamo.send(new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: `USER#${senderId}`, SK: `FRIEND#${recipientId}` }),
    }));

    return { senderId, recipientId, status: 'DECLINED', createdAt: new Date().toISOString() };
  }
};
