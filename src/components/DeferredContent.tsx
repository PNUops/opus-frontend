import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Spinner from '@components/Spinner';
import { cn } from '@utils/classname';

interface DeferredContentProps {
  children: ReactNode;
  loadingMessage?: string;
  onCancel?: () => void;
  tone?: 'default' | 'editorial';
}

const DeferredFallback = ({
  isError = false,
  loadingMessage,
  onCancel,
  tone = 'default',
}: Omit<DeferredContentProps, 'children'> & { isError?: boolean }) => (
  <div
    role={isError ? 'alert' : 'status'}
    className={cn(
      'flex min-h-40 flex-col items-center justify-center gap-3 px-4 py-6 text-center',
      tone === 'editorial' ? 'text-white' : 'text-neutral-900',
    )}
  >
    {isError ? (
      <>
        <p className="text-base font-medium break-keep">화면을 불러오지 못했어요.</p>
        <p
          className={cn(
            'text-sm leading-relaxed break-keep',
            tone === 'editorial' ? 'text-white/75' : 'text-neutral-600',
          )}
        >
          연결 상태를 확인한 뒤 새로고침해 주세요.
        </p>
      </>
    ) : (
      <>
        <span aria-hidden="true" className="flex size-6 items-center justify-center">
          <Spinner className="size-6 motion-reduce:animate-none" />
        </span>
        <p
          className={cn(
            'text-sm leading-relaxed break-keep',
            tone === 'editorial' ? 'text-white/75' : 'text-neutral-600',
          )}
        >
          {loadingMessage}
        </p>
      </>
    )}
    {(isError || onCancel) && (
      <div className="flex flex-wrap justify-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-lightGray focus-visible:outline-mainBlue min-h-11 rounded-md border bg-white px-4 text-sm text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            취소
          </button>
        )}
        {isError && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-mainBlue focus-visible:outline-mainBlue min-h-11 rounded-md px-4 text-sm font-medium text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            새로고침
          </button>
        )}
      </div>
    )}
  </div>
);

const DeferredContent = ({
  children,
  loadingMessage = '화면을 준비하고 있어요.',
  onCancel,
  tone,
}: DeferredContentProps) => (
  <ErrorBoundary fallback={<DeferredFallback isError onCancel={onCancel} tone={tone} />}>
    <Suspense fallback={<DeferredFallback loadingMessage={loadingMessage} onCancel={onCancel} tone={tone} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export default DeferredContent;
