import { cn } from '@components/lib/utils';

export const ActivityEmptyState = ({ message, className }: { message: string; className?: string }) => {
  return (
    <div
      className={cn(
        'border-lightGray text-midGray flex min-h-36 w-full items-center justify-center rounded-lg border bg-white px-4 text-center text-sm font-medium',
        className,
      )}
    >
      {message}
    </div>
  );
};

export const ActivityPreviewSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="flex min-h-55 w-full gap-4 overflow-hidden py-2 sm:gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-48 min-w-55 animate-pulse rounded-lg bg-neutral-200 sm:min-w-55" />
      ))}
    </div>
  );
};
