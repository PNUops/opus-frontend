import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';

import adminContestSidebarData from '@constants/adminContestLayoutSidebarData';
import { contestOption } from 'queries/contests';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from 'utils/classname';
import opusAdminLogoUrl from '@assets/logo-opus-admin.svg';

const AdminContestSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contestId } = useParams<{ contestId: string }>();
  const { data: contests = [], isLoading } = useQuery(contestOption());
  const activeSectionTitle = useMemo(() => {
    const currentSegment = location.pathname.split('/').filter(Boolean).at(-1);
    return adminContestSidebarData.find((section) => section.links.some((link) => link.to === currentSegment))?.title;
  }, [location.pathname]);
  const [expandedSectionTitle, setExpandedSectionTitle] = useState<string | null>(activeSectionTitle ?? null);

  const selectedContestId = contestId ?? contests[0]?.contestId.toString();

  useEffect(() => {
    if (activeSectionTitle) {
      setExpandedSectionTitle(activeSectionTitle);
    }
  }, [activeSectionTitle]);

  const handleContestChange = (nextContestId: string) => {
    if (!nextContestId || nextContestId === contestId) return;

    const nextPath = location.pathname.includes('/admin/contest/')
      ? location.pathname.replace(/\/admin\/contest\/[^/]+/, `/admin/contest/${nextContestId}`)
      : `/admin/contest/${nextContestId}`;

    navigate(`${nextPath}${location.search}`);
  };

  return (
    <aside className="fixed top-0 left-0 z-30 h-dvh w-[272px] overflow-hidden bg-white px-4 py-5 shadow-[4px_4px_9.5px_rgba(0,0,0,0.05)]">
      <nav className="flex flex-col gap-7">
        <div className="flex h-[52px] w-[240px] items-center justify-center rounded-[9px] bg-white px-4">
          <img src={opusAdminLogoUrl} alt="OPUS Admin" className="h-[51px] w-[202px] object-contain" />
        </div>

        <div className="px-4">
          {isLoading ? (
            <div className="h-9 w-full animate-pulse rounded-sm bg-[#f9fafb]" />
          ) : (
            <Select value={selectedContestId} onValueChange={handleContestChange}>
              <SelectTrigger
                className="h-9 w-full rounded-none border-0 border-b-2 border-[#e6f2f8] bg-white px-2 py-0 text-[16px] leading-[26px] text-[#111827] shadow-none focus:ring-0 focus:ring-offset-0"
              >
                <SelectValue placeholder="대회를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border-[#d1d5db] bg-white p-1">
                {contests.map((contest) => (
                  <SelectItem
                    key={contest.contestId}
                    value={contest.contestId.toString()}
                    className="rounded-[6px] px-3 py-2 text-[14px]"
                  >
                    {contest.contestName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            cn(
              'flex h-9 w-[240px] items-center gap-4 rounded-[9px] px-4 text-[16px] leading-[26px] font-medium text-[#141b34] transition-colors hover:bg-[#f9fafb]',
              isActive && 'bg-[#e6f2f8]',
            )
          }
        >
          <LayoutDashboard className="h-6 w-6 stroke-[#141b34]" strokeWidth={1.8} />
          <span>대시보드</span>
        </NavLink>

        {adminContestSidebarData.map((section) => {
          const isExpanded = expandedSectionTitle === section.title;
          return (
            <section key={section.title} className="flex flex-col gap-[8px]">
              <button
                type="button"
                className="flex h-[30px] w-[240px] items-center justify-between rounded-[9px] text-left text-[14px] leading-[22px] font-normal text-[#141b34]/40 transition-colors hover:text-[#141b34]"
                onClick={() => setExpandedSectionTitle((prev) => (prev === section.title ? null : section.title))}
                aria-expanded={isExpanded}
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', isExpanded && 'rotate-180')}
                  strokeWidth={2}
                />
              </button>
              {isExpanded && (
                <ul className="flex flex-col gap-[8px]">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          cn(
                            'flex h-[30px] w-[240px] items-center rounded-[9px] px-4 text-[14px] leading-[22px] font-medium text-[#141b34] transition-colors hover:bg-[#f9fafb]',
                            isActive && 'bg-[#e6f2f8]',
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminContestSidebar;
