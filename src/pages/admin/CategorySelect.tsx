import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { categoryOption } from 'queries/category';
import { contestOption } from 'queries/contests';

interface CategorySelectProps {
  categoryId: string;
  onChange: (value: string) => void;
  className?: string;
}

const CategorySelect = ({ categoryId, onChange, className = '' }: CategorySelectProps) => {
  const { contestId: contestIdParam } = useParams();
  const { data: contests } = useQuery(contestOption());
  const { data: categories } = useQuery(categoryOption());

  useEffect(() => {
    if (categories && contests) {
      if (!contestIdParam) onChange(categories[0].categoryId.toString());
      else {
        const currentId = contests.find((contest) => contest.contestId === Number(contestIdParam))?.categoryId;
        if (currentId) onChange(String(currentId));
      }
    }
  }, [contests, categories, contestIdParam]);

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
