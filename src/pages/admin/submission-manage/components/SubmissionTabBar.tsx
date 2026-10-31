import { AdminTabs } from '@components/admin/AdminTabs';
import { SUBMISSION_TABS } from '@constants/submission';
import type { SubmissionTabKey } from '../types/submission';

interface SubmissionTabBarProps {
  activeTab: SubmissionTabKey;
  onChange: (tab: SubmissionTabKey) => void;
}

export const SubmissionTabBar = ({ activeTab, onChange }: SubmissionTabBarProps) => {
  return <AdminTabs label="제출 자료 보기" tabs={SUBMISSION_TABS} activeTab={activeTab} onChange={onChange} />;
};
