import { AdminTabs } from '@components/admin/AdminTabs';
import { ROLE_ASSIGNMENT_TABS } from '@constants/roleAssignment';
import type { RoleType } from '../types/roleAssignment';

interface RoleAssignmentTabBarProps {
  activeTab: RoleType;
  onChange: (tab: RoleType) => void;
}

export const RoleAssignmentTabBar = ({ activeTab, onChange }: RoleAssignmentTabBarProps) => {
  return <AdminTabs label="담당 역할" tabs={ROLE_ASSIGNMENT_TABS} activeTab={activeTab} onChange={onChange} />;
};
