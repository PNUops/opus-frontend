import { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = ({ className = '', ...props }: Props) => {
  return (
    <textarea
      className={`border-lightGray focus:outline-mainGreen w-full rounded-lg border p-3 text-lg focus:outline-2 ${className}`}
      {...props}
    />
  );
};

export default TextArea;
