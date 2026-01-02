import { twMerge } from 'tailwind-merge';

const Tag = ({ children, className }: React.ComponentProps<'div'>) => {
  return (
    <div className={twMerge('min-w-[70px] rounded-full px-3 py-1 text-center text-xs text-white', className)}>
      {children}
    </div>
  );
};

export default Tag;
