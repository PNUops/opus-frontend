import React from 'react';
import type { RankingDto } from 'types/DTO/contestsDto';

interface Props {
  items: RankingDto[];
  grouped?: boolean;
}

const trackBadgeClass = (track?: string) => {
  switch (track) {
    case '분과 A':
      return 'bg-yellow-400 text-white';
    case '분과 B':
      return 'bg-sky-400 text-white';
    case '분과 C':
      return 'bg-rose-300 text-white';
    case '분과 D':
      return 'bg-emerald-400 text-white';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const trackHeaderBg = (track?: string) => {
  switch (track) {
    case '분과 A':
      return 'bg-yellow-50';
    case '분과 B':
      return 'bg-sky-50';
    case '분과 C':
      return 'bg-rose-50';
    case '분과 D':
      return 'bg-emerald-50';
    default:
      return 'bg-gray-50';
  }
};

const RankingList: React.FC<Props> = ({ items, grouped = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
        랭킹 데이터가 없습니다.
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white">
        <ul>
          {items.map((it) => (
            <li
              key={`${it.teamId}-${it.rank}`}
              className="flex items-center justify-between border-b border-gray-200 px-6 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-6">
                <div className="w-8 text-center text-sm text-gray-700">{it.rank}</div>
                <div className="min-w-[110px] text-sm text-gray-800">{it.teamName}</div>
                <div className="min-w-[240px] text-sm text-gray-700">{it.projectName}</div>
                <div>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-[6px] text-xs ${trackBadgeClass(
                      it.trackName,
                    )}`}
                  >
                    {it.trackName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-red-500">
                <svg className="h-5 w-5 fill-current text-red-500" viewBox="0 0 24 24">
                  <path d="M12 21s-7-4.35-9.17-6.22C1.78 12.85 2 9.5 4.5 7.5 6.03 6 8.1 6 9.5 6 10.9 6 12 7 12 7s1.1-1 2.5-1c1.4 0 3.47 0 5 1 2.5 2 2.72 5.35 1.67 7.28C19 16.65 12 21 12 21z" />
                </svg>
                <div className="text-sm font-semibold text-gray-800">
                  {it.likeCount?.toLocaleString() ?? 0}
                  <span className="ml-1 text-sm text-gray-500">개</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const groups: Record<string, RankingDto[]> = {};
  const trackOrder: string[] = [];
  items.forEach((it) => {
    const key = it.trackName ?? '기타';
    if (!groups[key]) {
      groups[key] = [];
      trackOrder.push(key);
    }
    groups[key].push(it);
  });

  return (
    <div>
      {trackOrder.map((track) => (
        <div key={track} className="mb-4">
          <div className={`${trackHeaderBg(track)} rounded p-4`}>
            <span
              className={`inline-flex items-center justify-center rounded-full px-3 py-[6px] text-xs ${trackBadgeClass(track)}`}
            >
              {track}
            </span>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white">
            <ul>
              {groups[track].map((it) => (
                <li
                  key={`${it.teamId}-${it.rank}`}
                  className="flex items-center justify-between border-b border-gray-200 px-6 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-8 text-center text-sm text-gray-700">{it.rank}</div>
                    <div className="min-w-[110px] text-sm text-gray-800">{it.teamName}</div>
                    <div className="min-w-[240px] text-sm text-gray-700">{it.projectName}</div>
                  </div>

                  <div className="flex items-center gap-2 text-red-500">
                    <svg className="h-5 w-5 fill-current text-red-500" viewBox="0 0 24 24">
                      <path d="M12 21s-7-4.35-9.17-6.22C1.78 12.85 2 9.5 4.5 7.5 6.03 6 8.1 6 9.5 6 10.9 6 12 7 12 7s1.1-1 2.5-1c1.4 0 3.47 0 5 1 2.5 2 2.72 5.35 1.67 7.28C19 16.65 12 21 12 21z" />
                    </svg>
                    <div className="text-sm font-semibold text-gray-800">
                      {it.likeCount?.toLocaleString() ?? 0}
                      <span className="ml-1 text-sm text-gray-500">개</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingList;
