import { cn } from '@components/lib/utils';

type DividerProps = {
  className?: string;
};

const Divider = ({ className }: DividerProps) => {
  return <div className={cn('border-lightGray border-t', className)} />;
};

export default Divider;
