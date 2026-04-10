import { queryOptions } from '@tanstack/react-query';
import { getMyAccount } from '@apis/member';

export const MY_ACCOUNT_QUERY_KEY = ['account', 'me'] as const;

export const myAccountOption = () => {
  return queryOptions({
    queryKey: MY_ACCOUNT_QUERY_KEY,
    queryFn: getMyAccount,
  });
};
