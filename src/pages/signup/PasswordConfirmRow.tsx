import PasswordInput from '@components/PasswordInput';
import AuthField from '../auth/AuthField';
import { authInputClass, authPasswordToggleClass } from '../auth/styles';

interface Props {
  value: string;
  setValue: (value: string) => void;
  error?: string;
  onBlur?: () => void;
}

const PasswordConfirmRow = ({ value, setValue, error, onBlur }: Props) => {
  return (
    <AuthField id="signup-password-confirm" label="비밀번호 확인" error={error}>
      <PasswordInput
        id="signup-password-confirm"
        name="passwordConfirm"
        autoComplete="new-password"
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'signup-password-confirm-error' : undefined}
        className={`${authInputClass} pr-12`}
        toggleClassName={authPasswordToggleClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        placeholder="비밀번호 다시 입력"
      />
    </AuthField>
  );
};
export default PasswordConfirmRow;
