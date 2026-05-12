import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { InputHTMLAttributes, useState } from 'react';
import Input from './Input';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const PasswordInput = ({ value, ...rest }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input type={showPassword ? 'text' : 'password'} placeholder="비밀번호" value={value} {...rest} />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-midGray absolute top-1/2 right-3 -translate-y-1/2"
      >
        {showPassword ? <MdOutlineVisibilityOff className="text-xl" /> : <MdOutlineVisibility className="text-xl" />}
      </button>
    </div>
  );
};
export default PasswordInput;
