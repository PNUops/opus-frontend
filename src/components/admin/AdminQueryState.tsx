import { ReactNode } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { AdminActionButton } from './AdminActionButton';

/** Suspense를 사용하지 않는 관리자 목록도 조회 중·실패·빈 결과를 구분합니다. */
export const AdminQueryState = ({
  query,
  children,
}: {
  query: Pick<UseQueryResult, 'isPending' | 'isError' | 'refetch'>;
  children: ReactNode;
}) => {
  if (query.isPending)
    return (
      <p role="status" className="py-10 text-center text-sm text-neutral-600">
        목록을 불러오고 있어요.
      </p>
    );
  if (query.isError)
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p role="alert" className="text-destructive text-sm leading-6">
          목록을 불러오지 못했어요.
        </p>
        <AdminActionButton variant="outline" onClick={() => void query.refetch()}>
          다시 시도
        </AdminActionButton>
      </div>
    );
  return children;
};
