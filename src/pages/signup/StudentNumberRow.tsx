import Input from '@components/Input';
import AuthField from '../auth/AuthField';
import { authInputClass } from '../auth/styles';

interface Props {
  value: string;
  setValue: (value: string) => void;
  error?: string;
  onBlur?: () => void;
}

const StudentNumberRow = ({ value, setValue, error, onBlur }: Props) => {
  return (
    <AuthField id="signup-student-id" label="학번" error={error}>
      <Input
        id="signup-student-id"
        name="studentId"
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'signup-student-id-error' : undefined}
        className={authInputClass}
        inputMode="numeric"
        value={value}
        onBlur={onBlur}
        onChange={(e) => {
          const input = e.target.value;
          if (/^\d*$/.test(input)) setValue(input);
        }}
      />
    </AuthField>
  );
};
export default StudentNumberRow;
