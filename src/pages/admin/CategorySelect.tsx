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
  const { data: categorys } = useQuery(categoryOption());

  useEffect(() => {
    if (categorys) onChange(categorys[0].categoryId.toString());
  }, [categorys]);

  return (
    <Select onValueChange={onChange} value={categoryId}>
      <SelectTrigger className="border-lightGray bg-whiteGray h-10 w-[250px] rounded-sm shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categorys?.map((category) => (
          <SelectItem key={category.categoryId} value={`${category.categoryId}`}>
            {category.categoryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
