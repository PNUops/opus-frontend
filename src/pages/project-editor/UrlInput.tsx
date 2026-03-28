import React from 'react';

import { RiLink } from 'react-icons/ri';
import { FaGithub, FaYoutube } from 'react-icons/fa';
import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';

interface UrlInputProps {
  productionUrl: string | null;
  setProductionUrl: (value: string) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  requiredFields: RequiredFieldsDto;
}

const UrlInput = ({
  productionUrl,
  setProductionUrl,
  githubUrl,
  setGithubUrl,
  youtubeUrl,
  setYoutubeUrl,
  requiredFields,
}: UrlInputProps) => {
  return (
    <div className="text-exsm flex flex-col gap-3 sm:flex-row sm:gap-10 sm:text-sm">
      <div className="text-midGray flex w-25 sm:py-3">
        {requiredFields.githubPathRequired ||
        requiredFields.youTubePathRequired ||
        requiredFields.productionPathRequired ? (
          <span className="mr-1 text-red-500">*</span>
        ) : null}
        <span>URL</span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="relative w-full">
          <FaGithub className="absolute top-1/2 left-5 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="url"
            placeholder="https://github.com"
            className="placeholder-lightGray focus:border-mainGreen border-lightGray w-full truncate rounded border py-3 pr-5 pl-13 text-black duration-300 ease-in-out focus:outline-none"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          {!githubUrl &&
            (requiredFields.githubPathRequired ? (
              <span className="text-mainGreen/60 bg-subGreen/50 absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                필수
              </span>
            ) : (
              <span className="text-midGray/80 bg-whiteGray absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                선택
              </span>
            ))}
        </div>
        <div className="relative w-full">
          <FaYoutube className="absolute top-1/2 left-5 -translate-y-1/2 text-red-400" size={20} />
          <input
            type="url"
            placeholder="https://youtube.com"
            className="placeholder-lightGray focus:border-mainGreen border-lightGray w-full truncate rounded border py-3 pr-5 pl-13 text-black duration-300 ease-in-out focus:outline-none"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          {!youtubeUrl &&
            (requiredFields.youTubePathRequired ? (
              <span className="text-mainGreen/60 bg-subGreen/50 absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                필수
              </span>
            ) : (
              <span className="text-midGray/80 bg-whiteGray absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                선택
              </span>
            ))}
        </div>
        <div className="relative w-full">
          <RiLink className="text-mainGreen/50 absolute top-1/2 left-5 -translate-y-1/2" size={20} />
          <input
            type="url"
            placeholder="https://your-project.com"
            className="placeholder-lightGray focus:border-mainGreen border-lightGray w-full truncate rounded border py-3 pr-5 pl-13 text-black duration-300 ease-in-out focus:outline-none"
            value={productionUrl ?? ''}
            onChange={(e) => setProductionUrl(e.target.value)}
          />
          {!productionUrl &&
            (requiredFields.productionPathRequired ? (
              <span className="text-mainGreen/60 bg-subGreen/50 absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                필수
              </span>
            ) : (
              <span className="text-midGray/80 bg-whiteGray absolute top-1/2 right-4 -translate-y-1/2 rounded-full px-2 py-1 text-xs">
                선택
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UrlInput;
