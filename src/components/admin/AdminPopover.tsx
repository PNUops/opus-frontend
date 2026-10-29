import { VscKebabVertical } from 'react-icons/vsc';
import { LuPencil } from 'react-icons/lu';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

export const AdminPopoverMenu = ({ children, ...props }: React.ComponentProps<'div'>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="항목 작업"
          className="group shrink-0 rounded-4xl px-2 py-2 hover:bg-blue-100 max-lg:min-h-11 max-lg:min-w-11"
        >
          <VscKebabVertical size={16} className="group-hover:fill-mainBlue fill-midGray" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1.5">
        <div className="flex w-[70px] flex-col gap-1" {...props}>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const AdminPopoverEditButton = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <button
      className="hover:bg-whiteGray flex items-center gap-2.5 rounded-sm p-1 text-sm max-lg:min-h-11"
      onClick={onEdit}
    >
      <LuPencil size={16} className="mt-1" />
      수정
    </button>
  );
};

export const AdminPopoverDeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button
      className="hover:bg-whiteGray flex items-center gap-2.5 rounded-sm p-1 text-sm text-red-500 max-lg:min-h-11"
      onClick={onDelete}
    >
      <FaRegTrashAlt size={16} className="mt-1 fill-red-500" />
      삭제
    </button>
  );
};
