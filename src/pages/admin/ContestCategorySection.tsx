import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  AdminCard,
  AdminCardCreateButton,
  AdminCardRow,
  AdminCardTop,
  AdminPopoverDeleteButton,
  AdminPopoverEditButton,
  AdminPopoverMenu,
} from '@components/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { NoData } from '@components/NoData';
import { categoryOption } from '@queries/category';
import QueryWrapper from '@providers/QueryWrapper';
import { CategoryModal, CategoryDeleteConfirmModal } from './CategoryModal';

const ContestCategorySection = () => {
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">대회 카테고리</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <AdminCardCreateButton>+ 새 카테고리</AdminCardCreateButton>
          </DialogTrigger>
          <CategoryModal type="create" closeModal={() => setCreateOpen(false)} />
        </Dialog>
      </AdminCardTop>
      <div className="flex max-h-[300px] flex-col gap-2.5 overflow-y-auto px-2.5">
        <QueryWrapper loadingStyle="h-50 rounded-lg" errorStyle="h-50">
          <CategoryList />
        </QueryWrapper>
      </div>
    </AdminCard>
  );
};

export default ContestCategorySection;

const CategoryList = () => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: categories } = useSuspenseQuery(categoryOption());

  if (categories.length === 0) return <NoData />;

  return categories.map((category) => (
    <AdminCardRow key={category.categoryId}>
      <div className="text-midGray font-semibold">{category.categoryName}</div>
      <AdminPopoverMenu>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
          <CategoryModal type="edit" prevData={category} closeModal={() => setEditOpen(false)} />
        </Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(true)} />
          <CategoryDeleteConfirmModal category={category} closeModal={() => setDeleteOpen(false)} />
        </Dialog>
      </AdminPopoverMenu>
    </AdminCardRow>
  ));
};
