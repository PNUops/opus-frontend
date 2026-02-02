import { useEffect, useReducer, useRef, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';
import { useContestId, useTeamId } from 'hooks/useId';
import { useToast } from 'hooks/useToast';

import { getProjectDetails, getPreviewImages } from 'apis/projectViewer';
import {
  createProjectDetails,
  getThumbnail,
  patchProjectDetails,
  postPreview,
  postThumbnail,
  deletePreview,
  deleteThumbnail,
  postMember,
  deleteMember,
  ThumbnailResult,
} from 'apis/projectEditor';

import {
  TeamMember,
  PreviewImagesResponseDto,
  ProjectDetailsResponseDto,
  PreviewResult,
} from 'types/DTO/projectViewerDto';

import { isValidGithubUrl, isValidYoutubeUrl, isValidProjectUrl } from '@pages/project-editor/urlValidators';

type ProjectMode = 'create' | 'edit';

interface ProjectFormState {
  contestId: number | null;
  teamName: string;
  projectName: string;
  professorName: string;
  leaderName: string;
  teamMembers: TeamMember[];
  productionUrl: string | null;
  githubUrl: string;
  youtubeUrl: string;
  overview: string;
}

interface ProjectImageState {
  thumbnail: ThumbnailResult | File | undefined;
  thumbnailToDelete: boolean;
  previews: (PreviewResult | File)[];
  previewsToDelete: number[];
}

type ProjectFormAction =
  | { type: 'INIT_FROM_PROJECT'; payload: ProjectDetailsResponseDto }
  | { type: 'SET_CONTEST_ID'; payload: number | null }
  | { type: 'SET_FIELD'; field: keyof ProjectFormState; value: any }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'ADD_MEMBER'; payload: TeamMember }
  | { type: 'REMOVE_MEMBER'; payload: { memberId: number } };

type ProjectImageAction =
  | { type: 'SET_THUMBNAIL_FROM_QUERY'; payload: ThumbnailResult }
  | { type: 'SET_THUMBNAIL_FILE'; payload: File }
  | { type: 'MARK_THUMBNAIL_FOR_DELETE' }
  | { type: 'SET_PREVIEWS_FROM_QUERY'; payload: PreviewResult[] }
  | { type: 'ADD_PREVIEWS_FILES'; payload: File[] }
  | { type: 'MARK_PREVIEW_FOR_DELETE'; payload: number };

const projectFormReducer = (state: ProjectFormState, action: ProjectFormAction): ProjectFormState => {
  switch (action.type) {
    case 'INIT_FROM_PROJECT': {
      const p = action.payload;
      return {
        ...state,
        contestId: p.contestId,
        teamName: p.teamName,
        projectName: p.projectName,
        professorName: p.professorName ?? '',
        leaderName: p.leaderName,
        teamMembers: p.teamMembers,
        githubUrl: p.githubPath,
        youtubeUrl: p.youTubePath,
        productionUrl: p.productionPath,
        overview: p.overview,
      };
    }

    case 'SET_CONTEST_ID':
      return {
        ...state,
        contestId: action.payload,
      };

    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SET_TEAM_MEMBERS':
      return {
        ...state,
        teamMembers: action.payload,
      };

    case 'ADD_MEMBER':
      return {
        ...state,
        teamMembers: [...state.teamMembers, action.payload],
      };

    case 'REMOVE_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter((m) => m.teamMemberId !== action.payload.memberId),
      };

    default:
      return state;
  }
};

const projectImageReducer = (state: ProjectImageState, action: ProjectImageAction): ProjectImageState => {
  switch (action.type) {
    case 'SET_THUMBNAIL_FROM_QUERY':
      return {
        ...state,
        thumbnail: action.payload,
        thumbnailToDelete: false,
      };

    case 'SET_THUMBNAIL_FILE':
      return {
        ...state,
        thumbnail: action.payload,
        thumbnailToDelete: false,
      };

    case 'MARK_THUMBNAIL_FOR_DELETE':
      return {
        ...state,
        thumbnailToDelete: true,
      };

    case 'SET_PREVIEWS_FROM_QUERY':
      return {
        ...state,
        previews: action.payload,
      };

    case 'ADD_PREVIEWS_FILES':
      return {
        ...state,
        previews: [...state.previews, ...action.payload],
      };

    case 'MARK_PREVIEW_FOR_DELETE':
      const id = action.payload;

      return {
        ...state,
        previewsToDelete: [...state.previewsToDelete, id],
        previews: state.previews.filter((p) => {
          if (p instanceof File) return true;
          if (p.status !== 'success') return true;
          return p.id !== id;
        }),
      };

    default:
      return state;
  }
};

interface UseProjectFormProps {
  mode: ProjectMode;
}

export const useProjectForm = ({ mode }: UseProjectFormProps) => {
  const { user, isAdmin, isLeader, isMember } = useAuth();
  const memberId = user?.id ?? null;

  const teamId = useTeamId();
  const initialContestId = useContestId();

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSaved, setIsSaved] = useState(false);

  const [formState, dispatchForm] = useReducer(projectFormReducer, {
    contestId: initialContestId ?? null,
    teamName: '',
    projectName: '',
    professorName: '',
    leaderName: '',
    teamMembers: [],
    githubUrl: '',
    youtubeUrl: '',
    productionUrl: null,
    overview: '',
  });

  const [imageState, dispatchImage] = useReducer(projectImageReducer, {
    thumbnail: undefined,
    thumbnailToDelete: false,
    previews: [],
    previewsToDelete: [],
  });

  const teamMembersRef = useRef<TeamMember[]>(formState.teamMembers);

  useEffect(() => {
    teamMembersRef.current = formState.teamMembers;
  }, [formState.teamMembers]);

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useQuery<ProjectDetailsResponseDto>({
    queryKey: ['projectDetails', teamId],
    queryFn: async () => {
      if (teamId === null) throw new Error('teamId is null');
      return await getProjectDetails(teamId);
    },
    enabled: isEditMode && teamId !== null,
  });

  const { data: thumbnailResult } = useQuery<ThumbnailResult>({
    queryKey: ['thumbnail', teamId],
    queryFn: async () => {
      if (teamId === null) throw new Error('teamId is null');
      return await getThumbnail(teamId);
    },
    enabled: teamId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });

  const stablePreviewIds = useMemo(() => {
    return projectData?.previewIds ?? [];
  }, [projectData?.previewIds?.join(',')]);

  const { data: previewData } = useQuery<PreviewImagesResponseDto>({
    queryKey: ['previewImages', teamId, stablePreviewIds],
    queryFn: async () => {
      if (teamId === null || !projectData?.previewIds) {
        throw new Error('previewIds 없음');
      }
      return await getPreviewImages(teamId, projectData.previewIds);
    },
    enabled: teamId !== null && stablePreviewIds.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      const shouldRefetch = data?.imageResults?.some((result) => result.status === 'processing') ?? false;
      return shouldRefetch ? 1500 : false;
    },
  });

  useEffect(() => {
    if (projectData && isEditMode) {
      dispatchForm({ type: 'INIT_FROM_PROJECT', payload: projectData });
    }
  }, [projectData, isEditMode]);

  useEffect(() => {
    if (thumbnailResult) {
      dispatchImage({
        type: 'SET_THUMBNAIL_FROM_QUERY',
        payload: thumbnailResult,
      });
    }
  }, [thumbnailResult]);

  useEffect(() => {
    if (previewData && previewData.imageResults) {
      dispatchImage({
        type: 'SET_PREVIEWS_FROM_QUERY',
        payload: previewData.imageResults,
      });
    }
  }, [previewData]);

  useEffect(() => {
    return () => {
      const { thumbnail, previews } = imageState;

      if (
        thumbnail &&
        typeof thumbnail === 'object' &&
        'url' in thumbnail &&
        typeof (thumbnail as any).url === 'string' &&
        (thumbnail as any).url.startsWith('blob:')
      ) {
        URL.revokeObjectURL((thumbnail as any).url);
      }

      previews.forEach((p) => {
        if (
          typeof p === 'object' &&
          'url' in p &&
          typeof (p as any).url === 'string' &&
          (p as any).url.startsWith('blob:')
        ) {
          URL.revokeObjectURL((p as any).url);
        }
      });
    };
  }, []);

  const isContributorOfThisTeam =
    isEditMode &&
    !!projectData &&
    !!memberId &&
    (memberId === projectData.leaderId || projectData.teamMembers.some((m) => m.teamMemberId === memberId));

  const missingContestForCreate = isCreateMode && !formState.contestId;
  const missingTeamForEdit = isEditMode && !teamId;

  const isEmpty = (value?: string | null) => !value || value.trim() === '';

  const validateCommonFields = () => {
    const { projectName, teamName, leaderName, teamMembers, productionUrl, githubUrl, youtubeUrl, overview } =
      formState;

    if (isEmpty(projectName)) return '프로젝트명이 입력되지 않았어요';
    if (isEmpty(teamName)) return '팀명이 입력되지 않았어요';
    if (isEmpty(leaderName)) return '팀장명이 입력되지 않았어요';
    if (teamMembers.length < 1) return '팀원이 목록이 비어있어요';

    const leaderLower = leaderName.trim().toLowerCase();
    const isDuplicateWithMember = teamMembers.some(
      (member) => member.teamMemberName.trim().toLowerCase() === leaderLower,
    );
    if (isDuplicateWithMember) return '팀장 이름이 팀원과 중복돼요';

    if (productionUrl && !isValidProjectUrl(productionUrl)) {
      return '프로젝트 주소가 유효하지 않아요';
    }
    if (isEmpty(githubUrl)) return 'GitHub 링크가 입력되지 않았어요';
    if (!isValidGithubUrl(githubUrl)) return 'GitHub URL이 유효하지 않아요';
    if (isEmpty(youtubeUrl)) return 'YouTube 링크가 입력되지 않았어요';
    if (!isValidYoutubeUrl(youtubeUrl)) return 'YouTube URL이 유효하지 않아요';
    if (isEmpty(overview)) return '프로젝트 소개글이 입력되지 않았어요';

    return null;
  };

  const validateCreateInputs = () => {
    if (isAdmin) {
      if (formState.contestId === null) return '대회 종류를 선택해야 해요';
    }
    return validateCommonFields();
  };

  const validateEditInputs = () => {
    if (isContributorOfThisTeam) {
      if (!imageState.thumbnail || imageState.previews.length === 0) {
        return '썸네일을 포함한 두 개 이상의 이미지를 올려주세요';
      }
    }
    return validateCommonFields();
  };

  const validateInputs = () => {
    if (isCreateMode) return validateCreateInputs();
    if (isEditMode) return validateEditInputs();
    return null;
  };

  const onMemberAdd = useCallback(
    (newMemberName: string) => {
      const trimmedName = newMemberName.trim();
      if (!trimmedName) {
        toast('팀원 이름이 입력되지 않았어요', 'info');
        return;
      }

      const leaderLower = formState.leaderName.trim().toLowerCase();
      const isDuplicate = teamMembersRef.current.some(
        (member) =>
          member.teamMemberName.toLowerCase() === trimmedName.toLowerCase() ||
          leaderLower === trimmedName.toLowerCase(),
      );

      if (isDuplicate) {
        toast(`팀원 "${trimmedName}" 은(는) 이미 존재해요`, 'info');
        return;
      }

      const generateUniqueId = () => Date.now() + Math.floor(Math.random() * 1000);

      const newMember: TeamMember = {
        teamMemberId: generateUniqueId(),
        teamMemberName: trimmedName,
      };

      dispatchForm({ type: 'ADD_MEMBER', payload: newMember });
      toast(`팀원 "${trimmedName}"을(를) 추가했어요`, 'success');
    },
    [formState.leaderName, toast],
  );

  const onMemberRemove = useCallback(
    (teamMemberId: number) => {
      const memberToRemove = teamMembersRef.current.find((m) => m.teamMemberId === teamMemberId);
      if (!memberToRemove) {
        toast('삭제할 팀원을 찾을 수 없어요', 'info');
        return;
      }

      const memberName =
        typeof memberToRemove.teamMemberName === 'string' && memberToRemove.teamMemberName.trim() !== ''
          ? memberToRemove.teamMemberName
          : '알 수 없는 팀원';

      dispatchForm({ type: 'REMOVE_MEMBER', payload: { memberId: teamMemberId } });
      toast(`팀원 "${memberName}"을(를) 삭제했어요`, 'info');
    },
    [toast],
  );

  const handleEdit = useCallback(async () => {
    if (!teamId || !projectData) return;

    const errorMessage = validateInputs();
    if (errorMessage) {
      toast(errorMessage, 'error');
      return;
    }

    try {
      await patchProjectDetails(teamId, {
        contestId: isAdmin
          ? formState.contestId !== null
            ? formState.contestId
            : projectData.contestId
          : projectData.contestId,
        teamName: isAdmin ? formState.teamName : projectData.teamName,
        projectName: formState.projectName,
        professorName: formState.professorName,
        leaderName: isAdmin ? formState.leaderName : projectData.leaderName,
        overview: formState.overview,
        productionPath: formState.productionUrl,
        githubPath: formState.githubUrl,
        youTubePath: formState.youtubeUrl,
      });

      const addedMembers = formState.teamMembers.filter(
        (member) => !projectData.teamMembers.some((existing) => existing.teamMemberId === member.teamMemberId),
      );
      const removedMembers = projectData.teamMembers.filter(
        (member) => !formState.teamMembers.some((current) => current.teamMemberId === member.teamMemberId),
      );

      const removeMemberPromises = removedMembers.map((member) => deleteMember(teamId, member.teamMemberId));
      await Promise.all(removeMemberPromises);

      const addMemberPromises = addedMembers.map((member) =>
        postMember(teamId, { teamMemberName: member.teamMemberName }),
      );
      await Promise.all(addMemberPromises);

      if (imageState.thumbnailToDelete) {
        const res = await deleteThumbnail(teamId);
        if (res.status === 202) {
          toast('압축 중인 이미지는 삭제할 수 없어요', 'error');
        }
      }

      if (imageState.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append('image', imageState.thumbnail);
        await postThumbnail(teamId, formData);
      }

      if (imageState.previewsToDelete.length > 0) {
        const res = await deletePreview(teamId, {
          imageIds: imageState.previewsToDelete,
        });
        if (res.status === 202) {
          toast('압축 중인 이미지는 삭제할 수 없어요', 'error');
        }
      }

      const newFiles = imageState.previews.filter((p) => p instanceof File) as File[];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        await postPreview(teamId, formData);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contests'] }),
        queryClient.invalidateQueries({ queryKey: ['thumbnail', teamId] }),
        queryClient.invalidateQueries({
          queryKey: ['previewImages', teamId, stablePreviewIds],
        }),
        queryClient.invalidateQueries({ queryKey: ['projectDetails', teamId] }),
      ]);

      toast('수정이 완료되었어요', 'success');
      navigate(`/teams/view/${teamId}`);
    } catch (err: any) {
      toast(err?.response?.data?.message || '저장 중 오류가 발생했어요', 'error');
    }
  }, [teamId, projectData, formState, imageState, isAdmin, queryClient, stablePreviewIds, toast, navigate]);

  const handleCreate = useCallback(async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      toast(errorMessage, 'error');
      return;
    }

    try {
      const response = await createProjectDetails({
        contestId: formState.contestId!,
        projectName: formState.projectName,
        teamName: formState.teamName,
        professorName: formState.professorName,
        leaderName: formState.leaderName,
        githubPath: formState.githubUrl,
        youTubePath: formState.youtubeUrl,
        productionPath: formState.productionUrl,
        overview: formState.overview,
      });

      const createdTeamId = response.teamId;
      await queryClient.invalidateQueries({ queryKey: ['projectDetails'] });

      const postDetailTasks: Promise<any>[] = [];

      const addMemberPromises = formState.teamMembers.map((member) =>
        postMember(createdTeamId, {
          teamMemberName: member.teamMemberName,
        }),
      );
      postDetailTasks.push(...addMemberPromises);

      if (imageState.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append('image', imageState.thumbnail);
        postDetailTasks.push(postThumbnail(createdTeamId, formData));
      }

      const newFiles = imageState.previews.filter((p) => p instanceof File) as File[];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        postDetailTasks.push(postPreview(createdTeamId, formData));
      }

      await Promise.all(postDetailTasks);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contests'] }),
        queryClient.invalidateQueries({ queryKey: ['thumbnail', createdTeamId] }),
        queryClient.invalidateQueries({
          queryKey: ['previewImages', createdTeamId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['projectDetails', createdTeamId],
        }),
      ]);

      toast('생성이 완료되었어요', 'success');
      navigate(`/teams/view/${createdTeamId}`);
    } catch (err: any) {
      toast(err?.response?.data?.message || '생성 도중 실패했어요', 'error');
      navigate(`/admin/contest`);
    }
  }, [formState, imageState, queryClient, toast, navigate]);

  const handleSave = useCallback(async () => {
    if (isSaved) return;
    setIsSaved(true);
    try {
      if (isCreateMode) {
        await handleCreate();
      } else if (isEditMode) {
        await handleEdit();
      }
    } finally {
      setIsSaved(false);
    }
  }, [isSaved, isCreateMode, isEditMode, handleCreate, handleEdit]);

  const hasCreatorInputs = (): boolean => {
    const {
      contestId,
      projectName,
      teamName,
      professorName,
      leaderName,
      teamMembers,
      githubUrl,
      youtubeUrl,
      overview,
    } = formState;

    return (
      !!contestId &&
      !isEmpty(projectName) &&
      !isEmpty(teamName) &&
      !isEmpty(professorName) &&
      !isEmpty(leaderName) &&
      teamMembers.length > 0 &&
      !isEmpty(githubUrl) &&
      !isEmpty(youtubeUrl) &&
      !isEmpty(overview)
    );
  };

  const hasEditorChanges = (): boolean => {
    if (!projectData) return true;

    const basicInfoChanged =
      projectData.projectName !== formState.projectName ||
      projectData.teamName !== formState.teamName ||
      (projectData.professorName ?? '') !== formState.professorName ||
      projectData.leaderName !== formState.leaderName ||
      projectData.overview !== formState.overview ||
      (projectData.productionPath ?? null) !== formState.productionUrl ||
      projectData.githubPath !== formState.githubUrl ||
      projectData.youTubePath !== formState.youtubeUrl;

    const membersChanged =
      JSON.stringify(projectData.teamMembers.map((m) => m.teamMemberName).sort()) !==
      JSON.stringify(formState.teamMembers.map((m) => m.teamMemberName).sort());

    const thumbnailChanged = imageState.thumbnailToDelete || imageState.thumbnail instanceof File;

    const previewAdded = imageState.previews.some((p) => p instanceof File);
    const previewDeleted = imageState.previewsToDelete.length > 0;

    return basicInfoChanged || membersChanged || thumbnailChanged || previewAdded || previewDeleted;
  };

  return {
    isCreateMode,
    isEditMode,
    isAdmin,
    isContributorOfThisTeam,
    missingContestForCreate,
    missingTeamForEdit,

    isProjectLoading,
    isProjectError,
    projectData,

    formState,
    imageState,

    setContestId: (contestId: number | null) => dispatchForm({ type: 'SET_CONTEST_ID', payload: contestId }),

    setField: (field: keyof ProjectFormState, value: any) => dispatchForm({ type: 'SET_FIELD', field, value }),

    setThumbnailFile: (file: File) => dispatchImage({ type: 'SET_THUMBNAIL_FILE', payload: file }),

    markThumbnailForDelete: () => dispatchImage({ type: 'MARK_THUMBNAIL_FOR_DELETE' }),

    addPreviewFiles: (files: File[]) => dispatchImage({ type: 'ADD_PREVIEWS_FILES', payload: files }),

    markPreviewForDelete: (id: number) => dispatchImage({ type: 'MARK_PREVIEW_FOR_DELETE', payload: id }),

    onMemberAdd,
    onMemberRemove,

    handleSave,
    hasCreatorInputs,
    hasEditorChanges,

    isSaved,
    teamId,
  };
};
