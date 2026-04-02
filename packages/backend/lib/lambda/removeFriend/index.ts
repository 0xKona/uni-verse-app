import { DynamoDBClient, TransactWriteItemsCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
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

  // Find any DM chat between these users to archive
  const { Items: callerChats = [] } = await dynamo.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    FilterExpression: 'chatType = :dm AND participantId = :pid',
    ExpressionAttributeValues: marshall({
      ':pk': `USER#${callerId}`,
      ':prefix': 'CHAT#',
      ':dm': 'DM',
      ':pid': friendId,
    }),
  }));

  // Build transaction items
  const transactItems: any[] = [
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
  ];

  // Archive chat membership items for both users
  for (const item of callerChats) {
    const chat = unmarshall(item);
    transactItems.push(
      {
        Update: {
          TableName: TABLE_NAME,
          Key: marshall({ PK: `USER#${callerId}`, SK: `CHAT#${chat.chatId}` }),
          UpdateExpression: 'SET archived = :t',
          ExpressionAttributeValues: marshall({ ':t': true }),
        },
      },
      {
        Update: {
          TableName: TABLE_NAME,
          Key: marshall({ PK: `USER#${friendId}`, SK: `CHAT#${chat.chatId}` }),
          UpdateExpression: 'SET archived = :t',
          ExpressionAttributeValues: marshall({ ':t': true }),
        },
      },
    );
  }

  await dynamo.send(new TransactWriteItemsCommand({ TransactItems: transactItems }));

  return {
    senderId: friendData.senderId,
    recipientId: friendData.recipientId,
    status: friendData.status,
    createdAt: friendData.createdAt,
  };
};
