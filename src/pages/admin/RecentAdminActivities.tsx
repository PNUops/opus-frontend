import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { AdminActionButton } from '@components/admin';
import { recentAdminActivitiesOption } from '@queries/dashboard';

dayjs.extend(relativeTime);

const RecentAdminActivities = () => {
  const query = useQuery(recentAdminActivitiesOption());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const forbidden = axios.isAxiosError(query.error) && query.error.response?.status === 403;

  return (
    <section
      aria-labelledby="recent-admin-activities-title"
      className="border-lightGray w-full max-w-[720px] rounded-lg border bg-white"
    >
      <h2
        id="recent-admin-activities-title"
        className="border-lightGray border-b px-5 py-4 text-lg font-semibold text-neutral-900"
      >
        최근 관리 이력
      </h2>
      {query.isPending ? (
        <p role="status" className="px-5 py-8 text-sm text-neutral-600">
          관리 이력을 불러오고 있어요.
        </p>
      ) : query.isError ? (
        <div className="flex flex-col items-start gap-3 px-5 py-8">
          <p role="alert" className="text-sm text-neutral-700">
            {forbidden ? '관리 이력을 볼 권한이 없습니다.' : '관리 이력을 불러오지 못했어요.'}
          </p>
          {!forbidden && (
            <AdminActionButton variant="outline" onClick={() => void query.refetch()}>
              다시 시도
            </AdminActionButton>
          )}
        </div>
      ) : query.data.length === 0 ? (
        <p className="px-5 py-8 text-sm text-neutral-600">최근 관리 이력이 없습니다.</p>
      ) : (
        <ul className="divide-lightGray divide-y px-5">
          {query.data.slice(0, 4).map((activity) => {
            const date = dayjs(activity.createdAt);
            return (
              <li key={activity.id} className="flex items-start gap-3 py-4">
                <span className="bg-mainBlue mt-2 size-2 shrink-0 rounded-full" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 font-medium break-words text-neutral-900">{activity.summary}</p>
                  <p className="mt-1 text-xs leading-5 break-words text-neutral-600">
                    대상: {activity.targetName} · 처리: {activity.actorName}
                    {activity.contestName && ` · ${activity.contestName}`}
                  </p>
                </div>
                {date.isValid() && (
                  <time
                    dateTime={activity.createdAt}
                    title={date.format('YYYY.MM.DD HH:mm')}
                    className="shrink-0 text-xs leading-6 text-neutral-600"
                  >
                    {date.locale('ko').from(dayjs(now))}
                  </time>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentAdminActivities;
