import { ButtonHTMLAttributes, type Ref } from 'react';
import { cn } from '@components/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { useAdminUi } from './AdminUiContext';

const adminButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-mainBlue focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-lightGray disabled:bg-whiteGray disabled:text-neutral-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-mainBlue text-white hover:brightness-110',
        destructive: 'bg-destructive text-white hover:brightness-95',
        outline: 'border-lightGray hover:bg-whiteGray border bg-white text-neutral-700',
      },
      size: {
        default: 'min-h-11 px-4 py-2',
        sm: 'min-h-9 px-3 py-1.5',
        lg: 'min-h-11 px-6 py-2.5',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

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
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { ref?: Ref<HTMLButtonElement> }) => {
  const isAdminUi = useAdminUi();
  return (
    <button className={cn((isAdminUi ? adminButtonVariants : buttonVariants)({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
};
