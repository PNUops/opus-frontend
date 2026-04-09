import { SignInResponseDto } from '@dto/signInDto';

export const mockSignInResponse: SignInResponseDto = {
  memberId: 1,
  name: '허동혁',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibWVtYmVySWQiOjEyMywibmFtZSI6Iu2XiOuPme2YgSIsIm1lbWJlclR5cGUiOlsiUk9MRV_tmozsm5AiLCJST0xFX-2MgOyepSJdLCJpYXQiOjE1MTYyMzkwMjJ9.I0vUQfo_hznLHUbZHvl8RuuaBvZ7N2_qX14cRzrvG3E',
  roles: ['ROLE_회원', 'ROLE_팀장'],
};
