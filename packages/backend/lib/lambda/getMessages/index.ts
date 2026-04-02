import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

export const handler = async (event: {
  arguments: { chatId: string; nextToken?: string };
  identity: { username: string };
}) => {
  const { chatId, nextToken } = event.arguments;
  const userId = event.identity.username;

  // Verify caller is a member of this chat
  const { Item } = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `USER#${userId}`, SK: `CHAT#${chatId}` }),
  }));
  if (!Item) throw new Error('Not a member of this chat');

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

  if (nextToken) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
  }

  const { Items = [], LastEvaluatedKey } = await dynamo.send(new QueryCommand(params));

  const messages = await Promise.all(Items.map(async item => {
    const raw = unmarshall(item);
    let attachments: string[] = raw.attachments ?? [];

    // Generate pre-signed GET URLs for attachments
    if (attachments.length > 0 && BUCKET_NAME) {
      console.log('Generating pre-signed URLs for:', attachments);
      attachments = await Promise.all(attachments.map(key =>
        getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }), { expiresIn: 3600 })
      ));
      console.log('Generated URLs:', attachments);
    }

    return {
      chatId: raw.chatId,
      messageId: raw.messageId,
      senderId: raw.senderId,
      recipientId: raw.recipientId,
      type: raw.type,
      content: raw.content,
      attachments,
      translations: typeof raw.translations === 'string' ? JSON.parse(raw.translations) : (raw.translations ?? {}),
      createdAt: raw.createdAt,
    };
  }));

  return {
    messages,
    nextToken: LastEvaluatedKey
      ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
      : null,
  };
};
