import { cn } from '@components/lib/utils';

export const AdminNoData = ({ className }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('text-midGray my-10 flex items-center justify-center font-bold', className)}>
      데이터가 없습니다.
    </div>
  );
};
