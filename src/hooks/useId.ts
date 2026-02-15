import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const createNumericIdHook =
  <TKey extends string>(key: TKey) =>
  () => {
    const params = useParams<Record<TKey, string | undefined>>();
    const raw = params[key as keyof typeof params];
    const parsed = Number(raw);
    return !raw || isNaN(parsed) ? null : parsed;
  };

const createNumericIdOrRedirectHook =
  (useIdHook: () => number | null, defaultRedirect: string) =>
  (redirectTo: string = defaultRedirect): number => {
    const navigate = useNavigate();
    const id = useIdHook();

    useEffect(() => {
      if (id === null) {
        navigate(redirectTo, { replace: true });
      }
    }, [id, navigate, redirectTo]);

    return id as number;
  };

export const useTeamId = createNumericIdHook('teamId');

export const useContestId = createNumericIdHook('contestId');

export const useNoticeId = createNumericIdHook('noticeId');

/* NULL 허용하지 않고 리다이렉트 */

export const useTeamIdOrRedirect = createNumericIdOrRedirectHook(useTeamId, '/');

export const useContestIdOrRedirect = createNumericIdOrRedirectHook(useContestId, '/');
