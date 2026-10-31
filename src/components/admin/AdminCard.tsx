import { cn } from '@components/lib/utils';

export const AdminCard = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('border-lightGray flex min-w-0 flex-col rounded-lg border bg-white', className)} {...props}>
      {children}
    </div>
  );
};

export const AdminCardTop = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'border-lightGray flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 [&>h2]:text-xl [&>h2]:font-semibold',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const AdminCardCreateButton = ({ children, className, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button
      type="button"
      className={cn(
        'text-mainBlue hover:bg-whiteGray focus-visible:outline-mainBlue inline-flex min-h-11 shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const AdminCardRow = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-between gap-3 px-5 py-3 text-sm leading-6 text-neutral-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
