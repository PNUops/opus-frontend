import type { MemberType } from 'types/MemberType';

export interface GetMyProfileResponseDto {
  name: string;
  email: string;
  profileImageUrl: string | null;
  githubUrl: string | null;
  isProfilePublic: boolean;
}

export interface UpdateProfileVisibilityRequestDto {
  isProfilePublic: boolean;
}

export interface PatchMyStudentIdRequestDto {
  studentId: string;
}

export interface PatchMyPasswordRequestDto {
  password: string;
  newPassword: string;
}

export interface SearchAdminMembersParams {
  keyword: string;
  roleType?: MemberType;
}

export interface AdminMemberSearchResultDto {
  memberId: number;
  name: string;
  email: string;
  roleType: MemberType;
}

export type SearchAdminMembersResponseDto = AdminMemberSearchResultDto[];
