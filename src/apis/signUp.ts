import { EmailVerificationCodeRequestDTO, EmailVerificationRequestDTO, SignUpRequestDto } from '@dto/signUpDto';
import apiClient from './apiClient';

export const postSignUp = async (request: SignUpRequestDto) => {
  const response = await apiClient.post('/sign-up', request);
  return response.data;
};
export const postEmailVerification = async (request: EmailVerificationRequestDTO) => {
  const response = await apiClient.post('/sign-up/email-auth', request);
  return response.data;
};
export const patchEmailVerificationCode = async (request: EmailVerificationCodeRequestDTO) => {
  const response = await apiClient.patch('/sign-up/email-auth', request);
  return response.data;
};
