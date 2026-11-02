import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

export const AdminPopoverMenu = ({ children, ...props }: React.ComponentProps<'div'>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="항목 작업"
          className="hover:bg-whiteGray focus-visible:outline-mainBlue flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <EllipsisVertical size={18} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={16} className="w-32 p-1.5">
        <div className="flex flex-col gap-1" {...props}>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const AdminPopoverEditButton = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <button
      type="button"
      className="hover:bg-whiteGray focus-visible:bg-whiteGray focus-visible:outline-mainBlue flex min-h-11 items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-neutral-700 focus-visible:outline-2"
      onClick={onEdit}
    >
      <Pencil size={16} aria-hidden />
      수정
    </button>
  );
};

export const AdminPopoverDeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button
      type="button"
      className="focus-visible:outline-destructive text-destructive flex min-h-11 items-center gap-2.5 rounded-sm px-3 py-2 text-sm hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-2"
      onClick={onDelete}
    >
      <Trash2 size={16} aria-hidden />
      삭제
    </button>
  );
};
