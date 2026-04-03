import { typedQuery } from './client';
import type { UserProfile } from '@/types/messaging';

// GraphQL operations

export const getUserProfileQuery = /* GraphQL */ `
  query GetUserProfile {
    getUserProfile { language translationEnabled }
  }
`;

export const setUserProfileMutation = /* GraphQL */ `
  mutation SetUserProfile($language: String!, $translationEnabled: Boolean!) {
    setUserProfile(language: $language, translationEnabled: $translationEnabled) { language translationEnabled }
  }
`;

export const getAvatarUploadUrlMutation = /* GraphQL */ `
  mutation GetAvatarUploadUrl($fileName: String!) {
    getAvatarUploadUrl(fileName: $fileName)
  }
`;

// Typed functions

export const fetchUserProfile = () => typedQuery<UserProfile>(getUserProfileQuery, undefined, 'getUserProfile');
export const setUserProfile = (vars: { language: string; translationEnabled: boolean }) => typedQuery<UserProfile>(setUserProfileMutation, vars, 'setUserProfile');
export const fetchAvatarUploadUrl = (fileName: string) => typedQuery<string>(getAvatarUploadUrlMutation, { fileName }, 'getAvatarUploadUrl');
