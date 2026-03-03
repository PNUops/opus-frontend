import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import Button from '@components/Button';

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
