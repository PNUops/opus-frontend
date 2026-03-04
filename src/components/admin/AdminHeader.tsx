import { AdminCardCreateButton } from './AdminCard';

interface AdminHeaderProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export const AdminHeader = ({ title, description, buttonLabel, onButtonClick }: AdminHeaderProps) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <h4 className="text-midGray mt-2 text-sm">{description}</h4>
      </div>
      {buttonLabel && onButtonClick && (
        <AdminCardCreateButton onClick={onButtonClick}>{buttonLabel}</AdminCardCreateButton>
      )}
    </div>
  );
};
