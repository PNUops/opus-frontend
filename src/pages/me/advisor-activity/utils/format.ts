import type { AdvisorFeedbackStatus, AdvisorRoleType } from '../types';

export const formatFileSize = (bytes: number) => {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb.toFixed(1)}MB`;
};

export const getAdvisorRoleLabel = (roleType: AdvisorRoleType) => {
  if (roleType === 'ROLE_교수') {
    return '지도 교수';
  }

  return '외부 멘토';
};

export const getFeedbackStatusLabel = (status: AdvisorFeedbackStatus) => {
  if (status === 'COMPLETED') {
    return '작성 완료';
  }

  return '작성 대기';
};
