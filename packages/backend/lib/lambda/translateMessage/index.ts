import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const translate = new TranslateClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

interface TranslateMessageCommand {
  arguments: { chatId: string; messageId: string; timestamp: string };
  identity: { username: string };
}

export const handler = async (event: TranslateMessageCommand) => {
  const userId = event.identity.username;
  const { chatId, messageId, timestamp } = event.arguments;

  // Get user's language preference
  const { Item: profileItem } = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `USER#${userId}`, SK: 'PROFILE' }),
  }));
  const targetLang = profileItem ? unmarshall(profileItem).language ?? 'en' : 'en';

  // Get the message
  const { Item: msgItem } = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `CHAT#${chatId}`, SK: `MSG#${timestamp}#${messageId}` }),
  }));
  if (!msgItem) throw new Error('Message not found');

  const msg = unmarshall(msgItem);
  const existing: Record<string, string> = typeof msg.translations === 'string'
    ? JSON.parse(msg.translations) : (msg.translations ?? {});

  // If already translated, return cached
  if (existing[targetLang]) {
    return { ...msg, translations: JSON.stringify(existing) };
  }

  // Translate
  const { TranslatedText } = await translate.send(new TranslateTextCommand({
    Text: msg.content,
    SourceLanguageCode: 'auto',
    TargetLanguageCode: targetLang,
  }));

  existing[targetLang] = TranslatedText!;
  const translationsJson = JSON.stringify(existing);

  // Patch the message
  await dynamo.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ PK: `CHAT#${chatId}`, SK: `MSG#${timestamp}#${messageId}` }),
    UpdateExpression: 'SET translations = :t',
    ExpressionAttributeValues: marshall({ ':t': translationsJson }),
  }));

  return {
    chatId: msg.chatId, messageId: msg.messageId, senderId: msg.senderId,
    recipientId: msg.recipientId, type: msg.type, content: msg.content,
    attachments: msg.attachments ?? [], translations: existing,
    createdAt: msg.createdAt,
  };
};
