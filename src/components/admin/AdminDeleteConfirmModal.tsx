import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { AdminActionButton } from './AdminActionButton';
import { AdminFormError } from './AdminFormError';

export const AdminDeleteConfirmModal = ({
  title,
  description,
  onDelete,
  isPending = false,
  isError = false,
}: {
  title: string;
  description?: string;
  onDelete: () => void;
  isPending?: boolean;
  isError?: boolean;
}) => {
  return (
    <DialogContent appearance="admin" className="w-[440px] gap-6" closeDisabled={isPending}>
      <DialogTitle className="text-center text-lg font-semibold text-gray-800">{title}</DialogTitle>
      {description && <p className="text-sm leading-6 break-words text-neutral-600">{description}</p>}
      <AdminFormError message={isError ? '삭제에 실패했어요. 다시 시도해주세요.' : undefined} />
      <div className="flex flex-wrap justify-end gap-3">
        <DialogClose asChild>
          <AdminActionButton variant={'outline'} size={'lg'} disabled={isPending}>
            {'닫기'}
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton
          variant={'destructive'}
          size={'lg'}
          onClick={onDelete}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? '삭제 중…' : '삭제'}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};
