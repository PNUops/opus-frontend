import { ReactNode, Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { cn } from '@components/lib/utils';
import Button from '@components/Button';

interface QueryWrapperProps {
  children: ReactNode;
  loadingStyle?: string;
  errorStyle?: string;
  loadingFallback?: ReactNode;
  errorFallback?: (props: FallbackProps) => ReactNode;
}

/**
 * Suspense와 ErrorBoundary를 결합하여 useSuspenseQuery의 로딩 및 에러 상태를 처리하는 Wrapper 컴포넌트입니다.
 *
 * @component
 * @example
 * ```tsx
 * <QueryWrapper loadingStyle="h-32" errorStyle="h-32">
 *   {useSuspenseQuery 사용하는 컴포넌트}
 * </QueryWrapper>
 * ```
 *
 * @param {ReactNode} children - useSuspenseQuery를 사용하는 자식 컴포넌트
 * @param {string} [loadingStyle] - 기본 로딩 UI(스켈레톤)에 적용할 Tailwind CSS 클래스
 * @param {string} [errorStyle] - 기본 에러 UI 컨테이너에 적용할 Tailwind CSS 클래스
 * @param {ReactNode} [loadingFallback] - 기본 로딩 UI 대신 사용할 커스텀 로딩 컴포넌트
 * @param {(props: FallbackProps) => ReactNode} [errorFallback] - 기본 에러 UI 대신 사용할 커스텀 에러 컴포넌트
 */

const QueryWrapper = ({
  children,
  loadingStyle,
  errorStyle,
  loadingFallback = <LoadingFallback className={loadingStyle} />,
  errorFallback = (props) => <ErrorFallback {...props} className={errorStyle} />,
}: QueryWrapperProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallbackRender={errorFallback}>
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default QueryWrapper;

const LoadingFallback = ({ className }: { className?: string }) => {
  return <div className={cn('bg-lightGray my-3 flex w-full animate-pulse', className)}></div>;
};

const ErrorFallback = ({ resetErrorBoundary, className }: FallbackProps & { className?: string }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <p className="text-mainRed font-bold">데이터 조회 중 오류가 발생했습니다.</p>
      <Button className="border border-black text-base text-black" onClick={() => resetErrorBoundary()}>
        다시 시도
      </Button>
    </div>
  );
};
