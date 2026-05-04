import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MdEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import Spinner from '@components/Spinner';
import PasswordInput from '@components/PasswordInput';
import Divider from '@components/ui/divider';
import { useToast } from '@hooks/useToast';
import { useImageBlob } from '@hooks/useImageBlob';
import { isValidPassword } from '@utils/password';
import { MyPageSection } from '@pages/me/mypageSection';
import AltProfile from '@pages/me/account/components/AltProfile';
import { updateProfileVisibility, patchMyStudentId, deleteMyAccount } from '@apis/member';
import { patchPasswordReset } from '@apis/signIn';
import { PasswordResetRequestDto } from '@dto/signInDto';
import { MY_ACCOUNT_QUERY_KEY, myAccountOption } from '@queries/member';
import { deleteMyProfileImage, getMyProfileImage, patchMyGithubUrl, patchMyProfileImage } from '@apis/me';
import { createImageFormData, imageValidator } from '@utils/image';
import { isValidGithubUrl } from '@pages/project-editor/urlValidators';
import { getApiErrorMessage } from '@utils/error';
import { useTokenStore } from '@stores/useTokenStore';
import QueryWrapper from '@providers/QueryWrapper';

const PROFILE_IMAGE_QUERY_KEY = ['profileImage', 'me'] as const;
const SECTION_STACK_CLASS = 'flex flex-col gap-8 sm:gap-10 md:gap-12';

const PROFILE_VISIBILITY_OPTIONS = [
  { value: true, label: '네, 프로필 페이지를 공개할게요.' },
  { value: false, label: '아니요. 프로필 페이지를 공개하지 않을게요.' },
] as const;

const PASSWORD_CHANGE_ERROR_MESSAGE = '비밀번호 변경에 실패했어요. 다시 시도해주세요.';
const PASSWORD_REQUIREMENT_MESSAGE = '8~16자, 영어, 숫자, 특수문자(@$!%*#?&~)를 포함하여야 합니다.';

const myProfileImageOption = () => {
  return queryOptions({
    queryKey: PROFILE_IMAGE_QUERY_KEY,
    queryFn: getMyProfileImage,
  });
};

const revokeBlobUrl = (url: string | null | undefined) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const useBlobUrlCleanup = (url: string | null) => {
  useEffect(() => {
    return () => revokeBlobUrl(url);
  }, [url]);
};

interface AccountModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const AccountModal = ({ title, onClose, children, className = 'w-[350px] rounded-2xl p-8' }: AccountModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative bg-white shadow-xl ${className}`} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="닫기"
        >
          <RxCross2 size={20} />
        </button>

        <h3 className="mb-4 text-center text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
};

interface SectionStackProps {
  children: ReactNode;
}

const SectionStack = ({ children }: SectionStackProps) => {
  return <div className={SECTION_STACK_CLASS}>{children}</div>;
};

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
    <SectionStack>
      <ProfileCard />
      <Divider />
      <ProfileVisibilitySection />
    </SectionStack>
  );
};

const ProfileCard = () => {
  const { data: account } = useQuery(myAccountOption());

  return (
    <div className="bg-whiteGray flex w-full flex-col items-start gap-10 rounded-lg px-17 py-12">
      <div className="flex items-center gap-10">
        <QueryWrapper
          loadingFallback={<EditableProfileImage name={account?.name} profileImageUrl={null} />}
          errorFallback={() => <EditableProfileImage name={account?.name} profileImageUrl={null} />}
        >
          <ProfileImage name={account?.name} />
        </QueryWrapper>
        <span className="text-2xl font-bold text-neutral-800">{account?.name}</span>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <ProfileInfoRow label="이메일">
          <span className="truncate font-medium text-neutral-500">{account?.email}</span>
        </ProfileInfoRow>
        <ProfileInfoRow label="GitHub" labelClassName="py-1.5">
          <GithubField githubUrl={account?.githubUrl} />
        </ProfileInfoRow>
      </div>
    </div>
  );
};

interface ProfileImageProps {
  name: string | undefined;
}

const ProfileImage = ({ name }: ProfileImageProps) => {
  const { imageURL } = useImageBlob(myProfileImageOption());

  return <EditableProfileImage name={name} profileImageUrl={imageURL} />;
};

interface ProfileInfoRowProps {
  label: string;
  children: ReactNode;
  labelClassName?: string;
}

const ProfileInfoRow = ({ label, children, labelClassName = '' }: ProfileInfoRowProps) => {
  return (
    <div className="text-md flex w-full items-center gap-4">
      <span className={`w-15 font-semibold text-neutral-800 ${labelClassName}`}>{label}</span>
      {children}
    </div>
  );
};

interface GithubFieldProps {
  githubUrl: string | null | undefined;
}

const GithubField = ({ githubUrl }: GithubFieldProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(githubUrl ?? '');

  useEffect(() => {
    if (!isEditing) {
      setInputValue(githubUrl ?? '');
    }
  }, [githubUrl, isEditing]);

  const { mutate: saveGithubUrl, isPending: isSavingGithubUrl } = useMutation({
    mutationFn: patchMyGithubUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ACCOUNT_QUERY_KEY });
      toast('GitHub 계정이 연결되었어요.', 'success');
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, 'GitHub 계정 연결에 실패했어요. 다시 시도해주세요.'), 'error');
    },
  });

  const closeEditor = () => {
    setInputValue(githubUrl ?? '');
    setIsEditing(false);
  };

  const saveInputValue = () => {
    const nextGithubValue = inputValue.trim();
    const prevGithubValue = (githubUrl ?? '').trim();

    setIsEditing(false);

    if (!nextGithubValue || nextGithubValue === prevGithubValue) {
      setInputValue(githubUrl ?? '');
      return;
    }

    if (!isValidGithubUrl(nextGithubValue)) {
      setInputValue(githubUrl ?? '');
      return;
    }

    saveGithubUrl(nextGithubValue);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={saveInputValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }

          if (e.key === 'Escape') {
            closeEditor();
          }
        }}
        disabled={isSavingGithubUrl}
        type="url"
        placeholder="GitHub URL을 입력해주세요."
        className="border-midGray w-full rounded-md border-2 p-1.5 px-2 text-neutral-600 outline-none"
      />
    );
  }

  if (!githubUrl) {
    return (
      <button type="button" onClick={() => setIsEditing(true)} className="text-midGray truncate p-1.5 text-left">
        아직 GitHub 계정이 연결되지 않았어요.
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      className="w-full cursor-text rounded-md border-2 border-transparent p-1.5 text-left"
    >
      <span className="block min-w-0">
        <a
          href={githubUrl}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full truncate font-medium text-neutral-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {githubUrl}
        </a>
      </span>
    </div>
  );
};

interface EditableProfileImageProps {
  name: string | undefined;
  profileImageUrl: string | null;
}

const EditableProfileImage = ({ name, profileImageUrl }: EditableProfileImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <ProfileImageEditModal name={name} profileImageUrl={profileImageUrl} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

interface ProfileImageEditModalProps {
  name: string | undefined;
  profileImageUrl: string | null;
  onClose: () => void;
}

const ProfileImageEditModal = ({ name, profileImageUrl, onClose }: ProfileImageEditModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImageSelected = Boolean(selectedFile);

  useBlobUrlCleanup(previewUrl);

  const resetSelectedImage = () => {
    revokeBlobUrl(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const closeModal = () => {
    resetSelectedImage();
    onClose();
  };

  const handleImageMutationSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: PROFILE_IMAGE_QUERY_KEY });
    toast(message, 'success');
    closeModal();
  };

  const { mutate: uploadProfileImage, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => {
      const formData = createImageFormData(file);
      return patchMyProfileImage(formData);
    },
    onSuccess: () => handleImageMutationSuccess('프로필 이미지가 변경되었어요.'),
    onError: (err) => {
      toast(getApiErrorMessage(err, '프로필 이미지 변경에 실패했어요.'), 'error');
    },
  });

  const { mutate: removeProfileImage, isPending: isDeleting } = useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: () => handleImageMutationSuccess('프로필 이미지가 삭제되었어요.'),
    onError: (err) => {
      toast(getApiErrorMessage(err, '프로필 이미지 삭제에 실패했어요.'), 'error');
    },
  });

  const replacePreviewImage = (file: File) => {
    revokeBlobUrl(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validate = imageValidator(file);
    if (!validate.isValid) {
      validate.message.forEach((message) => toast(message, 'error'));
      return;
    }

    replacePreviewImage(file);
  };

  const handleSaveImage = () => {
    if (!selectedFile) {
      toast('이미지를 먼저 선택해주세요.', 'info');
      return;
    }

    uploadProfileImage(selectedFile);
  };

  return (
    <AccountModal title="프로필 이미지 수정" onClose={closeModal} className="h-70 w-90 rounded-lg p-8">
      <div className="mb-10 flex justify-center">
        <div className="h-20 w-20 overflow-hidden rounded-full">
          <AltProfile seed={name} imageUrl={previewUrl || profileImageUrl} size={80} />
        </div>
      </div>

      {!isImageSelected ? (
        <ProfileImagePickerActions
          isPending={isDeleting || isUploading}
          onDelete={() => removeProfileImage()}
          onFileChange={handleFileChange}
        />
      ) : (
        <ProfileImageSaveActions isPending={isDeleting || isUploading} onCancel={closeModal} onSave={handleSaveImage} />
      )}
    </AccountModal>
  );
};

interface ProfileImagePickerActionsProps {
  isPending: boolean;
  onDelete: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImagePickerActions = ({ isPending, onDelete, onFileChange }: ProfileImagePickerActionsProps) => {
  return (
    <div className="flex w-full justify-between gap-2">
      <button
        type="button"
        className="border-lightGray text-midGray hover:bg-whiteGray w-34 rounded-sm border px-3 py-2 text-sm"
        onClick={onDelete}
        disabled={isPending}
      >
        기본 이미지 설정
      </button>
      <label className="bg-mainGreen/90 hover:bg-mainGreen flex-1 cursor-pointer rounded-sm px-3 py-2 text-center text-sm text-white">
        기기에서 업로드
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={isPending} />
      </label>
    </div>
  );
};

interface ProfileImageSaveActionsProps {
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileImageSaveActions = ({ isPending, onCancel, onSave }: ProfileImageSaveActionsProps) => {
  return (
    <div className="flex w-full justify-between gap-2">
      <button
        type="button"
        className="border-lightGray text-midGray hover:bg-whiteGray w-34 rounded-sm border px-3 py-2 text-sm"
        onClick={onCancel}
        disabled={isPending}
      >
        취소
      </button>
      <button
        type="button"
        className="bg-mainGreen/90 hover:bg-mainGreen disabled:bg-midGray flex-1 rounded-sm px-5 py-2 text-sm text-white"
        onClick={onSave}
        disabled={isPending}
      >
        {isPending ? <Spinner className="size-5" /> : '프로필 이미지 변경'}
      </button>
    </div>
  );
};

const ProfileVisibilitySection = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(myAccountOption());
  const isProfilePublic = profile?.isProfilePublic ?? false;

  const { mutate: updateVisibility } = useMutation({
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
          {PROFILE_VISIBILITY_OPTIONS.map(({ value, label }) => (
            <label key={String(value)} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="profileVisibility"
                value={value ? 'public' : 'private'}
                checked={isProfilePublic === value}
                onChange={() => updateVisibility(value)}
                className="accent-mainGreen"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

const AccountSecuritySection = () => {
  return (
    <SectionStack>
      <StudentIdEditSection />
      <Divider />
      <PasswordEditSection />
    </SectionStack>
  );
};

const StudentIdEditSection = () => {
  const toast = useToast();
  const [studentId, setStudentId] = useState('');
  const [hasShownInvalidInputToast, setHasShownInvalidInputToast] = useState(false);

  const { mutate: updateStudentId } = useMutation({
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
    const { value } = e.target;

    if (/\D/.test(value)) {
      if (!hasShownInvalidInputToast) {
        toast('숫자만 입력해주세요.', 'error');
      }
      setHasShownInvalidInputToast(true);
      return;
    }

    setStudentId(value);
    setHasShownInvalidInputToast(false);
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
          <button onClick={() => updateStudentId(studentId)} className="bg-mainBlue rounded-lg px-3 py-1.5 text-white">
            변경하기
          </button>
        </div>
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

interface PasswordFormValues {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

const getPasswordValidationError = ({ email, newPassword, confirmPassword }: PasswordFormValues) => {
  if (!email) {
    return '계정 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
  }

  if (!newPassword || !confirmPassword) {
    return '모든 항목을 입력해주세요.';
  }

  if (!isValidPassword(newPassword)) {
    return PASSWORD_REQUIREMENT_MESSAGE;
  }

  if (newPassword !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }

  return '';
};

const PasswordEditSection = () => {
  const { data: profile } = useQuery(myAccountOption());
  const email = profile?.email ?? '';

  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const resetPasswordForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetPasswordForm();
  };

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: (request: PasswordResetRequestDto) => {
      return patchPasswordReset(request);
    },
    onSuccess: () => {
      toast('비밀번호가 성공적으로 변경되었어요.', 'success');
      closeModal();
    },
    onError: (err) => {
      const message = getApiErrorMessage(err, PASSWORD_CHANGE_ERROR_MESSAGE);
      setError(message);
      toast(message, 'error');
    },
  });

  const openModal = () => {
    resetPasswordForm();
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const validationError = getPasswordValidationError({ email, newPassword, confirmPassword });
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    changePassword({ email, newPassword });
  };

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>비밀번호</MyPageSection.Header>
      <MyPageSection.Body>
        <button onClick={openModal} className="bg-mainBlue w-fit rounded-lg px-3 py-1.5 text-sm text-white">
          비밀번호 변경하기
        </button>
        {isModalOpen && (
          <AccountModal title="비밀번호 변경" onClose={closeModal}>
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
              <button
                type="button"
                className="bg-mainBlue disabled:bg-midGray mt-2 rounded-lg px-3 py-1.5 text-white"
                onClick={handleSubmit}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? <Spinner className="size-5" /> : '변경하기'}
              </button>
            </div>
          </AccountModal>
        )}
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

const AccountManagementSection = () => {
  const clearToken = useTokenStore((state) => state.clearToken);
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: withdrawAccount, isPending: isWithdrawing } = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      toast('계정이 성공적으로 삭제되었어요.', 'success');
      clearToken();
      setIsModalOpen(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '계정 삭제에 실패했어요. 다시 시도해주세요.'), 'error');
    },
  });

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>계정 탈퇴</MyPageSection.Header>
      <MyPageSection.Body>
        <button
          onClick={() => setIsModalOpen(true)}
          className="border-mainRed text-mainRed hover:bg-whiteGray w-fit rounded-lg border-1 px-3 py-1.5 text-sm font-medium"
        >
          계정 탈퇴하기
        </button>
        {isModalOpen && (
          <AccountModal title="계정 탈퇴" onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-neutral-600">탈퇴 전 아래 사항을 확인해주세요.</p>

                <div className="bg-whiteGray border-lightGray rounded-md border p-4">
                  <ul className="list-disc space-y-2 pl-3 text-sm text-neutral-700">
                    <li>탈퇴 시 계정 및 프로필 정보는 모두 삭제되며 복구할 수 없습니다.</li>
                    <li>동일한 이메일로 재가입은 가능하지만, 기존 데이터는 복원되지 않습니다.</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                className="border-mainRed text-mainRed hover:bg-whiteGray disabled:bg-whiteGray mt-2 rounded-lg border px-3 py-1.5 font-medium"
                onClick={() => withdrawAccount()}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? <Spinner className="size-5" /> : '탈퇴하기'}
              </button>
            </div>
          </AccountModal>
        )}
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};
