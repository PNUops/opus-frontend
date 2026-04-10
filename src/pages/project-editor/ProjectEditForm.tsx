import { useNavigate } from 'react-router-dom';
import { useProjectForm } from '@hooks/useProjectForm';

import ContestMenu from './AdminEditSection/ContestMenu';
import CategoryMenu from './AdminEditSection/CategoryMenu';
import MembersInput from './AdminEditSection/MembersInput';
import UrlInput from './UrlInput';
import ImageUploaderSection from './ImageUploaderSection';
import PosterUploaderSection from './PosterUploaderSection';
import OverviewInput from './OverviewInput';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';

const ProjectEditForm = () => {
  const navigate = useNavigate();
  const {
    isAdmin,
    formState,
    imageState,
    setContestId,
    setField,
    setPoster,
    setPosterFile,
    markPosterForDelete,
    setThumbnail,
    setThumbnailFile,
    markThumbnailForDelete,
    setPreviews,
    markPreviewForDelete,
    onMemberAdd,
    onMemberRemove,
    handleSave,
    hasCreatorInputs,
    hasEditorChanges,
    requiredFields,
    isSaved,
  } = useProjectForm();

  return (
    <div className="min-w-xs px-2 sm:px-5">
      <BasicInfoSection
        isAdmin={isAdmin}
        formState={formState}
        setContestId={setContestId}
        setField={setField}
        requiredFields={requiredFields}
      />
      <div className="h-15" />

      <MembersInput
        teamMembers={formState.teamMembers}
        onMemberAdd={onMemberAdd}
        onMemberRemove={onMemberRemove}
        requiredFields={requiredFields}
      />
      <div className="h-15" />

      <UrlInput
        productionUrl={formState.productionPath}
        setProductionUrl={(value: string) => setField('productionPath', value || null)}
        githubUrl={formState.githubPath}
        setGithubUrl={(value: string) => setField('githubPath', value)}
        youtubeUrl={formState.youTubePath}
        setYoutubeUrl={(value: string) => setField('youTubePath', value)}
        requiredFields={requiredFields}
      />
      <div className="h-15" />

      <PosterUploaderSection
        poster={imageState.poster}
        setPoster={(value) => {
          if (value instanceof File) {
            setPosterFile(value);
          } else if (!value) {
            setPoster(undefined);
          }
        }}
        setPosterToDelete={markPosterForDelete}
        required={requiredFields.posterRequired}
      />
      <div className="h-15" />

      <ImageUploaderSection
        thumbnail={imageState.thumbnail}
        setThumbnail={(value) => {
          if (value instanceof File) {
            setThumbnailFile(value);
          } else if (!value) {
            setThumbnail(undefined);
          }
        }}
        previews={imageState.previews}
        setPreviews={(updater) => {
          if (typeof updater === 'function') {
            const prev = imageState.previews;
            const next = updater(prev);
            setPreviews(next);
            return;
          }
          setPreviews(updater);
        }}
        setThumbnailToDelete={() => {
          markThumbnailForDelete();
        }}
        previewsToDelete={imageState.previewsToDelete}
        setPreviewsToDelete={(updater) => {
          if (typeof updater === 'function') {
            const prev = imageState.previewsToDelete;
            const next = updater(prev);
            next.filter((id) => !prev.includes(id)).forEach((id) => markPreviewForDelete(id));
            return;
          }
          const prev = imageState.previewsToDelete;
          updater.filter((id) => !prev.includes(id)).forEach((id) => markPreviewForDelete(id));
        }}
        required={requiredFields.imagesRequired}
      />
      <div className="h-15" />

      <OverviewInput
        overview={formState.overview}
        setOverview={(value: string) => setField('overview', value)}
        required={requiredFields.overviewRequired}
      />
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
          disabled={isSaved || !hasEditorChanges() || (!isAdmin && !hasCreatorInputs())}
          className={`${isSaved || !hasEditorChanges() || (!isAdmin && !hasCreatorInputs()) ? 'bg-lightGray cursor-not-allowed' : 'bg-mainGreen cursor-pointer hover:bg-green-700 focus:bg-green-400'} rounded-full px-15 py-4 text-sm font-bold text-white transition-colors duration-300 ease-in-out focus:outline-none`}
        >
          저장
        </button>
      </div>
    </div>
  );
};

interface BasicInfoSectionProps {
  isAdmin: boolean;
  formState: {
    contestId: number | null;
    trackId: number | null;
    projectName: string;
    teamName: string;
    professorName: string;
  };
  setContestId: (id: number | null) => void;
  setField: (field: 'trackId' | 'projectName' | 'teamName' | 'professorName', value: number | string | null) => void;
  requiredFields: RequiredFieldsDto;
}

const BasicInfoSection = ({ isAdmin, formState, setContestId, setField, requiredFields }: BasicInfoSectionProps) => {
  return (
    <div className="text-exsm flex flex-col gap-8 sm:gap-5 sm:text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
        <div className="text-midGray flex w-25 gap-1">
          <span className="mr-1 text-red-500">*</span>
          <span className="w-full">대회</span>
        </div>
        <div className="flex flex-1 flex-col">
          <ContestMenu
            value={formState.contestId}
            onChange={(id) => {
              setContestId(isAdmin ? id : formState.contestId);
              setField('trackId', null);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
        <div className="text-midGray flex w-25 gap-1">
          <span className={`mr-1 ${requiredFields.trackRequired ? 'text-red-500' : 'text-transparent'}`}>*</span>
          <span className="w-full">트랙</span>
        </div>
        <div className="flex flex-1 flex-col">
          <CategoryMenu
            contestId={formState.contestId}
            value={formState.trackId}
            onChange={(id) => setField('trackId', isAdmin ? id : formState.trackId)}
          />
        </div>
      </div>

      <TextInputRow
        label="프로젝트"
        value={formState.projectName}
        onChange={(value) => setField('projectName', value)}
        placeholder="프로젝트 이름을 입력해주세요."
        required={requiredFields.projectNameRequired}
      />
      <TextInputRow
        label="팀"
        value={formState.teamName}
        onChange={(value) => setField('teamName', value)}
        placeholder="팀 이름을 입력해주세요."
        required={requiredFields.teamNameRequired}
      />
      <TextInputRow
        label="지도교수"
        value={formState.professorName}
        onChange={(value) => setField('professorName', value)}
        placeholder="지도교수 성함을 입력해주세요."
        required={requiredFields.professorRequired}
      />
    </div>
  );
};

interface TextInputRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required: boolean;
}

const TextInputRow = ({ label, value, onChange, placeholder, required }: TextInputRowProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
    <div className="text-midGray flex w-25 gap-1">
      <span className={`mr-1 ${required ? 'text-red-500' : 'text-transparent'}`}>*</span>
      <span className="w-full text-nowrap">{label}</span>
    </div>
    <div className="flex flex-1 flex-col">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="placeholder-lightGray border-lightGray focus:border-mainGreen w-full truncate rounded border px-5 py-3 text-black duration-300 ease-in-out focus:outline-none"
      />
    </div>
  </div>
);

export default ProjectEditForm;
