import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { API_BASE_URL } from '@constants/env';
import defaultBanner from 'assets/basicThumbnail.jpg';
import { currentContestOption } from 'queries/contest';

const CurrentContestSection = () => {
  const { data: currentContests } = useSuspenseQuery(currentContestOption());

  return (
    <div className="flex flex-col gap-5">
      {currentContests.map((contest) => (
        <Link
          key={contest.contestId}
          to={`/contest/${contest.contestId}`}
          className="group relative flex h-48 w-full items-end overflow-hidden rounded-3xl shadow-lg transition-all hover:shadow-xl sm:h-64"
        >
          <img
            src={`${API_BASE_URL}/api/contests/${contest.contestId}/image/banner`}
            alt={contest.contestName}
            className="absolute inset-0 h-full w-full object-cover blur-sm transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = defaultBanner)}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="relative z-20 flex w-full justify-between px-8 py-8 text-white sm:px-12 sm:py-10">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-gray-900">
                  {contest.categoryName}
                </span>
              </div>
              <h2 className="text-2xl leading-tight font-bold sm:text-4xl">{contest.contestName}</h2>
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <FaCalendarAlt className="text-lg" />
                <span>{`${dayjs(contest.voteStartAt).format('MM월 DD일')} ~ ${dayjs(contest.voteEndAt).format('MM월 DD일')}`}</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black sm:h-16 sm:w-16">
              <FaChevronRight size={24} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CurrentContestSection;
