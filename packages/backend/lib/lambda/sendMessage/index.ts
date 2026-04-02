import {
  DynamoDBClient,
  BatchGetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDBClient({});
const translate = new TranslateClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

interface SendMessageArgs {
  chatId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'GIF' | 'FILE';
  attachments?: string[];
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const { TranslatedText } = await translate.send(new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
  }));
  return TranslatedText!;
}

export const handler = async (event: {
  arguments: SendMessageArgs;
  identity: { username: string };
}) => {
  const senderId = event.identity.username;
  const { chatId, content, type, attachments } = event.arguments;
  const messageId = randomUUID();
  const now = new Date().toISOString();

  // Get all members of this chat
  const { Items: members = [] } = await dynamo.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'chatId-index',
    KeyConditionExpression: 'chatId = :cid AND begins_with(PK, :userPrefix)',
    ExpressionAttributeValues: marshall({ ':cid': chatId, ':userPrefix': 'USER#' }),
  }));

  if (members.length === 0) throw new Error('Chat not found');

  const senderMembership = members.find(m => unmarshall(m).PK === `USER#${senderId}`);
  if (!senderMembership) throw new Error('Not a member of this chat');
  if (unmarshall(senderMembership).archived) throw new Error('Chat is archived');

  const recipientMembership = members.find(m => unmarshall(m).PK !== `USER#${senderId}`);
  const recipientId = recipientMembership
    ? unmarshall(recipientMembership).PK.replace('USER#', '')
    : senderId;

  // Fetch profiles for all participants to check translation preferences
  const memberIds = members.map(m => unmarshall(m).PK.replace('USER#', ''));
  const profileKeys = memberIds.map(id => marshall({ PK: `USER#${id}`, SK: 'PROFILE' }));

  const translations: Record<string, string> = {};

  if (type === 'TEXT' && profileKeys.length > 0) {
    const { Responses } = await dynamo.send(new BatchGetItemCommand({
      RequestItems: { [TABLE_NAME]: { Keys: profileKeys } },
    }));

    const profiles = (Responses?.[TABLE_NAME] ?? []).map(i => unmarshall(i));
    const senderProfile = profiles.find(p => p.PK === `USER#${senderId}`);
    const senderLang = senderProfile?.language ?? 'en';

    // Find unique target languages from participants with translation enabled
    const targetLangs = new Set<string>();
    for (const profile of profiles) {
      if (profile.translationEnabled && profile.language && profile.language !== senderLang) {
        targetLangs.add(profile.language);
      }
    }

    // Translate to each target language
    await Promise.all([...targetLangs].map(async (lang) => {
      try {
        translations[lang] = await translateText(content, senderLang, lang);
      } catch (err) {
        console.error(`Translation to ${lang} failed:`, err);
      }
    }));
  }

  const translationsJson = JSON.stringify(translations);

  // Write message
  await dynamo.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall({
      PK: `CHAT#${chatId}`,
      SK: `MSG#${now}#${messageId}`,
      chatId,
      messageId,
      senderId,
      recipientId,
      type,
      content,
      ...(attachments?.length ? { attachments } : {}),
      translations: translationsJson,
      createdAt: now,
    }, { removeUndefinedValues: true }),
  }));

  // Update membership items
  const preview = type === 'TEXT' ? content.slice(0, 100) : `[${type}]`;
  await Promise.all(members.map(m => {
    const parsed = unmarshall(m);
    const isSender = parsed.PK === `USER#${senderId}`;
    return dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: parsed.PK, SK: parsed.SK }),
      UpdateExpression: isSender
        ? 'SET lastMessage = :msg, lastMessageAt = :ts, lastReadAt = :ts'
        : 'SET lastMessage = :msg, lastMessageAt = :ts',
      ExpressionAttributeValues: marshall({ ':msg': preview, ':ts': now }),
    }));
  }));

  return {
    chatId, messageId, senderId, recipientId, type, content,
    attachments: attachments ?? [],
    translations,
    createdAt: now,
  };
};
