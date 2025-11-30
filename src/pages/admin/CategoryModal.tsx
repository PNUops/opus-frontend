import { useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import Button from '@components/Button';
import Input from '@components/Input';
import { useToast } from 'hooks/useToast';
import { DialogClose, DialogContent } from '@components/ui/dialog';
import { AdminDeleteConfirmModal } from '@components/ui/admin';

interface CategoryModalProps {
  type: 'create' | 'edit';
  prevName?: string;
  closeModal: () => void;
}

export const CategoryModal = ({ type, prevName, closeModal }: CategoryModalProps) => {
  const [categoryName, setCategoryName] = useState<string>(prevName ?? '');
  const toast = useToast();

  const handleSubmit = () => {
    if (!categoryName) {
      toast('카테고리 이름을 입력해주세요.', 'error');
      return;
    }

    closeModal();
  };

  return (
    <DialogContent>
      <div className="text-mainBlue mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <FaRegEdit size={20} />
      </div>
      <h3 className="text-center text-lg font-semibold text-gray-800">{`${type === 'create' ? '추가' : '수정'}할 카테고리 이름을 입력하세요.`}</h3>
      <Input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="카테고리를 입력하세요."
        className="bg-whiteGray h-12 rounded-lg"
      />
      <div className="flex justify-center gap-4">
        <DialogClose asChild>
          <Button className="border-lightGray text-midGray rounded-full border px-5 py-3 hover:bg-gray-100">
            {'닫기'}
          </Button>
        </DialogClose>
        <Button className="bg-mainBlue rounded-full px-5 py-3 hover:bg-blue-500" onClick={handleSubmit}>
          {`${type === 'create' ? '추가' : '수정'}하기`}
        </Button>
      </div>
    </DialogContent>
  );
};

interface CategoryDeleteConfirmModalProps {
  categoryName: string;
  closeModal: () => void;
}

export const CategoryDeleteConfirmModal = ({ categoryName, closeModal }: CategoryDeleteConfirmModalProps) => {
  return <AdminDeleteConfirmModal title={`${categoryName} 카테고리를 삭제하시겠습니까?`} onDelete={closeModal} />;
};
