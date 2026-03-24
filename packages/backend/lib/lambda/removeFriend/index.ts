import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: {
  arguments: { friendId: string };
  identity: { username: string };
}) => {
  const callerId = event.identity.username;
  const { friendId } = event.arguments;

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

  return true;
};
