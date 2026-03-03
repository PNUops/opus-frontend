import { useState } from 'react';
import { ContestSlots } from './ContestSlots';
import ContestSelect from './ContestSelect';
import QueryWrapper from 'providers/QueryWrapper';

const OngoingContestSetting = () => {
  const [selectedContest, setSelectedContest] = useState<string>('');

  const onChangeContest = (contestId: string) => setSelectedContest(contestId);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">진행 중인 대회 설정</h2>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <QueryWrapper loadingStyle="h-10 my-0 rounded-sm" errorStyle="h-10 flex-wrap">
          <ContestSelect contestId={selectedContest} onChange={onChangeContest} />
          <div className="flex flex-wrap gap-5">
            <ContestSlots selectedId={selectedContest} />
          </div>
        </QueryWrapper>
      </div>
    </div>
  );
};

export default OngoingContestSetting;
