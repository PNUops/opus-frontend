import { useState } from 'react';
import {
  AdminCard,
  AdminCardCreateButton,
  AdminCardTop,
  AdminPopoverMenu,
  AdminCardRow,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { CategoryModal, CategoryDeleteConfirmModal } from './CategoryModal';
import { Dialog, DialogTrigger } from '@components/ui/dialog';

const temp = ['해커톤', '캡스톤', '자유대회'];

const ContestCategorySection = () => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">대회 카테고리</h2>
        <Dialog>
          <DialogTrigger asChild>
            <AdminCardCreateButton>+ 새 카테고리</AdminCardCreateButton>
          </DialogTrigger>
          <CategoryModal type="create" onSubmit={() => {}} />
        </Dialog>
      </AdminCardTop>
      <div className="flex max-h-[300px] flex-col gap-2.5 overflow-y-auto px-2.5">
        {temp.map((item) => (
          <AdminCardRow key={item}>
            <div className="text-midGray font-semibold">{item}</div>
            <AdminPopoverMenu>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
                <CategoryModal type="edit" prevName={item} onSubmit={() => {}} />
              </Dialog>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(false)} />
                <CategoryDeleteConfirmModal categoryName={item} onSubmit={() => {}} />
              </Dialog>
            </AdminPopoverMenu>
          </AdminCardRow>
        ))}
      </div>
    </AdminCard>
  );
};

export default ContestCategorySection;
