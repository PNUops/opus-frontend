import { ComponentProps } from 'react';
import { cn } from '@utils/classname';

export const AdminTable = ({ className, ...props }: ComponentProps<'table'>) => (
  <table
    className={cn(
      '[&_th]:bg-whiteGray w-full border-collapse text-sm leading-6 [&_td]:px-5 [&_td]:py-4 [&_th]:px-5 [&_th]:py-3 [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-neutral-600',
      className,
    )}
    {...props}
  />
);
