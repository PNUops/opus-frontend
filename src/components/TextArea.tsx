import { TextareaHTMLAttributes } from 'react';
import { cn } from '@utils/classname';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { appearance?: 'default' | 'admin' };

const TextArea = ({ className = '', appearance = 'default', ...props }: Props) => {
  return (
    <textarea
      className={
        appearance === 'admin'
          ? cn(
              'border-lightGray focus:border-mainBlue focus:outline-mainBlue disabled:bg-whiteGray aria-invalid:border-destructive w-full min-w-0 resize-y rounded-md border bg-white px-3 py-2.5 text-base leading-6 text-neutral-900 placeholder:text-neutral-500 focus:outline-2 focus:outline-offset-1 disabled:cursor-not-allowed disabled:text-neutral-500',
              className,
            )
          : `border-lightGray focus:outline-mainGreen w-full rounded-lg border p-3 text-lg focus:outline-2 ${className}`
      }
      {...props}
    />
  );
};

export default TextArea;
