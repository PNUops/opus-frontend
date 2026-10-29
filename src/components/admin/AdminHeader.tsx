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
    <div className="flex w-full flex-wrap items-start justify-between gap-4 lg:items-center">
      <div className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-sm leading-6 text-neutral-600 lg:mt-2">{description}</p>}
      </div>
      {buttonLabel && onButtonClick && (
        <AdminCardCreateButton onClick={onButtonClick}>{buttonLabel}</AdminCardCreateButton>
      )}
      {children && children}
    </div>
  );
};
