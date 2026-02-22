import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { patchLikeToggle } from 'apis/projectViewer';
import { useToast } from 'hooks/useToast';
import { FaHeart } from 'react-icons/fa';
import Backdrop from '@components/Backdrop';
import { ReactNode, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';

interface LikeSectionProps {
  contestId: number;
  teamId: number;
  isLiked: boolean | null;
}

const LikeSection = ({ contestId, teamId, isLiked }: LikeSectionProps) => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [showLikeCountTooltip, setShowLikeCountTooltip] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const handleLikeCountTooltip = (likeCount: number) => {
    setLikeCount(likeCount);
    setShowLikeCountTooltip(true);
    setTimeout(() => setShowLikeCountTooltip(false), 2000);
  };

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const likeMutation = useMutation({
    mutationFn: (nextIsLiked: boolean) => patchLikeToggle({ teamId, isLiked: nextIsLiked }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'current', user?.id ?? 'guest'] });
      queryClient.invalidateQueries({ queryKey: ['teams', contestId, user?.id ?? 'guest'] });
      toast(!isLiked ? '좋아요를 눌렀어요' : '좋아요를 취소했어요');

      handleLikeCountTooltip(res.remainingLikeCount);
    },
    onError: (err: any) => {
      toast(err.response.data.message ?? '요청에 실패했어요', 'error');
    },
  });

  const handleClick = () => {
    if (!isSignedIn) {
      toast('로그인이 필요해요.');
      navigate('/signin');
    }
    if (likeMutation.isPending) return;
    likeMutation.mutate(!isLiked);
  };

  return (
    <LikeAbuseToolTip>
      <LikeCountToolTip isOpen={showLikeCountTooltip} likeCount={likeCount}>
        <button
          onClick={handleClick}
          disabled={likeMutation.isPending}
          className={`${
            isLiked ? 'bg-mainGreen text-white hover:bg-emerald-600' : 'bg-lightGray text-white hover:bg-gray-300'
          } relative flex cursor-pointer items-center gap-5 justify-self-center rounded-full p-4 text-sm sm:px-8 sm:py-3`}
        >
          <FaHeart className={`${isLiked ? 'text-white' : 'text-whiteGray'}`} size={20} />
          <span className="hidden sm:inline">좋아요</span>
        </button>
      </LikeCountToolTip>
    </LikeAbuseToolTip>
  );
};

export default LikeSection;

const LikeAbuseToolTip = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const likeAbuseMsgConfirmedUserList = JSON.parse(localStorage.getItem('likeAbuseMsgConfirmedUserList') ?? '[]');
  const isConfirmed = !user || likeAbuseMsgConfirmedUserList.includes(user?.id);
  const [showTooltip, setShowTooltip] = useState(!isConfirmed);

  const handleConfirm = () => {
    setShowTooltip(false);
    likeAbuseMsgConfirmedUserList.push(user?.id);
    localStorage.setItem('likeAbuseMsgConfirmedUserList', JSON.stringify(likeAbuseMsgConfirmedUserList));
  };
  return (
    <div className="flex justify-center">
      <Tooltip open={showTooltip}>
        <TooltipTrigger className="z-50 rounded-lg bg-white p-2" onClick={handleConfirm}>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-3xs duration-400">
          <div className="flex flex-col gap-2 p-2 text-base">
            <p className="break-keep">
              <strong className="text-mainBlue font-semibold">부정 로그인 계정</strong>을 모니터링하고 있어요.
            </p>
            <p>좋아요 남용이 의심되는 경우, 경고 없이 제한 될 수 있어요.</p>
            <button
              onClick={handleConfirm}
              className="text-mainBlue self-end-safe hover:cursor-pointer hover:font-semibold"
            >
              확인
            </button>
          </div>
        </TooltipContent>
      </Tooltip>
      <Backdrop isVisible={showTooltip} />
    </div>
  );
};
const LikeCountToolTip = ({
  isOpen,
  likeCount,
  children,
}: {
  isOpen: boolean;
  likeCount: number | null;
  children: ReactNode;
}) => {
  return (
    <Tooltip open={isOpen && likeCount !== null}>
      <TooltipTrigger className="z-50 rounded-lg bg-white p-2">{children}</TooltipTrigger>
      <TooltipContent className="max-w-3xs duration-100">
        <div className="flex flex-col gap-2 p-2 text-base">
          <p className="break-keep">
            <span>{'남은 좋아요 '}</span>
            <strong className="text-mainBlue font-semibold">{`${likeCount}개`}</strong>
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
