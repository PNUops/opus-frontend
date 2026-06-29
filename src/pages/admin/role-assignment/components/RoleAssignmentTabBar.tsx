import { cn } from '@components/lib/utils';
import { ROLE_ASSIGNMENT_TABS } from '@constants/roleAssignment';
import type { RoleType } from '../types/roleAssignment';

interface RoleAssignmentTabBarProps {
  activeTab: RoleType;
  onChange: (tab: RoleType) => void;
}

export const RoleAssignmentTabBar = ({ activeTab, onChange }: RoleAssignmentTabBarProps) => {
  return (
    <div className="border-lightGray flex items-center gap-6 border-b">
      {ROLE_ASSIGNMENT_TABS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              '-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors',
              isActive ? 'border-mainBlue text-mainBlue' : 'text-midGray hover:text-darkGray border-transparent',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
