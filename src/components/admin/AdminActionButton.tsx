import { ButtonHTMLAttributes } from 'react';
import { cn } from '@components/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'disabled:bg-midGray flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap text-white transition-colors disabled:pointer-events-none hover:shadow-lg [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-mainBlue hover:bg-blue-800',
        destructive: 'bg-mainRed hover:bg-red-600',
        outline: 'border border-lightGray text-midGray hover:bg-gray-100',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-7 py-3',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export const AdminActionButton = ({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
};
