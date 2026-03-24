import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.USER_POOL_ID!;

export const handler = async (event: {
  arguments: { query: string };
  identity: { username: string };
}) => {
  const { query } = event.arguments;
  const callerId = event.identity.username;

  // Search by preferred_username (display name set at signup) and email prefix in parallel
  const [byUsername, byEmail] = await Promise.all([
    client.send(new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Filter: `preferred_username ^= "${query}"`,
      Limit: 10,
    })),
    client.send(new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Filter: `email ^= "${query}"`,
      Limit: 10,
    })),
  ]);

  // Merge, deduplicate, and exclude the calling user
  const seen = new Set<string>();
  return [...(byUsername.Users ?? []), ...(byEmail.Users ?? [])]
    .filter(u => {
      if (u.Username === callerId) return false; // exclude self
      if (seen.has(u.Username!)) return false;
      seen.add(u.Username!);
      return true;
    })
    .map(u => ({
      id: u.Username,
      username: u.Attributes?.find(a => a.Name === 'preferred_username')?.Value ?? u.Username,
      email: u.Attributes?.find(a => a.Name === 'email')?.Value ?? null,
    }));
};
