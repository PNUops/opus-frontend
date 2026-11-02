import { ContestSlots } from './ContestSlots';
import QueryWrapper from '@providers/QueryWrapper';

const OngoingContestSetting = () => {
  return (
    <section aria-labelledby="ongoing-contest-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="ongoing-contest-heading" className="text-2xl font-bold text-neutral-900">
          진행 중인 대회
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          메인 페이지에 표시할 대회를 선택하세요. 최대 2개까지 설정할 수 있습니다.
        </p>
      </div>
      <QueryWrapper loadingStyle="my-0 h-20 max-w-[720px] rounded-lg" errorStyle="min-h-28 max-w-[720px]">
        <ContestSlots />
      </QueryWrapper>
    </section>
  );
};

export default OngoingContestSetting;
