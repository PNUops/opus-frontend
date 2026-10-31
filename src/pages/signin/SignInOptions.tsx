import Backdrop from '@components/Backdrop';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Arrow as PopoverArrow } from '@radix-ui/react-popover';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';

const SignInOptions = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 text-sm text-neutral-600">
      <Link
        className="focus-visible:outline-mainBlue flex min-h-11 items-center rounded px-1 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2"
        to="/find"
      >
        아이디/비밀번호 찾기
      </Link>
      <span className="bg-lightGray h-3 w-px" aria-hidden="true" />
      <OnboardingNotice>
        <Link
          className="text-mainBlue focus-visible:outline-mainBlue flex min-h-11 items-center rounded px-1 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          to="/signup"
        >
          회원가입
        </Link>
      </OnboardingNotice>
    </div>
  );
};

export default SignInOptions;

interface OnboardingNoticeProps {
  children: ReactNode;
}
const OnboardingNotice = ({ children }: OnboardingNoticeProps) => {
  const isConfirmed = localStorage.getItem('signupLeaderMsgConfirmed');
  const [isOpen, setIsOpen] = useState(!isConfirmed);

  const handleConfirm = () => {
    setIsOpen(false);
    localStorage.setItem('signupLeaderMsgConfirmed', 'true');
  };
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverTrigger asChild className="pointer-events-auto relative z-50 bg-white" onClick={handleConfirm}>
          {children}
        </PopoverTrigger>
        <PopoverContent
          side="top"
          collisionPadding={16}
          sideOffset={12}
          aria-label="회원가입 안내"
          aria-describedby="signup-onboarding-description"
          onPointerDownOutside={(event) => event.preventDefault()}
          className="w-72 max-w-[calc(100vw-2rem)] border-0 bg-white p-4 shadow-lg"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p id="signup-onboarding-description" className="break-keep text-neutral-700">
              <strong className="text-mainBlue font-semibold">팀장 </strong>
              <span>또는 </span>
              <strong className="text-mainBlue font-semibold">팀원</strong>
              <span>이신가요? 소셜 로그인 대신 직접 </span>
              <Link
                to="/signup"
                onClick={handleConfirm}
                className="text-mainBlue focus-visible:outline-mainBlue rounded font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                회원가입
              </Link>{' '}
              <span>해주세요</span>
            </p>
            <button
              onClick={handleConfirm}
              type="button"
              className="text-mainBlue focus-visible:outline-mainBlue min-h-11 self-end rounded px-3 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              확인
            </button>
          </div>
          <PopoverArrow className="fill-white" width={12} height={6} />
        </PopoverContent>
      </Popover>
      <Backdrop isVisible={isOpen} />
    </>
  );
};
