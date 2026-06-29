import { ReactNode } from 'react';

import type { SubmissionDetailResponseDto } from '@dto/submissionDto';

import { formatDateTime } from '../utils/format';
import { SubmissionStatusBadge } from './SubmissionBadges';

/** 상세보기·피드백 Drawer 상단 공통 팀 요약 블록 */
export const SubmissionTeamSummary = ({ detail }: { detail: SubmissionDetailResponseDto }) => {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-darkGray text-xl font-bold">{detail.teamName}</h3>
        <SubmissionStatusBadge status={detail.status} />
      </div>
      <p className="text-midGray mt-1 text-sm">{detail.projectOverview}</p>

      <ul className="mt-4 flex list-disc flex-col gap-2 pl-4 text-sm marker:text-gray-400">
        <InfoRow label="분과" value={detail.trackName} />
        <InfoRow label="제출물 항목" value={detail.submissionTypeName} />
        <InfoRow label="제출 마감일시" value={formatDateTime(detail.deadlineAt)} />
        <InfoRow label="최초 제출일시" value={formatDateTime(detail.firstSubmittedAt)} />
        <InfoRow label="최종 제출일시" value={formatDateTime(detail.lastModifiedAt)} />
      </ul>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <li>
      <span className="text-darkGray font-semibold">{label}</span> <span className="text-gray-600">{value}</span>
    </li>
  );
};
