import { cn } from '@components/lib/utils';

export const AdminCard = ({ children }: React.ComponentProps<'div'>) => {
  return <div className="border-lightGray flex flex-col gap-0.5 rounded-xl border-2">{children}</div>;
};

export const AdminCardTop = ({ children }: React.ComponentProps<'div'>) => {
  return <div className="border-lightGray flex items-center justify-between border-b px-5 py-4">{children}</div>;
};

export const AdminCardCreateButton = ({ children, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button className="text-midGray hover:text-mainBlue rounded-xl px-[15px] py-2.5 font-bold" {...props}>
      {children}
    </button>
  );
};

export const AdminCardRow = ({ children, className }: React.ComponentProps<'div'>) => {
  return <div className={cn('flex items-center justify-between px-5 py-3', className)}>{children}</div>;
};
