import { useState } from 'react';

import { AdminHeader } from '@components/admin';

import { SubmissionTabBar } from './components/SubmissionTabBar';
import { SubmissionSettingTab } from './components/SubmissionSettingTab';
import { SubmissionStatusTab } from './components/SubmissionStatusTab';
import { SubmissionDownloadTab } from './components/SubmissionDownloadTab';
import type { SubmissionTabKey } from './types/submission';

const SubmissionManagePage = () => {
  const [activeTab, setActiveTab] = useState<SubmissionTabKey>('setting');

  const handleViewStatus = (_submissionId: number) => {
    // TODO: 선택한 제출물의 제출 현황으로 진입
    setActiveTab('status');
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <AdminHeader title="제출 자료 관리" description="대회별 제출 자료의 설정, 제출 현황, 다운로드를 관리합니다." />

      <SubmissionTabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'setting' && <SubmissionSettingTab onViewStatus={handleViewStatus} />}
      {activeTab === 'status' && <SubmissionStatusTab />}
      {activeTab === 'download' && <SubmissionDownloadTab />}
    </div>
  );
};

export default SubmissionManagePage;
