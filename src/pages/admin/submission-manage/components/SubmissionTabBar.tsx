import { cn } from '@components/lib/utils';
import { SUBMISSION_TABS } from '@constants/submission';
import type { SubmissionTabKey } from '../types/submission';

interface SubmissionTabBarProps {
  activeTab: SubmissionTabKey;
  onChange: (tab: SubmissionTabKey) => void;
}

export const SubmissionTabBar = ({ activeTab, onChange }: SubmissionTabBarProps) => {
  return (
    <div className="border-lightGray flex items-center gap-6 border-b">
      {SUBMISSION_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
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
