import { useEffect, useState, ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PasswordInput from '@components/PasswordInput';
import Divider from '@components/ui/divider';
import { useToast } from '@hooks/useToast';
import { isValidPassword } from '@utils/password';
import { MyPageSection } from '@pages/me/mypageSection';
import AltProfile from '@pages/me/account/components/AltProfile';
import { updateProfileVisibility, patchMyStudentId, deleteMyAccount } from '@apis/member';
import { patchPasswordReset } from '@apis/signIn';
import { PasswordResetRequestDto } from '@dto/signInDto';
import { MY_ACCOUNT_QUERY_KEY, myAccountOption } from '@queries/member';
import { deleteMyProfileImage, getMyProfileImage, patchMyGithubUrl, patchMyProfileImage } from '@apis/me';
import { MdEdit } from 'react-icons/md';
import { createImageFormData, imageValidator } from '@utils/image';
import { isValidGithubUrl } from '@pages/project-editor/urlValidators';
import { getApiErrorMessage } from '@utils/error';

const AccountPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:gap-10 sm:p-8 md:gap-12 md:p-12">
      <ProfileSection />
      <Divider />
      <AccountSecuritySection />
      <Divider />
      <AccountManagementSection />
    </div>
  );
};

export default AccountPage;

const ProfileSection = () => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      <ProfileCard />
      <Divider />
      <ProfileVisibilitySection />
    </div>
  );
};

const ProfileCard = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: account } = useQuery(myAccountOption());
  const { data: profileImage } = useQuery({
    queryKey: ['profileImage', 'me'],
    queryFn: getMyProfileImage,
  });

  const name = account?.name;
  const email = account?.email;
  const githubUrl = account?.githubUrl;
  const profileImageUrl = profileImage?.status === 'success' ? profileImage.url : null;
  const [isGithubInputOpen, setIsGithubInputOpen] = useState(false);
  const [githubInputValue, setGithubInputValue] = useState(githubUrl ?? '');

  useEffect(() => {
    return () => {
      if (profileImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  useEffect(() => {
    if (!isGithubInputOpen) {
      setGithubInputValue(githubUrl ?? '');
    }
  }, [githubUrl, isGithubInputOpen]);
  const { mutate: saveGithubUrl, isPending: isSavingGithubUrl } = useMutation({
    mutationFn: patchMyGithubUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ACCOUNT_QUERY_KEY });
      toast('GitHub 계정이 연결되었어요.', 'success');
    },
    onError: (err) => {
      toast(`${err?.message}` || 'GitHub 계정 연결에 실패했어요. 다시 시도해주세요.', 'error');
    },
  });

  const handleGithubInputBlur = () => {
    const nextGithubValue = githubInputValue.trim();
    const prevGithubValue = (githubUrl ?? '').trim();

    setIsGithubInputOpen(false);

    if (!nextGithubValue || nextGithubValue === prevGithubValue) return;
    saveGithubUrl(nextGithubValue);
  };

  return (
    <div className="bg-whiteGray flex w-full flex-col items-start gap-10 rounded-lg px-17 py-12">
      <div className="flex items-center gap-10">
        <EditableProfileImage name={name} profileImageUrl={profileImageUrl} />
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
            >
              {githubUrl}
            </a>
          ) : isGithubInputOpen ? (
            <input
              autoFocus
              value={githubInputValue}
              onChange={(e) => setGithubInputValue(e.target.value)}
              onBlur={() => {
                if (isValidGithubUrl(githubInputValue)) {
                  handleGithubInputBlur();
                } else {
                  setGithubInputValue(githubUrl ?? '');
                  setIsGithubInputOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }

                if (e.key === 'Escape') {
                  setGithubInputValue(githubUrl ?? '');
                  setIsGithubInputOpen(false);
                }
              }}
              disabled={isSavingGithubUrl}
              type="url"
              placeholder="GitHub URL을 입력해주세요."
              className="bg-lightGray w-full rounded-md p-1.5 px-2 text-neutral-600 outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsGithubInputOpen(true)}
              className="text-midGray truncate p-1.5 text-left"
            >
              아직 GitHub 계정이 연결되지 않았어요.
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface EditableProfileImageProps {
  name: string | undefined;
  profileImageUrl: string | null;
}

const EditableProfileImage = ({ name, profileImageUrl }: EditableProfileImageProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: uploadProfileImage, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => {
      const formData = createImageFormData(file);
      return patchMyProfileImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileImage', 'me'] });
      toast('프로필 이미지가 변경되었어요.', 'success');
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '프로필 이미지 변경에 실패했어요.'), 'error');
    },
  });

  const { mutate: removeProfileImage, isPending: isDeleting } = useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileImage', 'me'] });
      toast('프로필 이미지가 삭제되었어요.', 'success');
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '프로필 이미지 삭제에 실패했어요.'), 'error');
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validate = imageValidator(file);
    if (!validate.isValid) {
      validate.message.forEach((message) => toast(message, 'error'));
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSaveImage = () => {
    if (!selectedFile) {
      toast('이미지를 먼저 선택해주세요.', 'info');
      return;
    }
    uploadProfileImage(selectedFile);
  };

  return (
    <>
      <button
        type="button"
        className="group relative h-16 w-16 overflow-hidden rounded-full"
        onClick={() => setIsModalOpen(true)}
        aria-label="프로필 이미지 수정"
      >
        <AltProfile seed={name} imageUrl={profileImageUrl} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35 group-focus-visible:bg-black/35">
          <MdEdit className="text-xl text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </div>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-[360px] rounded-2xl bg-white p-8 shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={handleCloseModal}
              aria-label="닫기"
            >
              ×
            </button>

            <h3 className="mb-4 text-center text-lg font-semibold">프로필 이미지 수정</h3>

            <div className="mb-5 flex justify-center">
              <div className="h-20 w-20 overflow-hidden rounded-full">
                <AltProfile seed={name} imageUrl={previewUrl || profileImageUrl} size={80} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="bg-mainBlue cursor-pointer rounded-lg px-3 py-2 text-center text-sm text-white">
                이미지 선택
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                type="button"
                className="border-mainRed text-mainRed hover:bg-whiteGray rounded-lg border px-3 py-2 text-sm"
                onClick={() => removeProfileImage()}
                disabled={isDeleting || isUploading}
              >
                프로필 사진 삭제하기
              </button>
              <button
                type="button"
                className="bg-mainBlue mt-2 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={handleSaveImage}
                disabled={isUploading || isDeleting}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileVisibilitySection = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(myAccountOption());
  const isProfilePublic = profile?.isProfilePublic ?? false;

  const { mutate } = useMutation({
    mutationFn: (isPublic: boolean) => {
      return updateProfileVisibility({
        isProfilePublic: isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ACCOUNT_QUERY_KEY });
      toast('프로필 공개 설정이 변경되었어요.', 'success');
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '프로필 공개 설정 변경에 실패했어요. 다시 시도해주세요.'), 'error');
    },
  });

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>프로필 공개</MyPageSection.Header>
      <MyPageSection.Description>
        프로필 및 수상 내역이 포함된 나의 프로필 페이지를 공개합니다.
      </MyPageSection.Description>
      <MyPageSection.Body>
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
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

const AccountSecuritySection = () => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      <StudentIdEditSection />
      <Divider />
      <PasswordEditSection />
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
      toast(getApiErrorMessage(err, '학번 변경에 실패했어요. 다시 시도해주세요.'), 'error');
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
    <MyPageSection.Root>
      <MyPageSection.Header>학번</MyPageSection.Header>
      <MyPageSection.Body>
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
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

const PasswordEditSection = () => {
  const { data: profile } = useQuery(myAccountOption());
  const email = profile?.email ?? '';

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
      setError(getApiErrorMessage(err, '비밀번호 변경에 실패했어요. 다시 시도해주세요.'));
      toast(getApiErrorMessage(err, '비밀번호 변경에 실패했어요. 다시 시도해주세요.'), 'error');
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
    if (!email) {
      setError('계정 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
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
    <MyPageSection.Root>
      <MyPageSection.Header>비밀번호</MyPageSection.Header>
      <MyPageSection.Body>
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
      </MyPageSection.Body>
    </MyPageSection.Root>
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
    <MyPageSection.Root>
      <MyPageSection.Header>계정 탈퇴</MyPageSection.Header>
      <MyPageSection.Body>
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
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};
