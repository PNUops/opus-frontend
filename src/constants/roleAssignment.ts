import type { RoleType } from '@pages/admin/role-assignment/types/roleAssignment';

export const ROLE_LABEL: Record<RoleType, string> = {
  ROLE_교수: '지도교수',
  ROLE_외부멘토: '멘토',
};

export const ROLE_ASSIGNMENT_TABS: { key: RoleType; label: string }[] = [
  { key: 'ROLE_교수', label: ROLE_LABEL.ROLE_교수 },
  { key: 'ROLE_외부멘토', label: ROLE_LABEL.ROLE_외부멘토 },
];

export const ROLE_ASSIGNMENT_ROLE_OPTIONS: { label: string; value: RoleType }[] = [
  { label: ROLE_LABEL.ROLE_교수, value: 'ROLE_교수' },
  { label: ROLE_LABEL.ROLE_외부멘토, value: 'ROLE_외부멘토' },
];
