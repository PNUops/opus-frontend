import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import useContests from 'hooks/useContests';
import { ContestResponseDto } from 'types/DTO/contestsDto';
import { cn } from 'utils/classname';

const Sidebar = () => {
  const { data: contests } = useContests();
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const categories = useMemo(() => (contests ? groupContestsByCategory(contests) : []), [contests]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <aside className="min-w-sidebar hidden bg-white lg:block">
      <nav className="flex flex-col">
        {categories.map((category) => (
          <CategoryItem
            key={category.categoryId}
            category={category}
            isExpanded={expandedCategoryId === category.categoryId}
            onToggle={() => toggleCategory(category.categoryId)}
          />
        ))}
      </nav>
    </aside>
  );
};

interface Category {
  categoryId: number;
  categoryName: string;
  contests: ContestResponseDto[];
}

interface CategoryItemProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryItem = ({ category, isExpanded, onToggle }: CategoryItemProps) => (
  <div>
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between px-5 py-4 text-left transition-all',
        isExpanded ? 'bg-mainGreen text-white' : 'bg-white text-gray-800 hover:bg-gray-50'
      )}
    >
      <span className="text-lg font-medium">{category.categoryName}</span>
      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>

    {isExpanded && <ContestList contests={category.contests} />}

    <div className="border-b border-gray-200" />
  </div>
);

interface ContestListProps {
  contests: ContestResponseDto[];
}

const ContestList = ({ contests }: ContestListProps) => (
  <div className="flex flex-col bg-white">
    {contests.map((contest) => (
      <Link
        key={contest.contestId}
        to={`/contest/${contest.contestId}`}
        className="hover:text-mainGreen w-full bg-gray-50 px-6 py-3 text-left text-lg transition-all"
      >
        {contest.contestName}
      </Link>
    ))}
  </div>
);

const groupContestsByCategory = (contests: ContestResponseDto[]): Category[] => {
  const categoryMap = new Map<number, Category>();

  contests.forEach((contest) => {
    if (!categoryMap.has(contest.categoryId)) {
      categoryMap.set(contest.categoryId, {
        categoryId: contest.categoryId,
        categoryName: contest.categoryName,
        contests: [],
      });
    }
    categoryMap.get(contest.categoryId)!.contests.push(contest);
  });

  return Array.from(categoryMap.values());
};

export default Sidebar;
