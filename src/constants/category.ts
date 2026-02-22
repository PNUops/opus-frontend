export type Category = '해커톤' | '캡스톤' | '기타';

export type ProjectField = 'PROFESSOR_NAME' | 'GITHUB_URL' | 'YOUTUBE_URL' | 'PRODUCTION_URL' | 'POSTER_IMAGE';

export interface CategoryVisibleFieldsConfigDto {
  category: Category;
  visibleFields: ProjectField[];
}

export const hackathonConfig: CategoryVisibleFieldsConfigDto = {
  category: '해커톤',
  visibleFields: ['GITHUB_URL', 'YOUTUBE_URL', 'PRODUCTION_URL'],
};

export const capstoneConfig: CategoryVisibleFieldsConfigDto = {
  category: '캡스톤',
  visibleFields: ['PROFESSOR_NAME', 'GITHUB_URL', 'YOUTUBE_URL', 'PRODUCTION_URL', 'POSTER_IMAGE'],
};

export const defaultCategoryConfig: CategoryVisibleFieldsConfigDto = {
  category: '해커톤',
  visibleFields: ['PROFESSOR_NAME', 'GITHUB_URL', 'YOUTUBE_URL', 'PRODUCTION_URL', 'POSTER_IMAGE'],
};
