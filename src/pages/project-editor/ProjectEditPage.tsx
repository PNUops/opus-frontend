import ProjectEditForm from '@pages/project-editor/ProjectEditForm';
import { useProjectEditorMode } from './useProjectEditorMode';

const ProjectEditPage = () => {
  const { isEditMode } = useProjectEditorMode();

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
      <ProjectEditForm />
    </div>
  );
};

export default ProjectEditPage;
