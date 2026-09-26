import { API_BASE_URL } from '../../constants/env';
import { mockSignInResponsesByEmail } from '../data/sign-in';
import { http, HttpResponse } from 'msw';
import { SignInRequestDto } from '@dto/signInDto';

export const signInHandlers = [
  http.post(`${API_BASE_URL}/api/sign-in`, async ({ request }) => {
    const { email, password } = (await request.json()) as SignInRequestDto;
    const response = mockSignInResponsesByEmail[email];

    if (response && password === 'test') {
      return HttpResponse.json(response);
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }),
];
