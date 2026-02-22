import { RxCross2 } from 'react-icons/rx';
import { FaRegTrashAlt } from 'react-icons/fa';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  message = '정말 삭제하시겠어요?',
  description,
  icon = <FaRegTrashAlt size={24} />,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[320px] rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 ease-in-out"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:cursor-pointer hover:text-gray-600"
          aria-label="닫기"
        >
          <RxCross2 size={20} />
        </button>
        <div className="text-mainRed mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          {icon}
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-800">{message}</h3>
        <p className="text-exsm mt-2 text-center text-gray-400">{description}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="text-exsm border-lightGray text-midGray rounded-full border px-5 py-1.5 hover:cursor-pointer hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="text-exsm bg-mainRed rounded-full px-5 py-1.5 text-white hover:cursor-pointer hover:bg-red-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
