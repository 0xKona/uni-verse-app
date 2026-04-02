import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

const DEFAULTS = { language: 'en', translationEnabled: false };

interface UserProfileInterface {
  arguments: { language?: string; translationEnabled?: boolean };
  identity: { username: string };
  info: { fieldName: string };
}

export const handler = async (event: UserProfileInterface) => {
  const userId = event.identity.username;
  const key = marshall({ PK: `USER#${userId}`, SK: 'PROFILE' });

  if (event.info.fieldName === 'getUserProfile') {
    const { Item } = await dynamo.send(new GetItemCommand({ TableName: TABLE_NAME, Key: key }));
    return Item ? unmarshall(Item) : DEFAULTS;
  }

  // setUserProfile
  const { language, translationEnabled } = event.arguments;
  const item = {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
    language: language ?? DEFAULTS.language,
    translationEnabled: translationEnabled ?? DEFAULTS.translationEnabled,
  };

  await dynamo.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(item) }));
  return item;
};
