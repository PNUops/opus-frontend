import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { parsePositiveId } from '@utils/id';

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

/** 중복 쿼리와 잘못된 ID는 null로 처리하고, 갱신 시 다른 쿼리는 보존한다. */
export const useSearchParamId = (key: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const values = searchParams.getAll(key);
  const id = values.length === 1 ? parsePositiveId(values[0]) : null;

  const setId = (value: number | null) => {
    if (value !== null && parsePositiveId(value) === null) return;

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === null) next.delete(key);
        else next.set(key, String(value));
        return next;
      },
      { replace: true },
    );
  };

  return [id, setId] as const;
};

/* NULL 허용하지 않고 리다이렉트 */

export const useTeamIdOrRedirect = createNumericIdOrRedirectHook(useTeamId, '/');

export const useContestIdOrRedirect = createNumericIdOrRedirectHook(useContestId, '/');

export const useNoticeIdOrRedirect = createNumericIdOrRedirectHook(useNoticeId, '/');
