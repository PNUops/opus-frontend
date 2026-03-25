import { cn } from '@components/lib/utils';
import { FaCheck } from 'react-icons/fa';
import { useContestCreate } from './ContestCreateContext';
import { contestCreateSteps } from '@constants/contest';

const ContestCreateProgress = () => {
  const { currentStep } = useContestCreate();

  return (
    <div className="flex items-center justify-center">
      <ol className="flex w-full max-w-2xl items-center justify-center gap-3">
        {contestCreateSteps.flatMap((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          const stepNode = (
            <li key={step}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500 sm:h-10 sm:w-10',
                    {
                      'bg-mainGreen text-white': isCurrent || isCompleted,
                      'text-midGray bg-gray-200': !isCurrent && !isCompleted,
                    },
                  )}
                >
                  {isCompleted ? <FaCheck /> : <span className="font-bold">{stepNumber}</span>}
                </span>
                <span
                  className={cn('text-center text-sm whitespace-nowrap transition-all duration-500 sm:text-base', {
                    'font-bold': isCurrent,
                  })}
                >
                  {step}
                </span>
              </div>
            </li>
          );

          const connectorNode =
            index < contestCreateSteps.length - 1 ? (
              <li key={`${step}-connector`} className="w-10 sm:w-25" aria-hidden="true">
                <div className="h-0.5 rounded-full bg-gray-200">
                  <div
                    className={cn(
                      'bg-mainGreen h-0.5 rounded-full transition-all duration-500 ease-in-out',
                      isCompleted ? 'w-full' : 'w-0',
                    )}
                  />
                </div>
              </li>
            ) : null;

          return [stepNode, connectorNode];
        })}
      </ol>
    </div>
  );
};

export default ContestCreateProgress;
