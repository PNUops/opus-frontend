import ContestSelect from '@pages/admin/ContestSelect';
import QueryWrapper from 'providers/QueryWrapper';
import { useState } from 'react';
import { MdArrowBackIos } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const LayoutTopBar = () => {
  const [contestId, setContestId] = useState<string>('');
  const navigate = useNavigate();

  const onChangeContest = (contestId: string) => {
    setContestId(contestId);
    navigate(`/admin/contest/${contestId}`);
  };

  return (
    <div className="flex gap-2 border-b px-8 py-2">
      <button onClick={() => navigate('/admin')}>
        <MdArrowBackIos className="text-midGray hover:text-mainGreen inline text-2xl transition-all" />
      </button>
      <QueryWrapper loadingStyle="h-10 my-0 rounded-sm" errorStyle="h-10 flex-wrap">
        <ContestSelect contestId={contestId} onChange={onChangeContest} />
      </QueryWrapper>
    </div>
  );
};
export default LayoutTopBar;
