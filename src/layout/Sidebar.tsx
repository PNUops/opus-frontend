import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ContestResponseDto, GroupedContestResponseDto } from '@dto/contestsDto';
import { cn } from '@utils/classname';
import { useQuery } from '@tanstack/react-query';
import { getGroupedContests } from '@apis/contest';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
}

const Sidebar = ({ variant = 'desktop' }: SidebarProps) => {
  const { data: groups } = useQuery({ queryKey: ['groupedContests'], queryFn: getGroupedContests });
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const containerClassName =
    variant === 'desktop' ? 'min-w-sidebar hidden bg-white lg:block' : 'h-full w-full bg-white';

  return (
    <aside className={containerClassName}>
      <nav className="flex flex-col">
        {groups &&
          groups.map((group) => (
            <CategoryGroup
              key={group.categoryId}
              category={group}
              isExpanded={expandedCategoryId === group.categoryId}
              onToggle={() => toggleCategory(group.categoryId)}
            />
          ))}
      </nav>
    </aside>
  );
};

interface CategoryGroupProps {
  category: GroupedContestResponseDto;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryGroup = ({ category, isExpanded, onToggle }: CategoryGroupProps) => (
  <div>
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between px-5 py-4 text-left transition-all',
        isExpanded ? 'bg-mainGreen text-white' : 'hover:bg-whiteGray bg-white text-neutral-700',
      )}
    >
      <span className="text-base font-medium">{category.categoryName}</span>
      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>

    {isExpanded && <ContestList contests={category.contests} />}
  </div>
);

interface ContestListProps {
  contests: Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>[];
}

const ContestList = ({ contests }: ContestListProps) => {
  const baseStyle =
    'hover:text-mainGreen bg-whiteGray w-full px-6 py-3 text-left text-base transition-all text-neutral-700';
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(baseStyle, isActive && 'text-mainGreen font-semibold');
  return (
    <div className="flex flex-col bg-white">
      {contests.map((contest) => (
        <NavLink key={contest.contestId} to={`/contest/${contest.contestId}`} className={getLinkClass}>
          {contest.contestName}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
