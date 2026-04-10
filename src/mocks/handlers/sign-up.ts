import { http, HttpResponse } from 'msw';
import { EmailVerificationCodeRequestDTO, EmailVerificationRequestDTO, SignUpRequestDto } from '@dto/signUpDto';
import { isPNUEmail } from '@utils/email';

export const signUpHandlers = [
  http.post('/api/sign-up', async ({ request }) => {
    const { name, studentId, email, password } = (await request.json()) as SignUpRequestDto;
    if (!name.trim() || !studentId.trim() || !email.trim() || !password.trim())
      return HttpResponse.json({ error: '필수 필드 누락' }, { status: 400 });

    return new HttpResponse(null, { status: 201 });
  }),

  http.post('/api/sign-up/email-auth', async ({ request }) => {
    const { email } = (await request.json()) as EmailVerificationRequestDTO;
    if (!isPNUEmail(email)) return HttpResponse.json({ error: '유효하지 않은 이메일 형식' }, { status: 400 });

    return new HttpResponse(null, { status: 201 });
  }),

  http.patch('/api/sign-up/email-auth', async ({ request }) => {
    const { email, authCode } = (await request.json()) as EmailVerificationCodeRequestDTO;
    if (!isPNUEmail(email)) return HttpResponse.json({ error: '유효하지 않은 이메일 형식' }, { status: 400 });

    return new HttpResponse(null, { status: 204 });
  }),
];
