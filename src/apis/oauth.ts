import apiClient from './apiClient';

export const postSetOAuthRedirect = async (type: string) => {
  await apiClient.post('/oauth2/set-redirect', null, {
    params: { type },
  });
};
