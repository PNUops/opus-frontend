import { VscKebabVertical } from 'react-icons/vsc';
import { LuPencil } from 'react-icons/lu';
import { FaRegTrashAlt } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { DialogClose, DialogContent, DialogTitle } from './dialog';
import Button from '@components/Button';
import { cn } from '@components/lib/utils';

export const AdminCard = ({ children }: React.ComponentProps<'div'>) => {
  return <div className="border-lightGray flex flex-col gap-0.5 rounded-xl border-2">{children}</div>;
};

export const AdminCardTop = ({ children }: React.ComponentProps<'div'>) => {
  return <div className="border-lightGray flex items-center justify-between border-b px-5 py-4">{children}</div>;
};

export const AdminCardCreateButton = ({ children, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button className="text-midGray hover:text-mainBlue rounded-xl px-[15px] py-2.5 font-bold" {...props}>
      {children}
    </button>
  );
};

export const AdminCardRow = ({ children, className }: React.ComponentProps<'div'>) => {
  return <div className={twMerge('flex items-center justify-between px-5 py-3', className)}>{children}</div>;
};

export const AdminPopoverMenu = ({ children, ...props }: React.ComponentProps<'div'>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group rounded-4xl px-2 py-2 hover:bg-blue-100">
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
    <button className="hover:bg-whiteGray flex items-center gap-2.5 rounded-sm p-1 text-sm" onClick={onEdit}>
      <LuPencil size={16} className="mt-1" />
      수정
    </button>
  );
};

export const AdminPopoverDeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button
      className="hover:bg-whiteGray flex items-center gap-2.5 rounded-sm p-1 text-sm text-red-500"
      onClick={onDelete}
    >
      <FaRegTrashAlt size={16} className="mt-1 fill-red-500" />
      삭제
    </button>
  );
};

export const AdminDeleteConfirmModal = ({ title, onDelete }: { title: string; onDelete: () => void }) => {
  return (
    <DialogContent className="gap-6">
      <DialogTitle className="text-center text-lg font-semibold text-gray-800">{title}</DialogTitle>
      <div className="flex justify-center gap-4">
        <DialogClose asChild>
          <Button className="border-lightGray text-midGray rounded-full border px-4 py-2 hover:bg-gray-100">
            {'닫기'}
          </Button>
        </DialogClose>
        <Button className="rounded-full bg-red-700 px-4 py-2" onClick={onDelete}>
          {'삭제'}
        </Button>
      </div>
    </DialogContent>
  );
};

export const AdminNoData = ({ style }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('text-midGray my-10 flex items-center justify-center font-bold', style)}>데이터가 없습니다.</div>
  );
};
