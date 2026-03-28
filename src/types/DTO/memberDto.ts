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
