import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell } from 'recharts';
import { getVoteRate } from 'apis/voteRate';
import { VoteRateResponseDto } from 'types/DTO';

const VoteRate = () => {
  const { data, isLoading, isError } = useQuery<VoteRateResponseDto>({
    queryKey: ['voteRate'],
    queryFn: getVoteRate,
  });

  const pieColors = ['#22c55e', '#e5e7eb'];
  const voteData = data ?? { voteRate: 0, totalVoteCount: 0 };
  const { voteRate, totalVoteCount } = voteData;

  return (
    <section>
      {isError ? (
        <div className="mx-auto w-full rounded bg-white p-6 text-center shadow-md">
          <p className="text-red-500">투표 참여율을 불러오는 데 실패했습니다.</p>
        </div>
      ) : isLoading ? (
        <p className="text-center text-gray-400">로딩 중...</p>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-bold">투표 참여율</h2>
          <div
            className="mx-auto w-full min-w-[200px] rounded bg-white p-6 text-center shadow-md"
            style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.12)' }}
          >
            <div className="flex justify-center">
              <PieChart width={150} height={150}>
                <Pie
                  data={[{ name: '배경', value: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  startAngle={0}
                  endAngle={360}
                  dataKey="value"
                >
                  <Cell fill={pieColors[1]} stroke="none" />
                </Pie>
                <Pie
                  data={[{ name: '참여', value: voteRate }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={90 - (360 * voteRate) / 100}
                  dataKey="value"
                  cornerRadius={10}
                >
                  <Cell fill={pieColors[0]} />
                </Pie>
              </PieChart>
            </div>
            <p className="-mt-22 text-xl font-bold text-green-600">{voteRate}%</p>
            <p className="mt-20 text-gray-400">총 투표수</p>
            <p className="text-lg font-bold">
              <span className="text-black">{totalVoteCount}개</span>
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default VoteRate;
