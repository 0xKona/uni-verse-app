import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDBClient({});
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

interface GetUploadUrlInterface {
  arguments: { chatId: string; fileName: string };
  identity: { username: string };
}

/**
 * Generates a pre-signed S3 PUT URL so the client can upload a file directly to S3.
 *
 * Flow: verifies the caller belongs to the chat, generates a unique message ID and
 * S3 key, then returns a short-lived (5 min) pre-signed URL. The client PUTs the
 * file to that URL, then calls sendMessage with the returned key/messageId to
 * attach it to a chat message.
 */
export const handler = async (event: GetUploadUrlInterface) => {
  const { chatId, fileName } = event.arguments;
  const userId = event.identity.username;

  // Verify caller is a member of this chat
  const { Item } = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `USER#${userId}`, SK: `CHAT#${chatId}` }),
  }));
  if (!Item) throw new Error('Not a member of this chat');

  const messageId = randomUUID();
  const key = `messages/${chatId}/${messageId}/${fileName}`;

  const url = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }), { expiresIn: 300 });

  return JSON.stringify({ url, key, messageId });
};
