import { DynamoDBClient, TransactWriteItemsCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: {
  arguments: { friendId: string };
  identity: { username: string };
}) => {
  const callerId = event.identity.username;
  const { friendId } = event.arguments;

  // Fetch the friend request data before deleting (for subscription payload)
  const getResult = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `USER#${callerId}`, SK: `FRIEND#${friendId}` }),
  }));

  if (!getResult.Item) {
    throw new Error('Friend relationship not found');
  }

  const friendData = unmarshall(getResult.Item);

  // Delete both sides of the friendship atomically so neither user
  // retains a dangling reference to the other.
  await dynamo.send(new TransactWriteItemsCommand({
    TransactItems: [
      {
        Delete: {
          TableName: TABLE_NAME,
          Key: marshall({ PK: `USER#${callerId}`, SK: `FRIEND#${friendId}` }),
        },
      },
      {
        Delete: {
          TableName: TABLE_NAME,
          Key: marshall({ PK: `USER#${friendId}`, SK: `FRIEND#${callerId}` }),
        },
      },
    ],
  }));

  // Return the friend request data for the subscription
  return {
    senderId: friendData.senderId,
    recipientId: friendData.recipientId,
    status: friendData.status,
    createdAt: friendData.createdAt,
  };
};
