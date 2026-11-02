import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChevronDown, Home, LayoutGrid, MessageSquareShare, X } from 'lucide-react';
import { useMediaQuery } from '@react-hookz/web';
import { useSidebar } from '@layout/SidebarContext';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@components/ui/sheet';

import logoOpusAdmin from './logo-opus-admin.svg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from '@components/lib/utils';
import { useContestId } from '@hooks/useId';
import { useToast } from '@hooks/useToast';
import QueryWrapper from '@providers/QueryWrapper';
import { contestsOption } from '@queries/contest';

import { EXTERNAL_LINKS } from '@constants/external-links';

type AdminSidebarLink = {
  label: string;
  to?: string;
  disabled?: boolean;
};

type AdminSidebarSection = {
  title: string;
  links: AdminSidebarLink[];
};

const adminSidebarSections: AdminSidebarSection[] = [
  {
    title: '대회 설정',
    links: [
      { to: 'manage', label: '대회 기본 정보' },
      { to: 'tracks', label: '분과 관리' },
      { to: 'required-fields', label: '제출 폼 필수 항목' },
    ],
  },
  {
    title: '참여자/역할',
    links: [
      { to: 'team-setting', label: '팀 일괄 등록' },
      { to: 'roles', label: '지도교수 및 멘토 지정' },
    ],
  },
  {
    title: '제출 관리',
    links: [
      { to: 'projects', label: '프로젝트 관리' },
      { to: 'submission-manage', label: '제출 자료 관리' },
      { to: 'sort', label: '공개 목록 정렬' },
    ],
  },
  {
    title: '대회 콘텐츠',
    links: [
      { to: 'notices', label: '대회 공지' },
      { to: 'banners', label: '대회 배너' },
    ],
  },
  {
    title: '평가',
    links: [{ label: '평가 설정', disabled: true }],
  },
  {
    title: '투표/결과',
    links: [
      { to: 'votes', label: '투표 설정' },
      { to: 'statistics', label: '투표 결과/로그' },
      { to: 'awards', label: '수상 배정' },
    ],
  },
];

const getContestLinkPath = (contestId: string, to: string) => `/admin/contest/${contestId}/${to}`;

const isSamePathGroup = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

const getActiveSectionTitle = (pathname: string, contestId?: string) => {
  if (!contestId) return null;

  const activeSection = adminSidebarSections.find((section) =>
    section.links.some((link) => link.to && isSamePathGroup(pathname, getContestLinkPath(contestId, link.to))),
  );

  return activeSection?.title ?? null;
};

const dashboardLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex min-h-11 items-center gap-3 border-l-[3px] px-5 text-[15px] font-semibold transition-colors lg:min-h-10',
    isActive
      ? 'border-l-mainBlue bg-mainBlue/8 text-gray-950'
      : 'border-l-transparent text-gray-800 hover:bg-mainBlue/5',
  );

const contestLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-11 items-center border-l-[3px] px-5 py-2 text-[14px] font-medium transition-colors lg:min-h-9 lg:py-0',
    isActive
      ? 'border-l-mainBlue bg-mainBlue/8 text-gray-950'
      : 'border-l-transparent text-gray-700 hover:bg-mainBlue/5',
  );

const utilityItemClass =
  'hover:bg-mainBlue/5 flex min-h-11 items-center gap-3 border-l-[3px] border-l-transparent px-5 text-[14px] font-medium text-gray-700 transition-colors hover:text-gray-950 lg:min-h-10';

const AdminSidebar = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isOpen, open, close } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname, isDesktop, close]);

  if (!isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={(nextOpen) => (nextOpen ? open() : close())}>
        <SheetContent
          id="admin-mobile-navigation"
          side="left"
          className="w-[min(360px,calc(100vw-32px))] gap-0 bg-white pb-[env(safe-area-inset-bottom)] motion-reduce:animate-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById('admin-menu-trigger')?.focus();
          }}
        >
          <SheetTitle className="sr-only">관리자 메뉴</SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="관리자 메뉴 닫기"
              className="hover:bg-whiteGray focus-visible:outline-mainBlue absolute top-2 right-2 flex size-11 items-center justify-center rounded-md text-neutral-600 focus-visible:outline-2"
            >
              <X size={20} aria-hidden />
            </button>
          </SheetClose>
          <AdminSidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      aria-label="관리자 사이드 내비게이션"
      className="border-lightGray fixed top-0 bottom-0 left-0 z-30 flex w-[272px] flex-col border-r bg-white"
    >
      <AdminSidebarContent />
    </aside>
  );
};

const AdminSidebarContent = () => {
  const { close } = useSidebar();
  return (
    <>
      <div className="h-header flex items-center justify-center px-6">
        <Link
          to="/admin"
          onClick={close}
          aria-label="관리자 대시보드로 이동"
          className="flex items-center justify-center"
          replace
        >
          <img src={logoOpusAdmin} alt="OPUS Admin" className="h-14 w-auto max-w-[196px]" />
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto py-5"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a[href]')) close();
        }}
      >
        <NavLink to="/admin" end className={dashboardLinkClass} replace>
          <LayoutGrid className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
          <span>대시보드</span>
        </NavLink>

        <QueryWrapper loadingStyle="mx-5 mt-6 h-[520px]" errorStyle="mx-5 mt-6 min-h-40 text-sm">
          <AdminContestSidebarContent />
        </QueryWrapper>
      </nav>

      <div className="mt-auto py-5">
        <Link to="/" className={utilityItemClass}>
          <Home className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
          <span>서비스 홈</span>
        </Link>
        <a
          href={EXTERNAL_LINKS.FEEDBACK}
          target="_blank"
          rel="noopener noreferrer"
          className={`${utilityItemClass} group relative`}
        >
          <MessageSquareShare className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
          <span>의견 보내기</span>
          <span
            id="feedback-tooltip"
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-5 z-50 mb-2 w-max max-w-64 rounded-md bg-gray-900 px-3 py-2 text-xs font-light text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            OPUS 사용 중 발견한 문제나 개선 의견을 남겨주세요.
          </span>
        </a>
      </div>
    </>
  );
};

const AdminContestSidebarContent = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { close } = useSidebar();
  const contestId = useContestId();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: contests } = useSuspenseQuery(contestsOption());
  const selectedContestId = contestId?.toString() ?? '';
  const activeSectionTitle = getActiveSectionTitle(location.pathname, selectedContestId);
  const [openSectionTitle, setOpenSectionTitle] = useState<string | null>(activeSectionTitle);

  useEffect(() => {
    setOpenSectionTitle(activeSectionTitle);
  }, [activeSectionTitle]);

  const handleContestChange = (nextContestId: string) => {
    navigate(`/admin/contest/${nextContestId}`, { replace: true });
    close();
  };

  const handleSectionOpen = (sectionTitle: string) => {
    setOpenSectionTitle(sectionTitle);
  };

  const handleSectionClose = () => {
    setOpenSectionTitle(activeSectionTitle);
  };

  return (
    <>
      <div className="mx-5 mt-6">
        <Select value={selectedContestId} onValueChange={handleContestChange}>
          <SelectTrigger
            aria-label="관리할 대회"
            className="border-lightGray min-h-11 w-full rounded-none border-0 border-b bg-transparent px-0 py-0 text-[15px] font-normal text-gray-900 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none lg:min-h-10"
            iconClassName="stroke-mainBlue h-4 w-4 opacity-100"
            disabled={contests.length === 0}
          >
            <SelectValue placeholder="대회를 선택해주세요" />
          </SelectTrigger>
          <SelectContent className="border-lightGray bg-white">
            {contests.map((contest) => (
              <SelectItem key={contest.contestId} value={contest.contestId.toString()}>
                {contest.contestName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex flex-col">
        {adminSidebarSections.map((section) => (
          <AdminSidebarSection
            key={section.title}
            contestId={selectedContestId || undefined}
            isActive={activeSectionTitle === section.title}
            isOpen={openSectionTitle === section.title}
            section={section}
            onClose={handleSectionClose}
            onOpen={handleSectionOpen}
            onToggle={() => setOpenSectionTitle((current) => (current === section.title ? null : section.title))}
            isDesktop={!!isDesktop}
          />
        ))}
      </div>
    </>
  );
};

interface AdminSidebarSectionProps {
  contestId?: string;
  isActive: boolean;
  isOpen: boolean;
  section: AdminSidebarSection;
  onClose: () => void;
  onOpen: (sectionTitle: string) => void;
  onToggle: () => void;
  isDesktop: boolean;
}

const AdminSidebarSection = ({
  contestId,
  isActive,
  isOpen,
  section,
  onClose,
  onOpen,
  onToggle,
  isDesktop,
}: AdminSidebarSectionProps) => {
  return (
    <section onMouseEnter={() => isDesktop && onOpen(section.title)} onMouseLeave={() => isDesktop && onClose()}>
      <button
        type="button"
        className={cn(
          'flex min-h-11 w-full items-center justify-between px-5 text-left text-[13px] transition-colors lg:min-h-10',
          isActive ? 'text-mainBlue' : 'hover:bg-mainBlue/5 hover:text-gray-700',
        )}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{section.title}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          strokeWidth={1.8}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul inert={!isOpen} className="min-h-0 overflow-hidden">
          {section.links.map((link) => (
            <li key={link.label}>
              <AdminSidebarItem contestId={contestId} link={link} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const AdminSidebarItem = ({ contestId, link }: { contestId?: string; link: AdminSidebarLink }) => {
  const toast = useToast();
  const { to, disabled, label } = link;

  if (!contestId && to && !disabled) {
    return (
      <button
        type="button"
        className="flex h-9 w-full cursor-not-allowed items-center border-l-[3px] border-l-transparent px-5 text-left text-[14px] font-medium text-gray-500"
        aria-disabled="true"
        onClick={() => toast('대회를 선택해주세요', 'info')}
      >
        {label}
      </button>
    );
  }

  if (disabled || !to) {
    return (
      <span className="flex h-9 cursor-not-allowed items-center border-l-[3px] border-l-transparent px-5 text-[14px] font-medium text-gray-500">
        {label}
      </span>
    );
  }

  return (
    <NavLink to={getContestLinkPath(contestId!, to)} className={contestLinkClass}>
      {label}
    </NavLink>
  );
};

export default AdminSidebar;
