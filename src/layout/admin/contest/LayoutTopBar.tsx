import Select from '@components/Select';
import useContests from 'hooks/useContests';
import { MdArrowBackIos } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const LayoutTopBar = () => {
  const { contestId: contestIdParam } = useParams();
  const navigate = useNavigate();
  const { data } = useContests();
  const contests = data ?? [];

  return (
    <div className="border-b px-8 py-2">
      <button onClick={() => navigate('/admin')}>
        <MdArrowBackIos className="text-midGray hover:text-mainGreen inline text-2xl transition-all" />
      </button>
      <Select
        onChange={(e) => {
          const contestId = e.target.value;
          navigate(`/admin/contest/${contestId}`);
        }}
      >
        {contests.map((contest) => (
          <option
            key={contest.contestId}
            value={contest.contestId}
            selected={contest.contestId === Number(contestIdParam)}
          >
            {contest.contestName}
          </option>
        ))}
      </Select>
    </div>
  );
};
export default LayoutTopBar;
