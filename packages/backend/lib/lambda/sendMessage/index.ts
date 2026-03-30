import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

interface SendMessageArgs {
  chatId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'GIF' | 'FILE';
  attachments?: string[];
}

export const handler = async (event: {
  arguments: SendMessageArgs;
  identity: { username: string };
}) => {
  const senderId = event.identity.username;
  const { chatId, content, type, attachments } = event.arguments;
  const messageId = randomUUID();
  const now = new Date().toISOString();

  // Get all members of this chat via chatId-index
  // Filter to membership items only (PK starts with USER#), excluding message items
  const { Items: allItems = [] } = await dynamo.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'chatId-index',
    KeyConditionExpression: 'chatId = :cid AND begins_with(PK, :userPrefix)',
    ExpressionAttributeValues: marshall({ ':cid': chatId, ':userPrefix': 'USER#' }),
  }));

  const members = allItems;

  if (members.length === 0) throw new Error('Chat not found');

  // Check sender is a member and chat is not archived
  const senderMembership = members.find(m => unmarshall(m).PK === `USER#${senderId}`);
  if (!senderMembership) throw new Error('Not a member of this chat');
  if (unmarshall(senderMembership).archived) throw new Error('Chat is archived');

  // For DM, find the recipient
  const recipientMembership = members.find(m => unmarshall(m).PK !== `USER#${senderId}`);
  const recipientId = recipientMembership
    ? unmarshall(recipientMembership).PK.replace('USER#', '')
    : senderId;

  // Write message
  const message = {
    PK: `CHAT#${chatId}`,
    SK: `MSG#${now}#${messageId}`,
    chatId,
    messageId,
    senderId,
    recipientId,
    type,
    content,
    ...(attachments?.length ? { attachments } : {}),
    translations: '{}',
    createdAt: now,
  };

  await dynamo.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(message, { removeUndefinedValues: true }),
  }));

  // Update membership items for all members (lastMessage, lastMessageAt)
  // Also update lastReadAt for the sender (they've read their own message)
  const preview = type === 'TEXT' ? content.slice(0, 100) : `[${type}]`;
  await Promise.all(members.map(m => {
    const parsed = unmarshall(m);
    const isSender = parsed.PK === `USER#${senderId}`;
    const updateExpr = isSender
      ? 'SET lastMessage = :msg, lastMessageAt = :ts, lastReadAt = :ts'
      : 'SET lastMessage = :msg, lastMessageAt = :ts';
    return dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: parsed.PK, SK: parsed.SK }),
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: marshall({ ':msg': preview, ':ts': now }),
    }));
  }));

  // Return only fields matching the Message GraphQL type
  return {
    chatId,
    messageId,
    senderId,
    recipientId,
    type,
    content,
    attachments: attachments ?? [],
    translations: '{}',
    createdAt: now,
  };
};
