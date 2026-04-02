import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

interface GetMessagesInterface {
  arguments: { chatId: string; nextToken?: string };
  identity: { username: string };
}

/**
 * Returns paginated message history for a chat (newest first, 50 per page).
 *
 * - Verifies chat membership 
 * - Queries messages by chat partition
 * - Generates pre-signed S3 GET URLs for any attachments
 * - Returns messages with a base64-encoded cursor for the next page for pagination.
 */
export const handler = async (event: GetMessagesInterface) => {
  const { chatId, nextToken } = event.arguments;
  const userId = event.identity.username;

  // Auth check: confirm the caller has a membership item for this chat
  const { Item } = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `USER#${userId}`, SK: `CHAT#${chatId}` }),
  }));
  if (!Item) throw new Error('Not a member of this chat');

  // Query messages: PK = CHAT#<id>, SK starts with MSG# (sorted by timestamp).
  // ScanIndexForward: false returns newest messages first.
  const params: any = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: marshall({
      ':pk': `CHAT#${chatId}`,
      ':prefix': 'MSG#',
    }),
    ScanIndexForward: false,
    Limit: 50,
  };

  // Resume from where the previous page left off (cursor-based pagination)
  if (nextToken) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
  }

  const { Items = [], LastEvaluatedKey } = await dynamo.send(new QueryCommand(params));

  // Transform DynamoDB items into response shape, resolving attachments to signed URLs
  const messages = await Promise.all(Items.map(async item => {
    const raw = unmarshall(item);
    let attachments: string[] = raw.attachments ?? [];

    // Replace S3 keys with time-limited (1 hour) pre-signed GET URLs
    if (attachments.length > 0 && BUCKET_NAME) {
      attachments = await Promise.all(attachments.map(key =>
        getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }), { expiresIn: 3600 })
      ));
    }

    return {
      chatId: raw.chatId,
      messageId: raw.messageId,
      senderId: raw.senderId,
      recipientId: raw.recipientId,
      type: raw.type,
      content: raw.content,
      attachments,
      // Translations may be stored as a JSON string or already an object
      translations: typeof raw.translations === 'string' ? JSON.parse(raw.translations) : (raw.translations ?? {}),
      createdAt: raw.createdAt,
    };
  }));

  return {
    messages,
    // Encode the DynamoDB LastEvaluatedKey as a base64 cursor for the client
    nextToken: LastEvaluatedKey
      ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
      : null,
  };
};
