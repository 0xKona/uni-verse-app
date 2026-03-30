import { DynamoDBClient, QueryCommand, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: {
  arguments: { participantId: string };
  identity: { username: string };
}) => {
  const userId = event.identity.username;
  const { participantId } = event.arguments;

  if (userId === participantId) throw new Error('Cannot create a chat with yourself');

  // Check if a DM already exists between these users
  const { Items = [] } = await dynamo.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    FilterExpression: 'chatType = :dm AND participantId = :pid',
    ExpressionAttributeValues: marshall({
      ':pk': `USER#${userId}`,
      ':prefix': 'CHAT#',
      ':dm': 'DM',
      ':pid': participantId,
    }),
  }));

  if (Items.length > 0) {
    const existing = unmarshall(Items[0]);

    // If archived (unfriended then re-added), unarchive for both users
    if (existing.archived) {
      await dynamo.send(new TransactWriteItemsCommand({
        TransactItems: [
          {
            Update: {
              TableName: TABLE_NAME,
              Key: marshall({ PK: `USER#${userId}`, SK: `CHAT#${existing.chatId}` }),
              UpdateExpression: 'SET archived = :f',
              ExpressionAttributeValues: marshall({ ':f': false }),
            },
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: marshall({ PK: `USER#${participantId}`, SK: `CHAT#${existing.chatId}` }),
              UpdateExpression: 'SET archived = :f',
              ExpressionAttributeValues: marshall({ ':f': false }),
            },
          },
        ],
      }));
      return { ...existing, archived: false };
    }

    return existing;
  }

  // Create new chat
  const chatId = randomUUID();
  const now = new Date().toISOString();

  await dynamo.send(new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: marshall({
            PK: `USER#${userId}`,
            SK: `CHAT#${chatId}`,
            chatId,
            chatType: 'DM',
            participantId,
            lastMessage: null,
            lastMessageAt: null,
            lastReadAt: now,
            archived: false,
          }),
        },
      },
      {
        Put: {
          TableName: TABLE_NAME,
          Item: marshall({
            PK: `USER#${participantId}`,
            SK: `CHAT#${chatId}`,
            chatId,
            chatType: 'DM',
            participantId: userId,
            lastMessage: null,
            lastMessageAt: null,
            lastReadAt: now,
            archived: false,
          }),
        },
      },
    ],
  }));

  return { chatId, chatType: 'DM', participantId, lastMessage: null, lastMessageAt: null, lastReadAt: now, archived: false };
};
