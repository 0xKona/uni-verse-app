import { typedQuery } from './client';
import type { User } from '@/types/friends';

// GraphQL operations

export const getUserQuery = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) { id username email avatarUrl }
  }
`;

export const getUsersQuery = /* GraphQL */ `
  query GetUsers($ids: [ID!]!) {
    getUsers(ids: $ids) { id username email avatarUrl }
  }
`;

export const searchUsersQuery = /* GraphQL */ `
  query SearchUsers($query: String!) {
    searchUsers(query: $query) { id username email avatarUrl }
  }
`;

// Typed functions

export const fetchUser = (id: string) => typedQuery<User | null>(getUserQuery, { id }, 'getUser');
export const fetchUsers = (ids: string[]) => typedQuery<User[]>(getUsersQuery, { ids }, 'getUsers');
export const searchUsers = (query: string) => typedQuery<User[]>(searchUsersQuery, { query }, 'searchUsers');
