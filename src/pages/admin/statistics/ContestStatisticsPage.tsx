import { Navigate } from 'react-router-dom';
import { useContestId } from '@hooks/useId';
import { VoteReportSection } from './VoteReportSection';
import VoteLogSection from './VoteLogSection';

const ContestStatisticsPage = () => {
  const contestId = useContestId();
  if (contestId === null || !Number.isSafeInteger(contestId) || contestId <= 0) return <Navigate to="/admin" replace />;
  return (
    <div className="flex min-w-0 flex-col gap-12">
      <VoteReportSection key={contestId} contestId={contestId} />
      <VoteLogSection key={`log-${contestId}`} />
    </div>
  );
};

export default ContestStatisticsPage;
