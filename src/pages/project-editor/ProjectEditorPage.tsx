import { useNavigate } from 'react-router-dom';
import { CURRENT_CONTEST_ID } from 'constants/contest';

import IntroSection from './IntroSection';
import UrlInput from './UrlInput';
import ImageUploaderSection from './ImageUploaderSection';
import OverviewInput from './OverviewInput';

import AdminEditSection from '@pages/project-editor/AdminEditSection/AdminEditSection';
import MembersInput from './AdminEditSection/MembersInput';
import { useProjectForm } from 'hooks/useProjectForm';

interface ProjectEditorPageProps {
  mode: 'edit' | 'create';
}

const ProjectEditorPage = ({ mode }: ProjectEditorPageProps) => {
  const navigate = useNavigate();

  const {
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
    setField,
    setContestId,
    setThumbnailFile,
    markThumbnailForDelete,
    addPreviewFiles,
    markPreviewForDelete,
    onMemberAdd,
    onMemberRemove,
    handleSave,
    hasCreatorInputs,
    hasEditorChanges,
    isSaved,
  } = useProjectForm({ mode });

  return (
    <div className="min-w-xs px-2 sm:px-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="sm:text-title text-xl font-bold">{isEditMode ? '프로젝트 수정' : '프로젝트 생성'}</div>
        <p className="text-midGray text-exsm">
          {isEditMode ? (
            <>
              필수(<span className="text-rose-400">*</span>) 항목과 변경사항이 있어야 버튼이 켜져요.
            </>
          ) : (
            <>
              필수(<span className="text-rose-400">*</span>) 항목을 모두 작성하면 버튼이 켜져요.
            </>
          )}
        </p>
      </div>
      <div className="h-10" />
      {isAdmin && formState.contestId !== CURRENT_CONTEST_ID && (
        <>
          <AdminEditSection
            contestId={formState.contestId}
            setContestId={setContestId}
            projectName={formState.projectName}
            setProjectName={(value: string) => setField('projectName', value)}
            teamName={formState.teamName}
            setTeamName={(value: string) => setField('teamName', value)}
            professorName={formState.professorName}
            setProfessorName={(value: string) => setField('professorName', value)}
            leaderName={formState.leaderName}
            setLeaderName={(value: string) => setField('leaderName', value)}
          />
          <div className="h-15" />
          <MembersInput teamMembers={formState.teamMembers} onMemberAdd={onMemberAdd} onMemberRemove={onMemberRemove} />
        </>
      )}
      {(isContributorOfThisTeam || (isAdmin && formState.contestId === CURRENT_CONTEST_ID)) && (
        <IntroSection
          projectName={formState.projectName}
          setProjectName={(value: string) => setField('projectName', value)}
          teamName={formState.teamName}
          professorName={formState.professorName}
          setProfessorName={(value: string) => setField('professorName', value)}
          leaderName={formState.leaderName}
          teamMembers={formState.teamMembers} // WARN: 백엔드 측에서 필드명 바꿀 수도 있음 주의
        />
      )}
      <div className="h-15" />
      <UrlInput
        productionUrl={formState.productionUrl}
        setProductionUrl={(value: string | null) => setField('productionUrl', value)}
        githubUrl={formState.githubUrl}
        setGithubUrl={(value: string) => setField('githubUrl', value)}
        youtubeUrl={formState.youtubeUrl}
        setYoutubeUrl={(value: string) => setField('youtubeUrl', value)}
      />
      <div className="h-15" />
      <ImageUploaderSection
        thumbnail={imageState.thumbnail}
        setThumbnail={(value) => {
          if (value instanceof File) {
            setThumbnailFile(value);
          } else if (!value) {
            markThumbnailForDelete();
          } else {
          }
        }}
        previews={imageState.previews}
        setPreviews={(updater) => {
          if (typeof updater === 'function') {
            const prev = imageState.previews;
            const next = updater(prev);

            const newFiles = next.filter((item): item is File => item instanceof File && !prev.includes(item));
            if (newFiles.length > 0) {
              addPreviewFiles(newFiles);
            }
          } else {
            const newFiles = updater.filter((item): item is File => item instanceof File);
            if (newFiles.length > 0) {
              addPreviewFiles(newFiles);
            }
          }
        }}
        setThumbnailToDelete={() => {
          markThumbnailForDelete();
        }}
        previewsToDelete={imageState.previewsToDelete}
        setPreviewsToDelete={(updater) => {
          if (typeof updater === 'function') {
            const prev = imageState.previewsToDelete;
            const next = updater(prev);

            const newlyAdded = next.filter((id) => !prev.includes(id));
            newlyAdded.forEach((id) => markPreviewForDelete(id));
          } else {
            const prev = imageState.previewsToDelete;
            const newlyAdded = updater.filter((id) => !prev.includes(id));
            newlyAdded.forEach((id) => markPreviewForDelete(id));
          }
        }}
        isAdmin={isAdmin}
      />
      s
      <div className="h-15" />
      <OverviewInput overview={formState.overview} setOverview={(value: string) => setField('overview', value)} />
      <div className="h-20" />
      <div className="flex flex-col-reverse items-end gap-5 sm:flex-row sm:justify-end sm:gap-10">
        <button
          onClick={() => navigate(-1)}
          className="border-mainGreen hover:bg-whiteGray focus:bg-subGreen text-mainGreen rounded-full border px-15 py-4 font-bold hover:cursor-pointer focus:outline-none"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={isSaved || !hasEditorChanges() || !hasCreatorInputs()}
          className={`${isSaved || !hasEditorChanges() || !hasCreatorInputs() ? 'bg-lightGray cursor-not-allowed' : 'bg-mainGreen cursor-pointer hover:bg-green-700 focus:bg-green-400'} rounded-full px-15 py-4 text-sm font-bold text-white transition-colors duration-300 ease-in-out focus:outline-none`}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default ProjectEditorPage;
