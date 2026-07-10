import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChevronDown, Home, LayoutGrid } from 'lucide-react';

import logoOpusAdmin from './logo-opus-admin.svg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from '@components/lib/utils';
import { useContestId } from '@hooks/useId';
import { useToast } from '@hooks/useToast';
import QueryWrapper from '@providers/QueryWrapper';
import { contestsOption } from '@queries/contest';

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
    'relative flex h-10 items-center gap-3 border-l-[3px] px-5 text-[15px] font-semibold transition-colors',
    isActive
      ? 'border-l-mainBlue bg-mainBlue/8 text-gray-950'
      : 'border-l-transparent text-gray-800 hover:bg-mainBlue/5',
  );

const contestLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-9 items-center border-l-[3px] px-5 text-[14px] font-medium transition-colors',
    isActive
      ? 'border-l-mainBlue bg-mainBlue/8 text-gray-950'
      : 'border-l-transparent text-gray-700 hover:bg-mainBlue/5',
  );

const AdminSidebar = () => {
  return (
    <aside
      aria-label="관리자 사이드 내비게이션"
      className="border-lightGray fixed top-0 bottom-0 left-0 z-30 flex w-[272px] flex-col border-r bg-white"
    >
      <div className="h-header flex items-center justify-center px-6">
        <Link to="/admin" aria-label="관리자 대시보드로 이동" className="flex items-center justify-center">
          <img src={logoOpusAdmin} alt="OPUS Admin" className="h-14 w-auto max-w-[196px]" />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-5">
        <NavLink to="/admin" end className={dashboardLinkClass}>
          <LayoutGrid className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
          <span>대시보드</span>
        </NavLink>

        <QueryWrapper loadingStyle="mx-5 mt-6 h-[520px]" errorStyle="mx-5 mt-6 min-h-40 text-sm">
          <AdminContestSidebarContent />
        </QueryWrapper>
      </nav>

      <div className="py-5">
        <Link
          to="/"
          className="hover:bg-mainBlue/5 flex h-10 items-center gap-3 border-l-[3px] border-l-transparent px-5 text-[14px] font-medium text-gray-700 transition-colors hover:text-gray-950"
        >
          <Home className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
          <span>서비스 홈</span>
        </Link>
      </div>
    </aside>
  );
};

const AdminContestSidebarContent = () => {
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
    navigate(`/admin/contest/${nextContestId}`);
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
            className="border-lightGray h-10 w-full rounded-none border-0 border-b bg-transparent px-0 py-0 text-[15px] font-normal text-gray-900 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
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
}

const AdminSidebarSection = ({ contestId, isActive, isOpen, section, onClose, onOpen }: AdminSidebarSectionProps) => {
  return (
    <section onMouseEnter={() => onOpen(section.title)} onMouseLeave={onClose}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between px-5 text-left text-[13px] transition-colors',
          isActive ? 'text-mainBlue' : 'hover:bg-mainBlue/5 hover:text-gray-700',
        )}
        aria-expanded={isOpen}
        onClick={() => onOpen(section.title)}
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
        <ul className="min-h-0 overflow-hidden">
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
