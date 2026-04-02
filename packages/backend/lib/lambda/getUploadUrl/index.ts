import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDBClient({});
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

export const handler = async (event: {
  arguments: { chatId: string; fileName: string };
  identity: { username: string };
}) => {
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
