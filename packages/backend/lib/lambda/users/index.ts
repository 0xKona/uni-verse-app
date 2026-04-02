import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.USER_POOL_ID!;

interface User {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

/** Maps Cognito user attributes to our User type */
function mapCognitoUser(username: string, attributes?: { Name?: string; Value?: string }[]): User {
  return {
    id: username,
    username: attributes?.find(a => a.Name === 'preferred_username')?.Value ?? username,
    email: attributes?.find(a => a.Name === 'email')?.Value ?? null,
    avatarUrl: attributes?.find(a => a.Name === 'picture')?.Value ?? null,
  };
}

/** Fetches a single user by Cognito username */
async function getUser(id: string): Promise<User | null> {
  try {
    const result = await client.send(new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: id,
    }));
    return mapCognitoUser(result.Username!, result.UserAttributes);
  } catch {
    return null;
  }
}

/** Fetches multiple users by Cognito usernames */
async function getUsers(ids: string[]): Promise<User[]> {
  const results = await Promise.all(ids.map(getUser));
  return results.filter((u): u is User => u !== null);
}

/** Searches users by preferred_username or email prefix.
 *  Runs both filters in parallel, merges results, deduplicates, and excludes the caller. */
async function searchUsers(query: string, callerId: string): Promise<User[]> {
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

  // Merge, deduplicate, exclude self
  const seen = new Set<string>();
  return [...(byUsername.Users ?? []), ...(byEmail.Users ?? [])]
    .filter(u => {
      if (u.Username === callerId || seen.has(u.Username!)) return false;
      seen.add(u.Username!);
      return true;
    })
    .map(u => mapCognitoUser(u.Username!, u.Attributes));
}

/**
 * Single Lambda handling all user-related queries against Cognito:
 *   - getUser:     fetch one user by Cognito username (AdminGetUser)
 *   - getUsers:    fetch multiple users in parallel by username
 *   - searchUsers: prefix search by preferred_username or email (ListUsers)
 *
 * Routes to the correct function based on event.info.fieldName, which AppSync
 * sets to the GraphQL field that triggered the resolver.
 */
export const handler = async (event: {
  arguments: { id?: string; ids?: string[]; query?: string };
  identity: { username: string };
  info: { fieldName: string };
}) => {
  const { fieldName } = event.info;
  const { id, ids, query } = event.arguments;
  const callerId = event.identity.username;

  switch (fieldName) {
    case 'getUser':
      return id ? getUser(id) : null;
    case 'getUsers':
      return ids ? getUsers(ids) : [];
    case 'searchUsers':
      return query ? searchUsers(query, callerId) : [];
    default:
      throw new Error(`Unknown field: ${fieldName}`);
  }
};
