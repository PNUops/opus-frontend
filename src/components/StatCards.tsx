import React from 'react';

interface StatCardItem {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardItem & { variant?: 'default' | 'green' }> = ({
  title,
  value,
  subtitle,
  variant = 'default',
}) => (
  <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold ${variant === 'green' ? 'text-3xl text-green-600' : 'text-black'}`}>{value}</p>
    {subtitle ? <p className="text-xs text-gray-400">{subtitle}</p> : null}
  </div>
);

const StatCards: React.FC<{ items: StatCardItem[]; variant?: 'default' | 'green' }> = ({
  items,
  variant = 'default',
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <StatCard key={it.title} {...it} variant={variant} />
      ))}
    </div>
  );
};

export default StatCards;
