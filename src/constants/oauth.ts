export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: '구글 로그인이 취소되었습니다.',
  authorization_request_not_found: '세션이 만료되었습니다. 다시 시도해주세요.',
  invalid_state_parameter: '인증에 실패했습니다. 다시 시도해주세요.',
  server_error: '구글 서버 오류가 발생했습니다.',
  GENERAL_MEMBER_CANNOT_USE_SOCIAL_LOGIN: '일반 회원은 소셜 로그인을 사용할 수 없습니다.',
  SOCIAL_TYPE_MISMATCH: '다른 소셜 계정으로 가입된 이메일입니다.',
};

export const DEFAULT_OAUTH_ERROR_MESSAGE = '구글 로그인에 실패했습니다.';
