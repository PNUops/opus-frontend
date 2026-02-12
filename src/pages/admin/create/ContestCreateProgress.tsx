import { cn } from '@components/lib/utils';
import { FaCheck } from 'react-icons/fa';
import { useContestCreate } from './ContestCreateContext';

const steps = ['대회 생성', '대회 참여자 설정', '필수 항목 설정'];

const ContestCreateProgress = () => {
  const { currentStep } = useContestCreate();

  return (
    <div className="flex items-center justify-center">
      <ol className="flex w-full max-w-2xl items-center justify-center gap-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li
              key={step}
              className={cn('flex items-center gap-2', {
                "after:bg-midGray after:inline-block after:h-0.5 after:w-10 after:content-[''] sm:after:w-25":
                  index < steps.length - 1,
                'after:bg-mainGreen': isCompleted,
              })}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10', {
                    'bg-mainGreen text-white': isCurrent || isCompleted,
                    'text-midGray bg-gray-200': !isCurrent && !isCompleted,
                  })}
                >
                  {isCompleted ? <FaCheck /> : <span className="font-bold">{stepNumber}</span>}
                </span>
                <span
                  className={cn('text-center text-[14px] whitespace-nowrap sm:text-sm', {
                    'font-bold': isCurrent,
                  })}
                >
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ContestCreateProgress;
