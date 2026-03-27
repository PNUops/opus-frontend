import { useSuspenseQuery } from '@tanstack/react-query';
import { getMainStats } from 'apis/statistics';

const StatisticsSection = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['mainStats'],
    queryFn: getMainStats,
  });

  return (
    <section className="flex flex-col gap-10 rounded-2xl p-12.5 shadow-lg">
      <div className="text-center text-xl font-semibold">
        부산대학교 SW 프로젝트 관리 시스템은 이렇게 성장하고 있어요 🚀
      </div>
      <div className="flex w-full flex-col justify-around gap-8 sm:flex-row sm:gap-0">
        <StatItem label="진행된 대회 수" value={data.totalContests} />
        <Divider />
        <StatItem label="프로젝트 등록 수" value={data.totalProjects} />
        <Divider />
        <StatItem label="총 좋아요 수" value={data.totalLikes} />
      </div>
    </section>
  );
};

export default StatisticsSection;

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="bg--color-subGreen flex flex-1 flex-col items-center justify-center gap-2 text-center">
    <span className="text-2xl font-bold sm:text-3xl">{`${value.toLocaleString()}개`}</span>
    <span className="text-midGray text-sm font-medium">{label}</span>
  </div>
);

const Divider = () => <div className="hidden h-16 w-[1px] bg-gray-200 sm:block" aria-hidden="true" />;
