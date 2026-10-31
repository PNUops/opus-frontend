import { cn } from '@utils/classname';

export const AdminTabs = <T extends string>({
  label,
  tabs,
  activeTab,
  onChange,
}: {
  label: string;
  tabs: readonly { key: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}) => (
  <div aria-label={label} role="group" className="border-lightGray flex flex-wrap items-center gap-6 border-b">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        aria-pressed={tab.key === activeTab}
        onClick={() => onChange(tab.key)}
        className={cn(
          'focus-visible:outline-mainBlue -mb-px min-h-11 border-b-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
          tab.key === activeTab
            ? 'border-mainBlue text-mainBlue'
            : 'border-transparent text-neutral-600 hover:text-neutral-900',
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
