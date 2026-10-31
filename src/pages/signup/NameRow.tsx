import Input from '@components/Input';
import AuthField from '../auth/AuthField';
import { authInputClass } from '../auth/styles';

interface Props {
  value: string;
  setValue: (value: string) => void;
  error?: string;
  onBlur?: () => void;
}

const NameRow = ({ value, setValue, error, onBlur }: Props) => {
  return (
    <AuthField id="signup-name" label="이름" error={error}>
      <Input
        id="signup-name"
        name="name"
        autoComplete="name"
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'signup-name-error' : undefined}
        className={authInputClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    </AuthField>
  );
};
export default NameRow;
