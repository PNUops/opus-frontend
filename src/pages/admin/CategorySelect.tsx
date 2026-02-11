import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { categoryOption } from 'queries/category';
import { useEffect } from 'react';

interface CategorySelectProps {
  categoryId: string;
  onChange: (value: string) => void;
  className?: string;
}

const CategorySelect = ({ categoryId, onChange, className = '' }: CategorySelectProps) => {
  const { data: categories } = useQuery(categoryOption());

  useEffect(() => {
    if (categories) onChange(categories[0].categoryId.toString());
  }, [categories]);

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
