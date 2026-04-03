import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  updateUserAttributes,
  updatePassword,
} from "aws-amplify/auth";

export const register = (email: string, password: string, username: string) =>
  signUp({ username: email, password, options: { userAttributes: { email, preferred_username: username } } });

export const confirm = (email: string, code: string) =>
  confirmSignUp({ username: email, confirmationCode: code });

export const login = (email: string, password: string) =>
  signIn({ username: email, password });

export const logout = () => signOut();

export const getUser = () => getCurrentUser();

export const getSession = () => fetchAuthSession();

export const updateUsername = (username: string) =>
  updateUserAttributes({ userAttributes: { preferred_username: username } });

export const updateAvatarUrl = (url: string) =>
  updateUserAttributes({ userAttributes: { picture: url } });

export const changePassword = (currentPassword: string, newPassword: string) =>
  updatePassword({ oldPassword: currentPassword, newPassword });
