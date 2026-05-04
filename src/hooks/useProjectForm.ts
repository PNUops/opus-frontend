import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import useAuth from '@hooks/useAuth';
import { useContestIdOrRedirect, useTeamId } from '@hooks/useId';
import { useToast } from '@hooks/useToast';
import { useProjectEditorMode } from '@pages/project-editor/useProjectEditorMode';

import { teamDetailOption } from '@queries/team';
import { getRequiredFields } from '@apis/requiredFields';
import { getPreviewImages } from '@apis/projectViewer';
import {
  createProjectDetails,
  deletePoster,
  deleteMember,
  deletePreview,
  deleteThumbnail,
  getPoster,
  getThumbnail,
  patchTeamDetail,
  postMember,
  postPoster,
  postPreview,
  postThumbnail,
  PosterResult,
  ThumbnailResult,
} from '@apis/projectEditor';

import { canEditTeamPage } from '@utils/auth';
import { getApiErrorMessage } from '@utils/error';
import { isValidGithubUrl, isValidProjectUrl, isValidYoutubeUrl } from '@pages/project-editor/urlValidators';
import { defaultRequiredFields } from '@constants/requiredFields';
import { ProjectDetailsEditDto } from '@dto/projectEditorDto';
import { PreviewImagesResponseDto, PreviewResult } from '@dto/projectViewerDto';
import { TeamDetailDto } from '@dto/teams/teamsDto';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';
import { MemberType } from 'types/MemberType';

interface ProjectFormState {
  contestId: number | null;
  trackId: number | null;
  projectName: string;
  teamName: string;
  professorName: string;
  teamMembers: FormTeamMember[];
  githubPath: string;
  youTubePath: string;
  productionPath: string | null;
  overview: string;
}

interface ProjectImageState {
  poster: PosterResult | File | undefined;
  posterToDelete: boolean;
  thumbnail: ThumbnailResult | File | undefined;
  thumbnailToDelete: boolean;
  previews: (PreviewResult | File)[];
  previewsToDelete: number[];
}

type ProjectFormAction =
  | { type: 'INIT_FROM_PROJECT'; payload: TeamDetailDto }
  | { type: 'SET_CONTEST_ID'; payload: number | null }
  | { type: 'SET_FIELD'; field: keyof ProjectFormState; value: ProjectFormState[keyof ProjectFormState] }
  | { type: 'ADD_MEMBER'; payload: FormTeamMember }
  | { type: 'REMOVE_MEMBER'; payload: { clientId: string } };

type ProjectImageAction =
  | { type: 'SET_POSTER'; payload: PosterResult | File | undefined }
  | { type: 'SET_POSTER_FROM_QUERY'; payload: PosterResult }
  | { type: 'SET_POSTER_FILE'; payload: File }
  | { type: 'MARK_POSTER_FOR_DELETE' }
  | { type: 'SET_THUMBNAIL'; payload: ThumbnailResult | File | undefined }
  | { type: 'SET_THUMBNAIL_FROM_QUERY'; payload: ThumbnailResult }
  | { type: 'SET_THUMBNAIL_FILE'; payload: File }
  | { type: 'MARK_THUMBNAIL_FOR_DELETE' }
  | { type: 'SET_PREVIEWS'; payload: (PreviewResult | File)[] }
  | { type: 'SET_PREVIEWS_FROM_QUERY'; payload: PreviewResult[] }
  | { type: 'ADD_PREVIEWS_FILES'; payload: File[] }
  | { type: 'MARK_PREVIEW_FOR_DELETE'; payload: number };

type TeamMemberRoleType = Extract<MemberType, 'ROLE_팀장' | 'ROLE_팀원'>;

export interface FormTeamMember {
  clientId: string;
  memberId?: number;
  teamMemberName: string;
  teamMemberStudentId?: string;
  roleType: TeamMemberRoleType;
  isNew: boolean;
}

const getteamMemberName = (member: TeamDetailDto['teamMembers'][number]) => member.teamMemberName.trim();

const getMemberId = (member: TeamDetailDto['teamMembers'][number]) => member.memberId;

const getteamMemberStudentId = (member: TeamDetailDto['teamMembers'][number]) =>
  (
    (
      member as TeamDetailDto['teamMembers'][number] & {
        teamMemberStudentId?: string;
        teamteamMemberStudentId?: string;
      }
    ).teamMemberStudentId ??
    (
      member as TeamDetailDto['teamMembers'][number] & {
        teamMemberStudentId?: string;
        teamteamMemberStudentId?: string;
      }
    ).teamteamMemberStudentId ??
    ''
  ).trim();

const getFormMembers = (teamMembers: TeamDetailDto['teamMembers']): FormTeamMember[] =>
  teamMembers.map((member) => ({
    clientId: `existing-${getMemberId(member)}`,
    memberId: getMemberId(member),
    teamMemberName: getteamMemberName(member),
    roleType: member.roleType as TeamMemberRoleType,
    teamMemberStudentId: getteamMemberStudentId(member),
    isNew: false,
  }));

const mapTeamDetailToFormState = (team: TeamDetailDto): ProjectFormState => ({
  contestId: team.contestId,
  trackId: team.trackId,
  projectName: team.projectName ?? '',
  teamName: team.teamName ?? '',
  professorName: team.professorName ?? '',
  teamMembers: getFormMembers(team.teamMembers),
  githubPath: team.githubPath ?? '',
  youTubePath: team.youTubePath ?? '',
  productionPath: team.productionPath ?? null,
  overview: team.overview ?? '',
});

const projectFormReducer = (state: ProjectFormState, action: ProjectFormAction): ProjectFormState => {
  switch (action.type) {
    case 'INIT_FROM_PROJECT':
      return mapTeamDetailToFormState(action.payload);
    case 'SET_CONTEST_ID':
      return { ...state, contestId: action.payload };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case 'REMOVE_MEMBER':
      return { ...state, teamMembers: state.teamMembers.filter((m) => m.clientId !== action.payload.clientId) };
    default:
      return state;
  }
};

const projectImageReducer = (state: ProjectImageState, action: ProjectImageAction): ProjectImageState => {
  switch (action.type) {
    case 'SET_POSTER':
      return { ...state, poster: action.payload };
    case 'SET_POSTER_FROM_QUERY':
      return { ...state, poster: action.payload, posterToDelete: false };
    case 'SET_POSTER_FILE':
      return { ...state, poster: action.payload, posterToDelete: false };
    case 'MARK_POSTER_FOR_DELETE':
      return { ...state, posterToDelete: true, poster: undefined };
    case 'SET_THUMBNAIL':
      return { ...state, thumbnail: action.payload };
    case 'SET_THUMBNAIL_FROM_QUERY':
      return { ...state, thumbnail: action.payload, thumbnailToDelete: false };
    case 'SET_THUMBNAIL_FILE':
      return { ...state, thumbnail: action.payload, thumbnailToDelete: false };
    case 'MARK_THUMBNAIL_FOR_DELETE':
      return { ...state, thumbnailToDelete: true, thumbnail: undefined };
    case 'SET_PREVIEWS':
      return { ...state, previews: action.payload };
    case 'SET_PREVIEWS_FROM_QUERY':
      return { ...state, previews: action.payload };
    case 'ADD_PREVIEWS_FILES':
      return { ...state, previews: [...state.previews, ...action.payload] };
    case 'MARK_PREVIEW_FOR_DELETE': {
      const id = action.payload;
      return {
        ...state,
        previewsToDelete: [...state.previewsToDelete, id],
        previews: state.previews.filter((preview) => {
          if (preview instanceof File) return true;
          if (preview.status !== 'success') return true;
          return preview.id !== id;
        }),
      };
    }
    default:
      return state;
  }
};

const buildProjectPayload = (
  source: ProjectFormState,
  fallback?: TeamDetailDto,
  isAdmin = true,
): ProjectDetailsEditDto | null => {
  const toNullable = (value?: string | null) => {
    if (value === null || value === undefined) return null;
    return value.trim() === '' ? null : value;
  };

  const contestId = isAdmin ? source.contestId : fallback?.contestId;
  const trackId = isAdmin ? source.trackId : fallback?.trackId;

  if (contestId === null || contestId === undefined || trackId === null || trackId === undefined) {
    return null;
  }

  return {
    contestId,
    trackId,
    projectName: toNullable(source.projectName),
    teamName: toNullable(isAdmin ? source.teamName : (fallback?.teamName ?? source.teamName)),
    professorName: toNullable(source.professorName),
    githubPath: toNullable(source.githubPath),
    youTubePath: toNullable(source.youTubePath),
    productionPath: toNullable(source.productionPath),
    overview: toNullable(source.overview),
  };
};

export const useProjectForm = () => {
  const { user, isAdmin } = useAuth();
  const memberId = user?.id ?? null;
  const { isEditMode, isCreateMode } = useProjectEditorMode();
  const contestId = useContestIdOrRedirect();
  const teamId = useTeamId();

  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  const [formState, dispatchForm] = useReducer(projectFormReducer, {
    contestId: contestId ?? null,
    trackId: null,
    projectName: '',
    teamName: '',
    professorName: '',
    teamMembers: [],
    githubPath: '',
    youTubePath: '',
    productionPath: null,
    overview: '',
  });

  const [imageState, dispatchImage] = useReducer(projectImageReducer, {
    poster: undefined,
    posterToDelete: false,
    thumbnail: undefined,
    thumbnailToDelete: false,
    previews: [],
    previewsToDelete: [],
  });

  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: isProjectError,
  } = useQuery({
    ...teamDetailOption(teamId ?? -1),
    enabled: isEditMode && teamId !== null,
  });

  const requiredFieldsContestId = formState.contestId ?? contestId ?? projectData?.contestId ?? null;
  const { data: requiredFieldsData } = useQuery<RequiredFieldsDto>({
    queryKey: ['requiredFields', requiredFieldsContestId],
    queryFn: async () => {
      if (requiredFieldsContestId === null || requiredFieldsContestId === undefined) {
        return defaultRequiredFields;
      }
      return getRequiredFields(requiredFieldsContestId);
    },
    enabled: requiredFieldsContestId !== null && requiredFieldsContestId !== undefined,
  });
  const requiredFields = requiredFieldsData ?? defaultRequiredFields;

  const { data: thumbnailResult } = useQuery<ThumbnailResult>({
    queryKey: ['thumbnail', teamId],
    queryFn: async () => {
      if (teamId === null) throw new Error('teamId is null');
      return getThumbnail(teamId);
    },
    enabled: teamId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });

  const { data: posterResult } = useQuery<PosterResult>({
    queryKey: ['poster', teamId],
    queryFn: async () => {
      if (teamId === null) throw new Error('teamId is null');
      return getPoster(teamId);
    },
    enabled: teamId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });

  const stablePreviewIds = useMemo(() => projectData?.previewIds ?? [], [projectData?.previewIds?.join(',')]);
  const { data: previewData } = useQuery<PreviewImagesResponseDto>({
    queryKey: ['previewImages', teamId, stablePreviewIds],
    queryFn: async () => {
      if (teamId === null || !projectData?.previewIds) throw new Error('previewIds 없음');
      return getPreviewImages(teamId, projectData.previewIds);
    },
    enabled: teamId !== null && stablePreviewIds.length > 0,
    refetchInterval: (query) => {
      const processing = query.state.data?.imageResults?.some((result) => result.status === 'processing') ?? false;
      return processing ? 1500 : false;
    },
  });

  useEffect(() => {
    if (isEditMode && teamId === null) {
      navigate('/', { replace: true });
    }
  }, [isEditMode, teamId, navigate]);

  useEffect(() => {
    if (projectData && isEditMode) {
      dispatchForm({ type: 'INIT_FROM_PROJECT', payload: projectData });
    }
  }, [projectData, isEditMode]);

  useEffect(() => {
    if (posterResult) {
      dispatchImage({ type: 'SET_POSTER_FROM_QUERY', payload: posterResult });
    }
  }, [posterResult]);

  useEffect(() => {
    if (thumbnailResult) {
      dispatchImage({ type: 'SET_THUMBNAIL_FROM_QUERY', payload: thumbnailResult });
    }
  }, [thumbnailResult]);

  useEffect(() => {
    if (previewData?.imageResults) {
      dispatchImage({ type: 'SET_PREVIEWS_FROM_QUERY', payload: previewData.imageResults });
    }
  }, [previewData]);

  const isEditorOfThisTeam = canEditTeamPage(memberId ?? -1, projectData?.teamMembers ?? [], isAdmin);
  const missingContestForCreate = isCreateMode && !formState.contestId;
  const missingTeamForEdit = isEditMode && !teamId;
  const isEmpty = (value?: string | null) => !value || value.trim() === '';

  const validateProjectPayload = (
    payload: ProjectDetailsEditDto,
    required: RequiredFieldsDto,
    options?: { skipRequired?: boolean },
  ) => {
    const skipRequired = options?.skipRequired ?? false;

    if (!skipRequired && required.projectNameRequired && isEmpty(payload.projectName))
      return '프로젝트 이름이 입력되지 않았어요';
    if (!skipRequired && required.teamNameRequired && isEmpty(payload.teamName)) return '팀 이름이 입력되지 않았어요';
    if (!skipRequired && required.professorRequired && isEmpty(payload.professorName))
      return '지도교수명을 입력해주세요';
    if (!skipRequired && required.githubPathRequired && isEmpty(payload.githubPath))
      return 'GitHub 링크를 입력해주세요';
    if (!skipRequired && required.youTubePathRequired && isEmpty(payload.youTubePath))
      return 'YouTube 링크를 입력해주세요';
    if (!skipRequired && required.productionPathRequired && isEmpty(payload.productionPath))
      return '배포 링크를 입력해주세요';
    if (!skipRequired && required.overviewRequired && isEmpty(payload.overview))
      return '프로젝트 설명이 입력되지 않았어요';

    if (typeof payload.githubPath === 'string' && !isEmpty(payload.githubPath) && !isValidGithubUrl(payload.githubPath))
      return 'GitHub URL이 유효하지 않아요';
    if (
      typeof payload.youTubePath === 'string' &&
      !isEmpty(payload.youTubePath) &&
      !isValidYoutubeUrl(payload.youTubePath)
    )
      return 'YouTube URL이 유효하지 않아요';
    if (
      typeof payload.productionPath === 'string' &&
      !isEmpty(payload.productionPath) &&
      !isValidProjectUrl(payload.productionPath)
    )
      return '프로젝트 주소가 유효하지 않아요';

    if (!skipRequired && required.teamMembersRequired && formState.teamMembers.length < 1)
      return '팀원을 1명 이상 입력해주세요';
    if (!skipRequired && required.leaderRequired) {
      const hasLeaderInForm = formState.teamMembers.some((member) => member.roleType === 'ROLE_팀장');
      const hasLeaderInExisting = projectData?.teamMembers?.some((member) => member.roleType === 'ROLE_팀장') ?? false;
      if (!hasLeaderInForm && !hasLeaderInExisting) return '팀장을 1명 이상 지정해주세요';
    }

    if (!skipRequired && required.posterRequired) {
      const hasPoster =
        imageState.poster instanceof File ||
        (!!imageState.poster && 'status' in imageState.poster && imageState.poster.status === 'success');
      if (!hasPoster) return '포스터를 업로드해주세요';
    }

    if (!skipRequired && required.imagesRequired) {
      const hasThumbnail =
        imageState.thumbnail instanceof File ||
        (!!imageState.thumbnail && 'status' in imageState.thumbnail && imageState.thumbnail.status === 'success');
      if (!hasThumbnail || imageState.previews.length === 0) return '썸네일과 상세 이미지를 업로드해주세요';
    }
    return null;
  };

  const validateInputs = () => {
    const payload = buildProjectPayload(formState, projectData, isCreateMode ? true : isAdmin);
    if (!payload) return '대회와 분과를 선택해야 해요';
    if (!isAdmin && requiredFields.trackRequired && formState.trackId === null) return '분과을 선택해야 해요';
    if (!isAdmin && isEditMode && isEditorOfThisTeam && requiredFields.imagesRequired) {
      if (!imageState.thumbnail || imageState.previews.length === 0) return '썸네일 포함 2장 이상 이미지가 필요해요';
    }
    return validateProjectPayload(payload, requiredFields, { skipRequired: isAdmin });
  };

  const onMemberAdd = useCallback(
    (newMember: { teamMemberName: string; teamMemberStudentId: string; roleType: TeamMemberRoleType }) => {
      const trimmedName = newMember.teamMemberName.trim();
      const trimmedStudentId = newMember.teamMemberStudentId.trim();

      if (!trimmedName) {
        toast('팀원 이름이 입력되지 않았어요', 'info');
        return;
      }
      if (!trimmedStudentId) {
        toast('팀원 학번이 입력되지 않았어요', 'info');
        return;
      }
      if (!/^\d+$/.test(trimmedStudentId)) {
        toast('팀원 학번은 숫자만 입력할 수 있어요', 'info');
        return;
      }

      const duplicated = formState.teamMembers.some(
        (member) =>
          member.teamMemberName.trim().toLowerCase() === trimmedName.toLowerCase() &&
          (member.teamMemberStudentId ?? '').trim() === trimmedStudentId,
      );
      if (duplicated) {
        toast(`팀원 "${trimmedName}" 은(는) 이미 존재해요`, 'info');
        return;
      }
      dispatchForm({
        type: 'ADD_MEMBER',
        payload: {
          clientId: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          teamMemberName: trimmedName,
          teamMemberStudentId: trimmedStudentId,
          roleType: newMember.roleType,
          isNew: true,
        },
      });
      toast(`팀원 "${trimmedName}"을(를) 추가했어요`, 'success');
    },
    [formState.teamMembers, toast],
  );

  const onMemberRemove = useCallback(
    (clientId: string) => {
      dispatchForm({ type: 'REMOVE_MEMBER', payload: { clientId } });
      toast('팀원을 삭제했어요', 'info');
    },
    [toast],
  );

  const syncBasicInfo = useCallback(
    async (currentTeamId: number, currentProjectData: TeamDetailDto) => {
      const payload = buildProjectPayload(formState, currentProjectData, isAdmin);
      if (!payload) throw new Error('INVALID_PAYLOAD');

      const basicInfoChanged =
        (currentProjectData.projectName ?? '') !== formState.projectName ||
        (currentProjectData.teamName ?? '') !== formState.teamName ||
        (currentProjectData.professorName ?? '') !== formState.professorName ||
        (currentProjectData.overview ?? '') !== formState.overview ||
        (currentProjectData.productionPath ?? null) !== formState.productionPath ||
        (currentProjectData.githubPath ?? '') !== formState.githubPath ||
        (currentProjectData.youTubePath ?? '') !== formState.youTubePath ||
        (isAdmin &&
          (currentProjectData.contestId !== payload.contestId ||
            (currentProjectData.trackId ?? null) !== payload.trackId));

      if (basicInfoChanged) {
        await patchTeamDetail(currentTeamId, payload);
      }
    },
    [formState, isAdmin],
  );

  const syncMembers = useCallback(
    async (currentTeamId: number, currentProjectData: TeamDetailDto) => {
      const existingMembers = getFormMembers(currentProjectData.teamMembers);
      const addedMembers = formState.teamMembers.filter((member) => member.isNew);
      const removedExistingMembers = existingMembers.filter(
        (member): member is FormTeamMember & { memberId: number } =>
          member.memberId !== undefined &&
          !formState.teamMembers.some((current) => current.memberId === member.memberId),
      );

      if (removedExistingMembers.length > 0) {
        await Promise.all(removedExistingMembers.map((member) => deleteMember(currentTeamId, member.memberId)));
      }
      if (addedMembers.length > 0) {
        await Promise.all(
          addedMembers.map((member) =>
            postMember(currentTeamId, {
              memberName: member.teamMemberName,
              memberStudentId: member.teamMemberStudentId ?? '',
              roleType: member.roleType,
            }),
          ),
        );
      }
    },
    [formState.teamMembers],
  );

  const syncImages = useCallback(
    async (currentTeamId: number) => {
      if (imageState.posterToDelete) {
        const response = await deletePoster(currentTeamId);
        if (response.status === 202) toast('압축 중인 포스터는 삭제할 수 없어요', 'error');
      }

      if (imageState.poster instanceof File) {
        const formData = new FormData();
        formData.append('image', imageState.poster);
        await postPoster(currentTeamId, formData);
      }

      if (imageState.thumbnailToDelete) {
        const response = await deleteThumbnail(currentTeamId);
        if (response.status === 202) toast('압축 중인 이미지는 삭제할 수 없어요', 'error');
      }

      if (imageState.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append('image', imageState.thumbnail);
        await postThumbnail(currentTeamId, formData);
      }

      if (imageState.previewsToDelete.length > 0) {
        const response = await deletePreview(currentTeamId, { imageIds: imageState.previewsToDelete });
        if (response.status === 202) toast('압축 중인 이미지는 삭제할 수 없어요', 'error');
      }

      const newFiles = imageState.previews.filter((preview): preview is File => preview instanceof File);
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        await postPreview(currentTeamId, formData);
      }
    },
    [imageState, toast],
  );

  const handleEdit = useCallback(async () => {
    if (!teamId || !projectData) return;

    const validationError = validateInputs();
    if (validationError) {
      toast(validationError, 'error');
      return;
    }

    try {
      await syncBasicInfo(teamId, projectData);
      await syncMembers(teamId, projectData);
      await syncImages(teamId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contests'] }),
        queryClient.invalidateQueries({ queryKey: ['poster', teamId] }),
        queryClient.invalidateQueries({ queryKey: ['thumbnail', teamId] }),
        queryClient.invalidateQueries({ queryKey: ['previewImages', teamId] }),
        queryClient.invalidateQueries({ queryKey: ['projectDetails', teamId] }),
      ]);

      toast('수정이 완료되었어요', 'success');
      navigate(`/contest/${contestId}/teams/view/${teamId}`);
    } catch (error: any) {
      toast(getApiErrorMessage(error, '프로젝트 수정에 실패했어요.'), 'error');
    }
  }, [
    teamId,
    projectData,
    validateInputs,
    toast,
    syncBasicInfo,
    syncMembers,
    syncImages,
    queryClient,
    navigate,
    contestId,
  ]);

  const handleCreate = useCallback(async () => {
    const validationError = validateInputs();
    if (validationError) {
      toast(validationError, 'error');
      return;
    }

    const payload = buildProjectPayload(formState, undefined, true);
    if (!payload) {
      toast('대회와 분과를 선택해주세요.', 'error');
      return;
    }

    try {
      const created = await createProjectDetails(payload);
      const createdTeamId = created.teamId;

      if (formState.teamMembers.length > 0) {
        await Promise.all(
          formState.teamMembers.map((member) =>
            postMember(createdTeamId, {
              memberName: member.teamMemberName,
              memberStudentId: member.teamMemberStudentId ?? '',
              roleType: member.roleType,
            }),
          ),
        );
      }

      await syncImages(createdTeamId);

      toast('생성이 완료되었어요', 'success');
      navigate(`/contest/${contestId}/teams/view/${createdTeamId}`);
    } catch (error: any) {
      toast(getApiErrorMessage(error, '프로젝트 생성에 실패했어요.'), 'error');
    }
  }, [validateInputs, toast, formState, syncImages, navigate, contestId]);

  const handleSave = useCallback(async () => {
    if (isSaved) return;
    setIsSaved(true);
    try {
      if (isCreateMode) await handleCreate();
      if (isEditMode) await handleEdit();
    } finally {
      setIsSaved(false);
    }
  }, [isSaved, isCreateMode, isEditMode, handleCreate, handleEdit]);

  const hasCreatorInputs = () =>
    (() => {
      const payload = buildProjectPayload(formState, undefined, true);
      if (!payload) return false;
      return validateProjectPayload(payload, requiredFields) === null;
    })();

  const hasEditorChanges = () => {
    if (!projectData) return true;

    const originMembers = getFormMembers(projectData.teamMembers)
      .map((m) => `${m.memberId ?? 'new'}:${m.teamMemberName}:${m.roleType}:${m.teamMemberStudentId ?? ''}`)
      .sort()
      .join(',');
    const nextMembers = formState.teamMembers
      .map((m) => `${m.memberId ?? 'new'}:${m.teamMemberName}:${m.roleType}:${m.teamMemberStudentId ?? ''}`)
      .sort()
      .join(',');

    return (
      (projectData.projectName ?? '') !== formState.projectName ||
      (projectData.teamName ?? '') !== formState.teamName ||
      (projectData.professorName ?? '') !== formState.professorName ||
      (projectData.overview ?? '') !== formState.overview ||
      (projectData.productionPath ?? null) !== formState.productionPath ||
      (projectData.githubPath ?? '') !== formState.githubPath ||
      (projectData.youTubePath ?? '') !== formState.youTubePath ||
      originMembers !== nextMembers ||
      imageState.posterToDelete ||
      imageState.poster instanceof File ||
      imageState.thumbnailToDelete ||
      imageState.thumbnail instanceof File ||
      imageState.previews.some((preview) => preview instanceof File) ||
      imageState.previewsToDelete.length > 0
    );
  };

  return {
    isCreateMode,
    isEditMode,
    isAdmin,
    isEditorOfThisTeam,
    missingContestForCreate,
    missingTeamForEdit,
    isProjectLoading,
    isProjectError,
    projectData,
    formState,
    imageState,
    setContestId: (nextContestId: number | null) => dispatchForm({ type: 'SET_CONTEST_ID', payload: nextContestId }),
    setField: <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) =>
      dispatchForm({ type: 'SET_FIELD', field, value }),
    setPoster: (value: PosterResult | File | undefined) => dispatchImage({ type: 'SET_POSTER', payload: value }),
    setPosterFile: (file: File) => dispatchImage({ type: 'SET_POSTER_FILE', payload: file }),
    markPosterForDelete: () => dispatchImage({ type: 'MARK_POSTER_FOR_DELETE' }),
    setThumbnail: (value: ThumbnailResult | File | undefined) =>
      dispatchImage({ type: 'SET_THUMBNAIL', payload: value }),
    setThumbnailFile: (file: File) => dispatchImage({ type: 'SET_THUMBNAIL_FILE', payload: file }),
    markThumbnailForDelete: () => dispatchImage({ type: 'MARK_THUMBNAIL_FOR_DELETE' }),
    setPreviews: (value: (PreviewResult | File)[]) => dispatchImage({ type: 'SET_PREVIEWS', payload: value }),
    addPreviewFiles: (files: File[]) => dispatchImage({ type: 'ADD_PREVIEWS_FILES', payload: files }),
    markPreviewForDelete: (id: number) => dispatchImage({ type: 'MARK_PREVIEW_FOR_DELETE', payload: id }),
    onMemberAdd,
    onMemberRemove,
    handleSave,
    hasCreatorInputs,
    hasEditorChanges,
    requiredFields,
    isSaved,
    teamId,
  };
};
