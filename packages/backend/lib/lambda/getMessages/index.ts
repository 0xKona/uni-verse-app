import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: {
  arguments: { chatId: string; nextToken?: string };
  identity: { username: string };
}) => {
  const { chatId, nextToken } = event.arguments;

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

  const messages = Items.map(item => {
    const raw = unmarshall(item);
    return {
      chatId: raw.chatId,
      messageId: raw.messageId,
      senderId: raw.senderId,
      recipientId: raw.recipientId,
      type: raw.type,
      content: raw.content,
      attachments: raw.attachments ?? [],
      translations: typeof raw.translations === 'string' ? raw.translations : JSON.stringify(raw.translations ?? {}),
      createdAt: raw.createdAt,
    };
  });

  return {
    messages,
    nextToken: LastEvaluatedKey
      ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
      : null,
  };
};
