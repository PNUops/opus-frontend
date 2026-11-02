import { FiChevronDown } from 'react-icons/fi';
import CarouselSection from './CarouselSection';

interface ProjectMediaSectionProps {
  teamId: number;
  projectName: string | null;
  posterUrl: string | null;
  previewIds: number[];
  youtubeUrl: string;
  isEditor: boolean;
  imagesRequired: boolean;
}

const ProjectMediaSection = ({ posterUrl, projectName, ...carouselProps }: ProjectMediaSectionProps) => (
  <section id="media" aria-labelledby="project-media-title" className="scroll-mt-24">
    <h2 id="project-media-title" className="mb-5 text-lg font-semibold">
      프로젝트 자료
    </h2>
    {posterUrl && (
      <details className="group border-lightGray mb-6 rounded-lg border">
        <summary className="focus-visible:outline-mainGreen flex min-h-24 cursor-pointer list-none items-center gap-4 rounded-lg p-4 focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
          <img src={posterUrl} alt="" className="h-16 w-12 shrink-0 object-contain" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-medium">프로젝트 포스터</span>
            <span className="text-sm text-gray-500 group-open:hidden">전체 포스터 보기</span>
            <span className="hidden text-sm text-gray-500 group-open:inline">포스터 접기</span>
          </span>
          <FiChevronDown aria-hidden className="shrink-0 text-gray-500 group-open:rotate-180" />
        </summary>
        <div className="border-lightGray border-t p-4 sm:p-6">
          <img
            src={posterUrl}
            alt={`${projectName?.trim() || '프로젝트'} 포스터`}
            className="mx-auto h-auto w-full max-w-xl object-contain"
          />
        </div>
      </details>
    )}
    <CarouselSection {...carouselProps} />
  </section>
);

export default ProjectMediaSection;
