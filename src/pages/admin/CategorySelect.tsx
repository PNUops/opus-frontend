import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

interface CategorySelectProps {
  categoryId: string;
  onChange: (value: string) => void;
  className?: string;
}

const CategorySelect = ({ categoryId, onChange, className = '' }: CategorySelectProps) => {
  // TODO: API 연결

  return (
    <Select onValueChange={onChange} value={categoryId}>
      <SelectTrigger className="border-lightGray bg-whiteGray h-10 w-[250px] rounded-sm shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">해커톤</SelectItem>
        <SelectItem value="2">졸업과제</SelectItem>
        <SelectItem value="3">자유대회</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
