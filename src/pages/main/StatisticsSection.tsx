import { useEffect, useState } from 'react';
import { cn } from 'utils/classname';

// TODO: 추후 실제 API 응답 타입으로 교체
interface StatisticsData {
  projectCount: number;
  visitorCount: number;
  likeCount: number;
}

const StatisticsSection = () => {
  // 초기 더미 데이터
  const [data, setData] = useState<StatisticsData>({
    projectCount: 1284,
    visitorCount: 2431,
    likeCount: 8029,
  });

  // TODO: API 연동 시 아래 코드를 활성화하고 getStatistics 함수 구현 필요
  /*
  const { data: serverData } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics, // API 함수 필요
  });

  useEffect(() => {
    if (serverData) setData(serverData);
  }, [serverData]);
  */

  // 숫자 포맷팅 (1000 -> 1,000)
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <section className="flex flex-col gap-4">
      <div className="text-center font-semibold text-black/80">
        부산대학교 SW 프로젝트 관리 시스템은 이렇게 성장하고 있어요 🚀
      </div>

      <div className="flex w-full flex-col justify-around gap-8 rounded-2xl bg-white px-4 py-10 shadow-sm sm:flex-row sm:gap-0 sm:px-10">
        <StatItem label="프로젝트 등록 수" value={`${formatNumber(data.projectCount)}개`} />

        <Divider />

        <StatItem label="오늘 방문자 수" value={`${formatNumber(data.visitorCount)}명`} />

        <Divider />

        <StatItem label="총 좋아요 수" value={`${formatNumber(data.likeCount)}개`} />
      </div>
    </section>
  );
};

export default StatisticsSection;

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg--color-subGreen flex flex-1 flex-col items-center justify-center gap-2 text-center">
    <span className="text-3xl font-bold text-black sm:text-4xl">{value}</span>
    <span className="text-midGray text-sm font-medium">{label}</span>
  </div>
);

const Divider = () => <div className="hidden h-16 w-[1px] bg-gray-200 sm:block" aria-hidden="true" />;
