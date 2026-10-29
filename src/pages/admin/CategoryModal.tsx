import { useState } from 'react';
import Input from '@components/Input';
import { AdminFormError } from '@components/admin/AdminFormError';
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
  const [nameError, setNameError] = useState('');
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

  const isPending = categoryCreate.isPending || categoryEdit.isPending;

  const handleSubmit = () => {
    if (isPending) return;
    if (!categoryName.trim()) {
      setNameError('카테고리 이름을 입력해주세요.');
      return;
    }

    if (type === 'create') {
      categoryCreate.mutate(categoryName.trim(), {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['category'] });
          toast('카테고리가 추가되었습니다.', 'success');
          setCategoryName('');
          closeModal();
        },
        onError: () => {
          toast('카테고리 추가에 실패했습니다.', 'error');
        },
      });
    } else if (type === 'edit' && prevData) {
      categoryEdit.mutate(
        { categoryId: prevData.categoryId, categoryName: categoryName.trim() },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['category'] });
            toast('카테고리가 수정되었습니다.', 'success');
            closeModal();
          },
          onError: () => {
            toast('카테고리 수정에 실패했습니다.', 'error');
          },
        },
      );
    }
  };

  return (
    <DialogContent appearance="admin" className="w-[440px]" closeDisabled={isPending}>
      <DialogTitle>{`카테고리 ${type === 'create' ? '추가' : '수정'}`}</DialogTitle>
      <Input
        appearance="admin"
        aria-label="카테고리 이름"
        type="text"
        disabled={isPending}
        value={categoryName}
        onChange={(e) => {
          setCategoryName(e.target.value);
          setNameError('');
        }}
        aria-invalid={!!nameError}
        placeholder="카테고리를 입력하세요."
        className="min-h-11"
      />
      <AdminFormError
        message={
          nameError ||
          (categoryCreate.isError || categoryEdit.isError
            ? '저장에 실패했어요. 입력 내용을 확인하고 다시 시도해주세요.'
            : undefined)
        }
      />
      <div className="flex flex-wrap justify-end gap-3">
        <AdminActionButton variant={'outline'} size={'lg'} onClick={handleClose} disabled={isPending}>
          {'닫기'}
        </AdminActionButton>
        <AdminActionButton size={'lg'} onClick={handleSubmit} disabled={isPending} aria-busy={isPending}>
          {isPending ? '저장 중…' : `${type === 'create' ? '추가' : '수정'}하기`}
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

  const onDelete = () => {
    if (categoryDelete.isPending) return;
    categoryDelete.mutate(category.categoryId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['category'] });
        toast('카테고리가 삭제되었습니다.', 'success');
        closeModal();
      },
      onError: () => {
        toast('카테고리 삭제에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <AdminDeleteConfirmModal
      title="카테고리를 삭제하시겠습니까?"
      description={category.categoryName}
      onDelete={onDelete}
      isPending={categoryDelete.isPending}
      isError={categoryDelete.isError}
    />
  );
};
