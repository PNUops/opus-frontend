import { EmailVerificationCodeRequestDTO, EmailVerificationRequestDTO } from '@dto/signUpDto';
import {
  FindEmailRequestDto,
  FindEmailResponsetDto,
  PasswordResetRequestDto,
  SignInRequestDto,
  SignInResponseDto,
} from '@dto/signInDto';
import apiClient from './apiClient';

export const postSignIn = async (request: SignInRequestDto): Promise<SignInResponseDto> => {
  const response = await apiClient.post('/sign-in', request);
  return response.data;
};

export const getFindEmail = async (request: FindEmailRequestDto): Promise<FindEmailResponsetDto> => {
  const response = await apiClient.get(`/sign-in/${request.studentId}/email-find`);
  return response.data;
};

export const postEmailVerificationPasswordReset = async (request: EmailVerificationRequestDTO) => {
  const response = await apiClient.post('/sign-in/password-reset/email-auth', request);
  return response.data;
};

export const patchEmailVerificationCodePasswordReset = async (request: EmailVerificationCodeRequestDTO) => {
  const response = await apiClient.patch('/sign-in/password-reset/email-auth', request);
  return response.data;
};

export const patchPasswordReset = async (request: PasswordResetRequestDto) => {
  const response = await apiClient.patch('/sign-in/password-reset', request);
  return response.data;
};
