import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from 'utils/classname';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const Button = ({ className = '', children, ...props }: Props) => {
  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-md px-4 py-2 text-center text-sm text-nowrap text-white hover:cursor-pointer hover:bg-gray-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
