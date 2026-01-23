import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className = '', ...props }: Props) => {
  return (
    <input
      className={twMerge(
        `border-lightGray focus:outline-mainGreen w-full rounded-lg border p-3 text-lg focus:outline-2`,
        className,
      )}
      {...props}
    />
  );
};

export default Input;
