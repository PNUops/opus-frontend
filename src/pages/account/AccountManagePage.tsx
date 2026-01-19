import { useState } from 'react';

import { AdminHeader } from '@components/ui/admin';
import ConfirmModal from '@components/ConfirmModal';

const AccountManagePage = () => {
  return (
    <div className="flex w-full flex-col">
      <StudentIdSection />
      <div className="h-[35px]" />
      <DeleteAccountSection />
      {/* TODO: 탈퇴 시 모달 추가 구현 필요 */}
    </div>
  );
};

export default AccountManagePage;

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
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = () => {
    alert('탈퇴가 완료되었습니다.');
    setShowConfirm(false);
    /* TODO: 탈퇴하고 즉각 로그아웃 및 리다이렉트? */
  };

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
