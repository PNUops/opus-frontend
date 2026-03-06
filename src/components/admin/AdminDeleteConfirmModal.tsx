import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { AdminActionButton } from './AdminActionButton';

export const AdminDeleteConfirmModal = ({ title, onDelete }: { title: string; onDelete: () => void }) => {
  return (
    <DialogContent className="gap-6">
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
