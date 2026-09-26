import { SignInResponseDto } from '@dto/signInDto';

export const mockSignInResponse: SignInResponseDto = {
  memberId: 1001,
  name: '홍지연',
  token:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMDAxIiwibmFtZSI6Iu2ZjeyngOyXsCIsInJvbGVzIjpbIlJPTEVf7ZWZ7IOdIiwiUk9MRV_tjIDsnqUiXX0.mock',
  roles: ['ROLE_학생', 'ROLE_팀장'],
};

export const mockProfessorSignInResponse: SignInResponseDto = {
  memberId: 31,
  name: '박지윤',
  token:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIzMSIsIm5hbWUiOiLrsJXsp4DsnKQiLCJyb2xlcyI6WyJST0xFX-q1kOyImCJdfQ.mock',
  roles: ['ROLE_교수'],
};

export const mockMentorSignInResponse: SignInResponseDto = {
  memberId: 32,
  name: '최민호',
  token:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIzMiIsIm5hbWUiOiLstZzrr7ztmLgiLCJyb2xlcyI6WyJST0xFX-yZuOu2gOupmO2GoCJdfQ.mock',
  roles: ['ROLE_외부멘토'],
};

export const mockSignInResponsesByEmail: Record<string, SignInResponseDto> = {
  'test@pusan.ac.kr': mockSignInResponse,
  'professor@pusan.ac.kr': mockProfessorSignInResponse,
  'mentor@pusan.ac.kr': mockMentorSignInResponse,
};
