import { useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import Button from '@components/Button';
import Input from '@components/Input';
import { useToast } from 'hooks/useToast';
import { DialogClose, DialogContent } from '@components/ui/dialog';

interface TrackModalProps {
  type: 'create' | 'edit';
  prevName?: string;
  onSubmit: (trackName: string) => void;
}

export const TrackModal = ({ type, prevName, onSubmit }: TrackModalProps) => {
  const [trackName, setTrackName] = useState<string>(prevName ?? '');
  const toast = useToast();

  const handleSubmit = () => {
    if (!trackName) {
      toast('분과 이름을 입력해주세요.', 'error');
      return;
    }
    onSubmit(trackName);
  };

  return (
    <DialogContent>
      <div className="text-mainBlue mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <FaRegEdit size={20} />
      </div>
      <h3 className="text-center text-lg font-semibold text-gray-800">{`${type === 'create' ? '추가' : '수정'}할 분과 이름을 입력하세요.`}</h3>
      <Input
        type="text"
        value={trackName}
        onChange={(e) => setTrackName(e.target.value)}
        placeholder="분과를 입력하세요."
        className="bg-whiteGray h-12 rounded-lg"
      />
      <div className="flex justify-center gap-4">
        <DialogClose asChild>
          <Button className="border-lightGray text-midGray rounded-full border px-5 py-3 hover:bg-gray-100">
            {'닫기'}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button className="bg-mainBlue rounded-full px-5 py-3 hover:bg-blue-500" onClick={handleSubmit}>
            {`${type === 'create' ? '추가' : '수정'}하기`}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

interface TrackDeleteConfirmModalProps {
  trackName: string;
  onSubmit: () => void;
}

export const TrackDeleteConfirmModal = ({ trackName, onSubmit }: TrackDeleteConfirmModalProps) => {
  return (
    <DialogContent>
      <h3 className="text-center text-lg font-semibold text-gray-800">{`${trackName} 분과를 삭제하시겠습니까?`}</h3>
      <div className="flex gap-4">
        <DialogClose asChild>
          <Button className="border-lightGray text-midGray rounded-full border px-5 py-3 hover:bg-gray-100">
            {'닫기'}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button className="rounded-full bg-red-700 px-5 py-3" onClick={onSubmit}>
            {'삭제'}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};
