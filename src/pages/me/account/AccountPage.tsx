import { useState, ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { getMyAccount, updateProfileVisibility, patchMyStudentId, deleteMyAccount } from 'apis/member';
import { patchPasswordReset } from 'apis/signIn';
import { PasswordResetRequestDto } from 'types/DTO';
import { GetMyProfileResponseDto } from 'types/DTO';
import AltProfile from './components/AltProfile';
import { isValidPassword } from 'utils/password';
import { ActivitySection } from '../activity/ActivityPage';

const AccountPage = () => {
  const { data: profile } = useQuery({
    queryKey: ['account', 'me'],
    queryFn: getMyAccount,
  });

  if (!profile) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:gap-10 sm:p-8 md:gap-12 md:p-12">
      <ProfileSection profile={profile} />
      <Divider />
      <AccountSecuritySection email={profile.email} />
      <Divider />
      <AccountManagementSection />
    </div>
  );
};

export default AccountPage;

const ProfileSection = ({ profile }: { profile: GetMyProfileResponseDto }) => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      <ProfileCard profile={profile} />
      <Divider />
      <ProfileVisibilitySection isProfilePublic={profile.isProfilePublic} />
    </div>
  );
};

const ProfileCard = ({ profile }: { profile: GetMyProfileResponseDto }) => {
  const { name, email, profileImageUrl, githubUrl } = profile;
  return (
    <div className="bg-whiteGray flex w-full flex-col items-start gap-10 rounded-lg px-17 py-12">
      <div className="flex items-center gap-10">
        <AltProfile seed={name} imageUrl={profileImageUrl} />
        <span className="text-2xl font-bold text-neutral-800">{name}</span>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="text-md flex items-center gap-4">
          <span className="w-15 font-semibold text-neutral-800">이메일</span>
          <span className="truncate font-medium text-neutral-500">{email}</span>
        </div>
        <div className="text-md flex w-full items-center gap-4">
          <span className="w-15 font-semibold text-neutral-800">GitHub</span>
          {githubUrl ? (
            <a
              href={githubUrl}
              className="truncate font-medium text-neutral-500"
              target="_blank"
              rel="noopener noreferrer"
            />
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileVisibilitySection = ({ isProfilePublic }: { isProfilePublic: boolean }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (isPublic: boolean) => {
      return updateProfileVisibility({
        isProfilePublic: isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'me'] });
      toast('프로필 공개 설정이 변경되었어요.', 'success');
    },
    onError: (err) => {
      toast(`${err?.message}` || '프로필 공개 설정 변경에 실패했어요. 다시 시도해주세요.', 'error');
    },
  });

  return (
    <ActivitySection.Root>
      <ActivitySection.Header>프로필 공개</ActivitySection.Header>
      <ActivitySection.Description>
        프로필 및 수상 내역이 포함된 나의 프로필 페이지를 공개합니다.
      </ActivitySection.Description>
      <ActivitySection.Body>
        <div className="flex flex-col items-start gap-2 text-sm font-medium text-neutral-700">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="profileVisibility"
              value="public"
              checked={isProfilePublic === true}
              onChange={() => mutate(true)}
              className="accent-mainGreen"
            />
            <span>네, 프로필 페이지를 공개할게요.</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="profileVisibility"
              value="private"
              checked={isProfilePublic === false}
              onChange={() => mutate(false)}
              className="accent-mainGreen"
            />
            <span>아니요. 프로필 페이지를 공개하지 않을게요.</span>
          </label>
        </div>
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

const AccountSecuritySection = ({ email }: { email: string }) => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      <StudentIdEditSection />
      <Divider />
      <PasswordEditSection email={email} />
    </div>
  );
};

const StudentIdEditSection = () => {
  const toast = useToast();
  const [studentId, setStudentId] = useState('');
  const [hasShownToast, setHasShownToast] = useState(false);

  const { mutate } = useMutation({
    mutationFn: (studentId: string) => {
      return patchMyStudentId({
        studentId,
      });
    },
    onSuccess: () => {
      toast('학번이 성공적으로 변경되었어요.', 'success');
    },
    onError: (err) => {
      toast(`${err?.message}` || '학번 변경에 실패했어요. 다시 시도해주세요.', 'error');
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    const value = e.target.value;
    const hasInvalid = /\D/.test(value);
    if (hasInvalid && !hasShownToast) {
      toast('숫자만 입력해주세요.', 'error');
      setStudentId('');
      setHasShownToast(true);
      return;
    }

    setStudentId(value);
    setHasShownToast(false);
  };

  return (
    <ActivitySection.Root>
      <ActivitySection.Header>학번</ActivitySection.Header>
      <ActivitySection.Body>
        <div className="flex items-center gap-2 text-sm">
          <input
            autoComplete="off"
            value={studentId}
            maxLength={10}
            onChange={handleInputChange}
            className="bg-lightGray rounded-lg px-3 py-1.5"
          />
          <button onClick={() => mutate(studentId)} className="bg-mainBlue rounded-lg px-3 py-1.5 text-white">
            변경하기
          </button>
        </div>
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

import PasswordInput from 'components/PasswordInput';

const PasswordEditSection = ({ email }: { email: string }) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { mutate } = useMutation({
    mutationFn: (request: PasswordResetRequestDto) => {
      return patchPasswordReset(request);
    },
    onSuccess: () => {
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      toast('비밀번호가 성공적으로 변경되었어요.', 'success');
    },
    onError: (err) => {
      setError(`${err?.message}` || '비밀번호 변경에 실패했어요. 다시 시도해주세요.');
      toast(`${err?.message}` || '비밀번호 변경에 실패했어요. 다시 시도해주세요.', 'error');
    },
  });

  const handleOpen = () => {
    setOpen(true);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSubmit = () => {
    console.log('submit', { newPassword, confirmPassword });
    if (!newPassword || !confirmPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError('8~16자, 영어, 숫자, 특수문자(@$!%*#?&~)를 포함하여야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    mutate({ email, newPassword });
    setError('');
    setOpen(false);
  };

  return (
    <ActivitySection.Root>
      <ActivitySection.Header>비밀번호</ActivitySection.Header>
      <ActivitySection.Body>
        <button onClick={handleOpen} className="bg-mainBlue w-fit rounded-lg px-3 py-1.5 text-sm text-white">
          비밀번호 변경하기
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-[350px] rounded-2xl bg-white p-8 shadow-xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={handleClose}
                aria-label="닫기"
              >
                ×
              </button>
              <h3 className="mb-4 text-center text-lg font-semibold">비밀번호 변경</h3>
              <div className="flex flex-col gap-3">
                <PasswordInput
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                />
                <PasswordInput
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 확인"
                />
                {error && <div className="text-mainRed mt-1 text-xs">{error}</div>}
                <button className="bg-mainBlue mt-2 rounded-lg px-3 py-1.5 text-white" onClick={handleSubmit}>
                  변경하기
                </button>
              </div>
            </div>
          </div>
        )}
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

const AccountManagementSection = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { mutate } = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      toast('계정이 성공적으로 삭제되었어요.', 'success');
    },
    onError: (err) => {
      toast(`${err?.message}` || '계정 삭제에 실패했어요. 다시 시도해주세요.', 'error');
    },
  });
  return (
    <ActivitySection.Root>
      <ActivitySection.Header>계정 탈퇴</ActivitySection.Header>
      <ActivitySection.Body>
        <button
          onClick={() => setOpen(true)}
          className="border-mainRed text-mainRed hover:bg-whiteGray w-fit rounded-lg border-1 px-3 py-1.5 text-sm font-medium"
        >
          계정 탈퇴하기
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-[350px] rounded-2xl bg-white p-8 shadow-xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
              <h3 className="mb-4 text-center text-lg font-semibold">계정 탈퇴</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-neutral-600">탈퇴 전 아래 사항을 확인해주세요.</p>

                    <div className="bg-whiteGray border-lightGray rounded-md border p-4">
                      <ul className="list-disc space-y-2 pl-3 text-sm text-neutral-700">
                        <li>탈퇴 시 계정 및 프로필 정보는 모두 삭제되며 복구할 수 없습니다.</li>
                        <li>동일한 이메일로 재가입은 가능하지만, 기존 데이터는 복원되지 않습니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  className="border-mainRed text-mainRed hover:bg-whiteGray mt-2 rounded-lg border px-3 py-1.5 font-medium"
                  onClick={() => {
                    mutate();
                    setOpen(false);
                  }}
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

const Divider = () => {
  return <div className="border-lightGray border-t" />;
};
