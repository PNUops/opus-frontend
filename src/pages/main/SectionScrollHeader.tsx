import { type KeyboardEvent } from 'react';

interface SectionScrollHeaderProps {
  className: string;
  eyebrow: string;
  title: string;
  titleId?: string;
  scrollFromSectionStart?: boolean;
}

const scrollToHeader = (element: HTMLElement, scrollFromSectionStart: boolean) => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const target = scrollFromSectionStart ? element.parentElement : element;
  target?.scrollIntoView({ behavior, block: 'start' });
};

const SectionScrollHeader = ({
  className,
  eyebrow,
  title,
  titleId,
  scrollFromSectionStart = false,
}: SectionScrollHeaderProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    scrollToHeader(event.currentTarget, scrollFromSectionStart);
  };

  return (
    <header
      className={`${className} opus-section-scroll-target`}
      role="button"
      tabIndex={0}
      aria-label={`${title} 섹션을 화면 상단으로 이동`}
      title="클릭하면 이 섹션을 화면 상단에서 볼 수 있어요."
      onClick={(event) => scrollToHeader(event.currentTarget, scrollFromSectionStart)}
      onKeyDown={handleKeyDown}
    >
      <p>{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
    </header>
  );
};

export default SectionScrollHeader;
