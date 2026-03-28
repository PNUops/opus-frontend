import { useMatch } from 'react-router-dom';

export type ProjectEditorMode = 'edit' | 'create';

export const useProjectEditorMode = () => {
  const isEditRoute = !!useMatch('/contest/:contestId/teams/edit/:teamId');
  const mode: ProjectEditorMode = isEditRoute ? 'edit' : 'create';

  return { isEditRoute, mode, isEditMode: mode === 'edit', isCreateMode: mode === 'create' };
};
