import { useState } from 'react';
import { Button } from '@components/ui/button';
import { cn } from '@components/lib/utils';
import RankingListSection from './RankingListSection';
import StatCardsSection from './StatCardsSection';
import VoteLogTable from './VoteLogTable';

const ContestStatisticsPage = () => {
  const [mode, setMode] = useState<'vote' | 'like'>('vote');

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex gap-4">
        <Button
          className={cn(
            mode === 'vote'
              ? 'bg-subGreen hover:bg-subGreen text-black'
              : 'bg-whiteGray text-midGray hover:bg-subGreen',
          )}
          onClick={() => setMode('vote')}
        >
          투표 통계
        </Button>
        <Button
          className={cn(
            mode === 'like'
              ? 'bg-subGreen hover:bg-subGreen text-black'
              : 'bg-whiteGray text-midGray hover:bg-subGreen',
          )}
          onClick={() => setMode('like')}
        >
          좋아요 통계
        </Button>
      </div>
      <RankingListSection />
      <StatCardsSection mode={mode} />
      {mode === 'vote' && <VoteLogTable />}
    </div>
  );
};

export default ContestStatisticsPage;
