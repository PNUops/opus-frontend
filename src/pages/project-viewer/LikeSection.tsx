import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaSpinner } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';

import { getMyContestVoteStatus } from '@apis/vote';
import { addLike, removeLike, addVote, removeVote } from '@apis/projectViewer';
import Backdrop from '@components/Backdrop';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import { Arrow as PopoverArrow } from '@radix-ui/react-popover';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { useIsVoteTerm } from '@hooks/useVoteTerm';
import { invalidateMyLikeActivityQueries, invalidateMyVoteActivityQueries } from '@queries/me';
import { getApiErrorMessage } from '@utils/error';

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
      invalidateMyLikeActivityQueries(queryClient);
      toast(nextIsLiked ? '좋아요를 눌렀어요' : '좋아요를 취소했어요');
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '요청에 실패했어요.'), 'error');
    },
  });

  const voteMutation = useMutation({
    mutationFn: (nextIsVoted: boolean) => (nextIsVoted ? addVote(teamId) : removeVote(teamId)),
    onSuccess: (data, nextIsVoted) => {
      invalidateVoteLikeQueries();
      invalidateMyVoteActivityQueries(queryClient);
      toast(nextIsVoted ? '투표를 완료했어요' : '투표를 취소했어요');
      showVoteTooltip(data.remainingVotesCount, data.maxVotesLimit);
    },
    onError: (err) => {
      toast(getApiErrorMessage(err, '요청에 실패했어요.'), 'error');
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
    <div className="flex items-center justify-center gap-3">
      {isVoteTerm ? (
        <VoteNotice>
          <VoteCountToolTip
            isOpen={showVoteCountTooltip}
            remainingVotesCount={remainingVotesCount}
            maxVotesLimit={maxVotesLimit}
          >
            <button
              type="button"
              aria-pressed={votedState}
              aria-busy={voteMutation.isPending}
              onClick={handleVoteClick}
              disabled={voteMutation.isPending}
              className={`${
                votedState
                  ? 'border-mainGreen bg-subGreen hover:bg-subGreen/70 text-gray-800'
                  : 'border-lightGray hover:border-mainGreen bg-white text-gray-700 hover:text-gray-900'
              } focus-visible:outline-mainGreen relative inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait`}
            >
              {voteMutation.isPending ? (
                <FaSpinner aria-hidden size={18} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <MdHowToVote aria-hidden size={18} className={votedState ? 'text-mainGreen' : undefined} />
              )}
              <span>투표</span>
            </button>
          </VoteCountToolTip>
        </VoteNotice>
      ) : (
        <button
          type="button"
          aria-pressed={likedState}
          aria-busy={likeMutation.isPending}
          onClick={handleLikeClick}
          disabled={likeMutation.isPending}
          className={`${
            likedState
              ? 'border-mainGreen bg-subGreen hover:bg-subGreen/70 text-gray-800'
              : 'border-lightGray hover:border-mainGreen bg-white text-gray-700 hover:text-gray-900'
          } focus-visible:outline-mainGreen relative inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait`}
        >
          {likeMutation.isPending ? (
            <FaSpinner aria-hidden size={16} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <FaHeart aria-hidden size={16} className={likedState ? 'text-mainGreen' : undefined} />
          )}
          <span>좋아요</span>
        </button>
      )}
    </div>
  );
};

export default LikeSection;

const readConfirmedVoteNoticeUsers = (): number[] => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('voteAbuseMsgConfirmedUserList') ?? '[]');
    return Array.isArray(stored) ? stored.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
};

const VoteNotice = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const anchorRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(() => Boolean(user && !readConfirmedVoteNoticeUsers().includes(user.id)));

  const handleConfirm = () => {
    setIsOpen(false);
    if (!user) return;
    try {
      const confirmedUsers = new Set([...readConfirmedVoteNoticeUsers(), user.id]);
      localStorage.setItem('voteAbuseMsgConfirmedUserList', JSON.stringify([...confirmedUsers]));
    } catch {
      // Storage restrictions must not prevent closing the notice or voting.
    }
  };

  return (
    <div className="flex justify-center">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className="rounded-lg bg-white p-2">
            {children}
          </div>
        </PopoverAnchor>
        <PopoverContent
          side="top"
          sideOffset={8}
          collisionPadding={16}
          aria-label="투표 안내"
          aria-describedby={descriptionId}
          onPointerDownOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            anchorRef.current?.querySelector('button')?.focus();
          }}
          className="w-72 max-w-[calc(100vw-2rem)] border-0 bg-white p-4 shadow-lg"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <div id={descriptionId} className="space-y-2 break-keep text-neutral-700">
              <p>
                <strong className="text-mainBlue font-semibold">부정 로그인 계정</strong>도 모니터링하고 있어요.
              </p>
              <p>투표 남용이 의심되는 경우, 경고 없이 제한될 수 있어요.</p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="text-mainBlue focus-visible:outline-mainBlue min-h-11 self-end rounded px-3 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              확인
            </button>
          </div>
          <PopoverArrow className="fill-white" width={12} height={6} />
        </PopoverContent>
      </Popover>
      <Backdrop isVisible={isOpen} />
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
      <TooltipContent collisionPadding={16} className="max-w-3xs duration-100">
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
