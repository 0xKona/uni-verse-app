import { generateClient } from 'aws-amplify/api';

export const apiClient = generateClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const typedQuery = async <T>(query: string, variables?: Record<string, unknown>, dataKey?: string): Promise<T> => {
  const res = await apiClient.graphql({ query, variables }) as any;
  return dataKey ? res.data[dataKey] : res.data;
};
