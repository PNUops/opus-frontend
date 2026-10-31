import { useState } from 'react';
import { isPNUEmail } from '@utils/email';
import { isValidPassword } from '@utils/password';

interface SignUpFormState {
  name: string;
  studentNumber: string;
  email: string;
  isEmailVerified: boolean;
  password: string;
  passwordConfirm: string;
}
type SignUpField = Exclude<keyof SignUpFormState, 'isEmailVerified'>;
type SignUpFormError = Partial<Record<SignUpField, string>>;

const initialFormState: SignUpFormState = {
  name: '',
  studentNumber: '',
  email: '',
  isEmailVerified: false,
  password: '',
  passwordConfirm: '',
};

const REQUIRED_FIELD_MESSAGE = '필수 입력 항목입니다.';

const getErrors = (formState: SignUpFormState, requireEmailVerification = true): SignUpFormError => {
  const errors: SignUpFormError = {};
  if (!formState.name.trim()) errors.name = REQUIRED_FIELD_MESSAGE;
  if (!formState.studentNumber.trim()) errors.studentNumber = REQUIRED_FIELD_MESSAGE;
  if (!formState.email.trim()) errors.email = REQUIRED_FIELD_MESSAGE;
  else if (!isPNUEmail(formState.email)) errors.email = '부산대학교 이메일(@pusan.ac.kr)이 아닙니다.';
  else if (requireEmailVerification && !formState.isEmailVerified) errors.email = '이메일 인증이 필요합니다.';
  if (!formState.password.trim()) errors.password = REQUIRED_FIELD_MESSAGE;
  else if (!isValidPassword(formState.password))
    errors.password = '8~16자, 영어, 숫자, 특수문자(@$!%*#?&~)를 포함하여야 합니다.';
  if (!formState.passwordConfirm.trim()) errors.passwordConfirm = REQUIRED_FIELD_MESSAGE;
  else if (formState.password !== formState.passwordConfirm) errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  return errors;
};

export const useSignUpFormState = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [editedFields, setEditedFields] = useState<Partial<Record<SignUpField, boolean>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<SignUpField, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = getErrors(formState, hasSubmitted);
  const formError: SignUpFormError = {};
  for (const field of Object.keys(errors) as SignUpField[]) {
    if (hasSubmitted || touchedFields[field]) formError[field] = errors[field];
  }

  const updateField = <K extends keyof SignUpFormState>(key: K, value: SignUpFormState[K]) => {
    if (key !== 'isEmailVerified' && value !== formState[key]) {
      setEditedFields((prev) => ({ ...prev, [key]: true }));
    }
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateField = (field: SignUpField) => {
    if (!editedFields[field] && !formState[field].trim()) return;
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    setHasSubmitted(true);
    return Object.keys(getErrors(formState)).length === 0;
  };

  return {
    formState,
    updateField,
    formError,
    validateField,
    validate,
  };
};
