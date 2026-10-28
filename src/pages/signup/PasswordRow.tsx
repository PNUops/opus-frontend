import PasswordInput from '@components/PasswordInput';
import AuthField from '../auth/AuthField';
import { authInputClass, authPasswordToggleClass } from '../auth/styles';

interface Props {
  value: string;
  setValue: (value: string) => void;
  error?: string;
}

const PasswordRow = ({ value, setValue, error }: Props) => {
  return (
    <AuthField id="signup-password" label="비밀번호" error={error} hint="영어, 숫자, 특수문자를 포함한 8~16자">
      <PasswordInput
        id="signup-password"
        name="password"
        autoComplete="new-password"
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'signup-password-hint signup-password-error' : 'signup-password-hint'}
        className={`${authInputClass} pr-12`}
        toggleClassName={authPasswordToggleClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="비밀번호 입력"
      />
    </AuthField>
  );
};
export default PasswordRow;
