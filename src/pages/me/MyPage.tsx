import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deleteMyAccount } from 'apis/member';
import { useToast } from 'hooks/useToast';
import ConfirmModal from '@components/ConfirmModal';
import { AdminHeader } from '@components/admin';

const MyPage = () => {
  return (
    <div className="flex w-full flex-col">
      <StudentIdSection />
      <div className="h-[35px]" />
      <DeleteAccountSection />
    </div>
  );
};

export default MyPage;

const StudentIdSection = () => {
  const [studentId, setStudentId] = useState('');
  const handleStudentIdChange = (id: string) => {
    alert('학번이 수정되었습니다: ' + id);
    setStudentId('');
  };

  return (
    <div className="flex flex-col gap-2">
      <AdminHeader title="학번 수정" />
      <div className="flex w-full flex-col items-end justify-between gap-2 p-2 text-sm text-nowrap md:flex-row md:items-center">
        <input
          className="bg-lightGray rounded-md px-2 py-1"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button
          className="bg-mainBlue rounded-md px-2 py-1 text-white"
          onClick={() => handleStudentIdChange(studentId)}
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

const DeleteAccountSection = () => {
  const toast = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteMyAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      toast('회원 탈퇴가 완료되었어요', 'success');
      setShowConfirm(false);
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || '회원 탈퇴에 실패했어요', 'error');
      setShowConfirm(false);
    },
  });

  const handleDeleteAccount = () => deleteMyAccountMutation.mutate();

  return (
    <div className="flex flex-col gap-2">
      <AdminHeader title="회원 탈퇴" />
      <div className="flex w-full flex-col items-end justify-between gap-2 p-2 text-sm text-nowrap md:flex-row md:items-center">
        <p>SW프로젝트관리시스템 탈퇴하기</p>
        <button
          className="text-mainRed border-mainRed rounded-md border bg-white px-2 py-1"
          onClick={() => setShowConfirm(true)}
        >
          탈퇴하기
        </button>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowConfirm(false)}
        message="정말 탈퇴하시겠어요?"
        description="삭제한 회원 정보는 복구할 수 없습니다."
      />
    </div>
  );
};
