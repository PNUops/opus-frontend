import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { InputHTMLAttributes, useState } from 'react';
import Input from './Input';
import { cn } from '@utils/classname';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  toggleClassName?: string;
}

const PasswordInput = ({ value, toggleClassName, ...rest }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input type={showPassword ? 'text' : 'password'} placeholder="비밀번호" value={value} {...rest} />
      <button
        type="button"
        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
        aria-pressed={showPassword}
        aria-controls={rest.id}
        disabled={rest.disabled}
        onClick={() => setShowPassword(!showPassword)}
        className={cn('text-midGray absolute top-1/2 right-3 -translate-y-1/2', toggleClassName)}
      >
        {showPassword ? <MdOutlineVisibilityOff className="text-xl" /> : <MdOutlineVisibility className="text-xl" />}
      </button>
    </div>
  );
};
export default PasswordInput;
