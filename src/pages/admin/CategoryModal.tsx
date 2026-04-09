import { useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import Input from '@components/Input';
import { useToast } from '@hooks/useToast';
import { DialogContent, DialogTitle } from '@components/ui/dialog';
import { AdminActionButton, AdminDeleteConfirmModal } from '@components/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory, patchCategory, postCategory } from '@apis/category';
import { CategoryDto } from '@dto/categoryDto';

interface CategoryModalProps {
  type: 'create' | 'edit';
  prevData?: CategoryDto;
  closeModal: () => void;
}

export const CategoryModal = ({ type, prevData, closeModal }: CategoryModalProps) => {
  const [categoryName, setCategoryName] = useState<string>(prevData?.categoryName ?? '');
  const toast = useToast();
  const queryClient = useQueryClient();

  const categoryCreate = useMutation({
    mutationKey: ['categoryCreate'],
    mutationFn: (categoryName: string) => postCategory(categoryName),
  });
  const categoryEdit = useMutation({
    mutationKey: ['categoryEdit'],
    mutationFn: ({ categoryId, categoryName }: Omit<CategoryDto, 'updatedAt'>) =>
      patchCategory(categoryId, categoryName),
  });

  const handleClose = () => {
    setCategoryName(prevData?.categoryName ?? '');
    closeModal();
  };

  const handleSubmit = async () => {
    if (!categoryName) {
      toast('카테고리 이름을 입력해주세요.', 'error');
      return;
    }

    if (type === 'create') {
      await categoryCreate.mutateAsync(categoryName.trim(), {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['category'] });
          toast('카테고리가 추가되었습니다.', 'success');
          setCategoryName('');
        },
        onError: () => {
          toast('카테고리 추가에 실패했습니다.', 'error');
        },
      });
    } else if (type === 'edit' && prevData) {
      await categoryEdit.mutateAsync(
        { categoryId: prevData.categoryId, categoryName: categoryName.trim() },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category'] });
            toast('카테고리가 수정되었습니다.', 'success');
          },
          onError: () => {
            toast('카테고리 수정에 실패했습니다.', 'error');
          },
        },
      );
    }
    closeModal();
  };

  return (
    <DialogContent>
      <div className="text-mainBlue mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <FaRegEdit size={20} />
      </div>
      <DialogTitle>{`${type === 'create' ? '추가' : '수정'}할 카테고리 이름을 입력하세요.`}</DialogTitle>
      <Input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="카테고리를 입력하세요."
        className="bg-whiteGray h-12 rounded-lg"
      />
      <div className="flex justify-center gap-4">
        <AdminActionButton variant={'outline'} size={'lg'} className="rounded-full" onClick={handleClose}>
          {'닫기'}
        </AdminActionButton>
        <AdminActionButton size={'lg'} className="rounded-full" onClick={handleSubmit}>
          {`${type === 'create' ? '추가' : '수정'}하기`}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface CategoryDeleteConfirmModalProps {
  category: CategoryDto;
  closeModal: () => void;
}

export const CategoryDeleteConfirmModal = ({ category, closeModal }: CategoryDeleteConfirmModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const categoryDelete = useMutation({
    mutationKey: ['categoryDelete'],
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
  });

  const onDelete = async () => {
    await categoryDelete.mutateAsync(category.categoryId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['category'] });
        toast('카테고리가 삭제되었습니다.', 'success');
      },
      onError: () => {
        toast('카테고리 삭제에 실패했습니다.', 'error');
      },
    });
    closeModal();
  };

  return (
    <AdminDeleteConfirmModal title={`${category.categoryName} 카테고리를 삭제하시겠습니까?`} onDelete={onDelete} />
  );
};
