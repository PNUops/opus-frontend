import { useQuery } from '@tanstack/react-query';

import { GithubCardSkeleton } from '@pages/project-viewer/DetailSkeleton';
import { fetchGithubContent } from '@utils/media';

import { FaGithub } from 'react-icons/fa';

interface GithubCardProps {
  githubUrl: string;
}

export type GithubContentType = 'repo' | 'profile';

export interface GithubRepoData {
  name: string;
  description: string;
  html_url: string;
  owner: {
    avatar_url: string;
    login: string;
  };
}

export interface GithubProfileData {
  login: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  name?: string;
  public_repos?: number;
}

const GithubCard = ({ githubUrl }: GithubCardProps) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['githubContent', githubUrl],
    queryFn: () => fetchGithubContent(githubUrl),
    enabled: !!githubUrl,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  if (isPending) return <GithubCardSkeleton />;
  if (isError || !data) return null;

  const cardStyle =
    'flex w-full items-center justify-between rounded border border-lightGray bg-white px-6 py-5 transition hover:bg-whiteGray';

  if (data.type === 'repo') {
    const repo = data.data as GithubRepoData;
    return (
      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className={cardStyle}>
        <div className="flex flex-col gap-1 truncate">
          <p className="text-exsm truncate font-semibold text-gray-900 sm:text-sm">{repo.name}</p>
          <p className="sm:text-exsm line-clamp-2 truncate text-xs text-gray-600">
            {repo.description || 'No description provided.'}
          </p>
          <div className="sm:text-exsm mt-2 flex items-center gap-2 text-xs text-gray-700 hover:text-black">
            <FaGithub size={16} className="shrink-0" />
            <p className="truncate">{repo.html_url}</p>
          </div>
        </div>
        <img src={repo.owner.avatar_url} alt={`${repo.owner.login}'s avatar`} className="h-15 w-15 sm:h-20 sm:w-20" />
      </a>
    );
  }

  if (data.type === 'profile') {
    const profile = data.data as GithubProfileData;

    return (
      <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className={cardStyle}>
        <div className="flex flex-col gap-1 truncate">
          <p className="text-exsm truncate font-semibold text-gray-900 sm:text-sm">{profile.name || profile.login}</p>
          <p className="sm:text-exsm line-clamp-2 truncate text-xs text-gray-600">
            {profile.name || profile.login} has {profile.public_repos ?? 'several'} repositories available. Follow their
            code on GitHub.
          </p>
          <div className="sm:text-exsm mt-2 flex items-center gap-2 text-xs text-gray-700 hover:text-black">
            <FaGithub size={16} className="shrink-0" />
            <p className="truncate">{profile.html_url}</p>
          </div>
        </div>
        <img src={profile.avatar_url} alt={`${profile.login}'s avatar`} className="h-15 w-15 sm:h-20 sm:w-20" />
      </a>
    );
  }

  return null;
};

export default GithubCard;
