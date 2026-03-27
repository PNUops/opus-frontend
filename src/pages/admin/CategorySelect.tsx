import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { categoryOption } from 'queries/category';
import { contestsOption } from 'queries/contest';
import { useContestId } from 'hooks/useId';

interface CategorySelectProps {
  categoryId: string;
  onChange: (value: string) => void;
}

const CategorySelect = ({ categoryId, onChange }: CategorySelectProps) => {
  const contestId = useContestId();
  const { data: contests } = useSuspenseQuery(contestsOption());
  const { data: categories } = useSuspenseQuery(categoryOption());

  useEffect(() => {
    if (categories && contests) {
      if (!contestId) onChange(categories[0].categoryId.toString());
      else {
        const currentId = contests.find((contest) => contest.contestId === contestId)?.categoryId;
        if (currentId) onChange(String(currentId));
      }
    }
  }, [contests, categories, contestId]);

  return (
    <Select onValueChange={onChange} value={categoryId}>
      <SelectTrigger className="border-lightGray bg-whiteGray h-10 w-[250px] rounded-sm shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categories?.map((category) => (
          <SelectItem key={category.categoryId} value={`${category.categoryId}`}>
            {category.categoryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
