import { ReactNode } from 'react';
import { AdminCardCreateButton } from './AdminCard';

interface AdminHeaderProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  children?: ReactNode;
  onButtonClick?: () => void;
}

export const AdminHeader = ({ title, description, buttonLabel, children, onButtonClick }: AdminHeaderProps) => {
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="text-2xl leading-8 font-semibold break-keep text-neutral-900">{title}</h2>
        {description && <p className="text-sm leading-6 break-keep text-neutral-600">{description}</p>}
      </div>
      {buttonLabel && onButtonClick && (
        <AdminCardCreateButton onClick={onButtonClick}>{buttonLabel}</AdminCardCreateButton>
      )}
      {children && children}
    </div>
  );
};
