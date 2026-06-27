import { useState } from 'react';

import { AdminHeader } from '@components/admin';

import { SubmissionTabBar } from './components/SubmissionTabBar';
import { SubmissionSettingTab } from './components/SubmissionSettingTab';
import { SubmissionStatusTab } from './components/SubmissionStatusTab';
import { SubmissionDownloadTab } from './components/SubmissionDownloadTab';
import type { SubmissionTabKey } from './types/submission';

const SubmissionManagePage = () => {
  const [activeTab, setActiveTab] = useState<SubmissionTabKey>('setting');
  // "제출 현황 보기"로 진입 시 제출 현황 탭에 적용할 초기 제출물 필터 (제출물 종류명)
  // TODO: API 연동 시 submissionItemId 기준 필터로 전환
  const [statusTypeFilter, setStatusTypeFilter] = useState('');

  const handleViewStatus = (submissionTypeName: string) => {
    setStatusTypeFilter(submissionTypeName);
    setActiveTab('status');
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <AdminHeader title="제출 자료 관리" description="대회별 제출 자료의 설정, 제출 현황, 다운로드를 관리합니다." />

      <SubmissionTabBar
        activeTab={activeTab}
        onChange={(tab) => {
          if (tab !== 'status') setStatusTypeFilter('');
          setActiveTab(tab);
        }}
      />

      {activeTab === 'setting' && <SubmissionSettingTab onViewStatus={handleViewStatus} />}
      {activeTab === 'status' && <SubmissionStatusTab initialTypeFilter={statusTypeFilter} />}
      {activeTab === 'download' && <SubmissionDownloadTab />}
    </div>
  );
};

export default SubmissionManagePage;
