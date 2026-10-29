import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { AdminActionButton } from './AdminActionButton';

export const AdminDeleteConfirmModal = ({ title, onDelete }: { title: string; onDelete: () => void }) => {
  return (
    <DialogContent className="max-h-[calc(100dvh-32px)] w-[440px] max-w-[calc(100vw-32px)] gap-6 overflow-y-auto max-sm:p-5 max-sm:pt-12">
      <DialogTitle className="text-center text-lg font-semibold text-gray-800">{title}</DialogTitle>
      <div className="flex justify-center gap-4">
        <DialogClose asChild>
          <AdminActionButton variant={'outline'} size={'lg'} className="rounded-full">
            {'닫기'}
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton variant={'destructive'} size={'lg'} className="rounded-full" onClick={onDelete}>
          {'삭제'}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};
