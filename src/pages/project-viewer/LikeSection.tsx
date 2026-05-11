import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaHeart } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';

import { getMyContestVoteStatus } from '@apis/vote';
import { addLike, removeLike, addVote, removeVote } from '@apis/projectViewer';
import Backdrop from '@components/Backdrop';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { useIsVoteTerm } from '@hooks/useVoteTerm';

interface LikeSectionProps {
  contestId: number;
  teamId: number;
  isLiked: boolean | null;
  isVoted: boolean | null;
}

const LikeSection = ({ contestId, teamId, isLiked, isVoted }: LikeSectionProps) => {
  const { isSignedIn, user } = useAuth();
  const { isVoteTerm } = useIsVoteTerm(contestId);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [showVoteCountTooltip, setShowVoteCountTooltip] = useState(false);
  const [remainingVotesCount, setRemainingVotesCount] = useState<number | null>(null);
  const [maxVotesLimit, setMaxVotesLimit] = useState<number | null>(null);
  const [likedState, setLikedState] = useState(Boolean(isLiked));
  const [votedState, setVotedState] = useState(Boolean(isVoted));

  useEffect(() => {
    setLikedState(Boolean(isLiked));
  }, [isLiked]);

  useEffect(() => {
    setVotedState(Boolean(isVoted));
  }, [isVoted]);

  const showVoteTooltip = (nextRemainingVotesCount: number, currentMaxVotesLimit: number) => {
    setRemainingVotesCount(nextRemainingVotesCount);
    setMaxVotesLimit(currentMaxVotesLimit);
    setShowVoteCountTooltip(true);
    setTimeout(() => setShowVoteCountTooltip(false), 2000);
  };

  const invalidateVoteLikeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['teamDetail', teamId] });
    queryClient.invalidateQueries({ queryKey: ['teams', 'current', user?.id ?? 'guest'] });
    queryClient.invalidateQueries({ queryKey: ['teams', contestId, user?.id ?? 'guest'] });
    queryClient.invalidateQueries({ queryKey: ['myContestVoteStatus', contestId] });
  };

  const { data: myContestVoteStatus } = useQuery({
    queryKey: ['myContestVoteStatus', contestId],
    queryFn: () => getMyContestVoteStatus(contestId),
    enabled: isSignedIn && isVoteTerm,
  });

  useEffect(() => {
    if (!myContestVoteStatus) return;
    setRemainingVotesCount(myContestVoteStatus.remainingVotesCount);
    setMaxVotesLimit(myContestVoteStatus.maxVotesLimit);
  }, [myContestVoteStatus]);

  const likeMutation = useMutation({
    mutationFn: (nextIsLiked: boolean) => (nextIsLiked ? addLike(teamId) : removeLike(teamId)),
    onSuccess: (_, nextIsLiked) => {
      invalidateVoteLikeQueries();
      toast(nextIsLiked ? '좋아요를 눌렀어요' : '좋아요를 취소했어요');
    },
    onError: (err: any) => {
      toast(err.response?.data?.message ?? '요청에 실패했어요.', 'error');
    },
  });

  const voteMutation = useMutation({
    mutationFn: (nextIsVoted: boolean) => (nextIsVoted ? addVote(teamId) : removeVote(teamId)),
    onSuccess: (data, nextIsVoted) => {
      invalidateVoteLikeQueries();
      toast(nextIsVoted ? '투표를 완료했어요' : '투표를 취소했어요');
      showVoteTooltip(data.remainingVotesCount, data.maxVotesLimit);
    },
    onError: (err: any) => {
      toast(err.response?.data?.message ?? '요청에 실패했어요.', 'error');
    },
  });

  const checkSignedIn = () => {
    if (!isSignedIn) {
      toast('로그인이 필요해요.');
      navigate('/signin');
      return false;
    }
    return true;
  };

  const handleLikeClick = () => {
    if (!checkSignedIn()) return;
    if (likeMutation.isPending) return;

    const prev = likedState;
    const next = !prev;
    setLikedState(next);
    likeMutation.mutate(next, {
      onError: () => setLikedState(prev),
    });
  };

  const handleVoteClick = () => {
    if (!checkSignedIn()) return;
    if (voteMutation.isPending) return;

    const prev = votedState;
    const next = !prev;
    setVotedState(next);
    voteMutation.mutate(next, {
      onError: () => setVotedState(prev),
    });
  };

  return (
    <LikeAbuseToolTip>
      <div className="flex items-center justify-center gap-3">
        {isVoteTerm ? (
          <VoteCountToolTip
            isOpen={showVoteCountTooltip}
            remainingVotesCount={remainingVotesCount}
            maxVotesLimit={maxVotesLimit}
          >
            <button
              onClick={handleVoteClick}
              disabled={voteMutation.isPending}
              className={`${
                votedState
                  ? 'bg-mainGreen text-white hover:bg-emerald-600'
                  : 'bg-lightGray text-white hover:bg-gray-300'
              } relative flex cursor-pointer items-center gap-5 justify-self-center rounded-full p-4 text-sm sm:px-8 sm:py-3`}
            >
              <MdHowToVote className={`${votedState ? 'text-white' : 'text-whiteGray'}`} size={20} />
              <span className="hidden sm:inline">투표</span>
            </button>
          </VoteCountToolTip>
        ) : (
          <button
            onClick={handleLikeClick}
            disabled={likeMutation.isPending}
            className={`${
              likedState ? 'bg-mainGreen text-white hover:bg-emerald-600' : 'bg-lightGray text-white hover:bg-gray-300'
            } relative flex cursor-pointer items-center gap-5 justify-self-center rounded-full p-4 text-sm sm:px-8 sm:py-3`}
          >
            <FaHeart className={`${likedState ? 'text-white' : 'text-whiteGray'}`} size={20} />
            <span className="hidden sm:inline">좋아요</span>
          </button>
        )}
      </div>
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
        <TooltipTrigger asChild>
          <div className="z-50 rounded-lg bg-white p-2" onClick={handleConfirm}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-3xs duration-400">
          <div className="flex flex-col gap-2 p-2 text-base">
            <p className="break-keep">
              <strong className="text-mainBlue font-semibold">부정 로그인 계정</strong>도 모니터링하고 있어요.
            </p>
            <p>투표 남용이 의심되는 경우, 경고 없이 제한 될 수 있어요.</p>
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

const VoteCountToolTip = ({
  isOpen,
  remainingVotesCount,
  maxVotesLimit,
  children,
}: {
  isOpen: boolean;
  remainingVotesCount: number | null;
  maxVotesLimit: number | null;
  children: ReactNode;
}) => {
  return (
    <Tooltip open={isOpen && remainingVotesCount !== null && maxVotesLimit !== null}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-3xs duration-100">
        <div className="flex flex-col gap-2 p-2 text-base">
          <p className="break-keep">
            <span>남은 투표권 </span>
            <strong className="text-mainBlue font-semibold">{`${remainingVotesCount}개`}</strong>
            <span>{` / 전체 ${maxVotesLimit}개`}</span>
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
