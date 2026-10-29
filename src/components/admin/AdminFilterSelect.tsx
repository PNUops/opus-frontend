import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from '@utils/classname';

interface AdminFilterSelectProps<T extends string> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  className?: string;
  variant?: 'select';
}

/** 기존 필터의 빈 문자열 값도 Radix Select의 비어 있지 않은 항목 ID로 연결합니다. */
export const AdminFilterSelect = <T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: AdminFilterSelectProps<T>) => {
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <Select
      value={selectedIndex < 0 ? '' : String(selectedIndex)}
      onValueChange={(index) => {
        const option = options[Number(index)];
        if (option) onChange(option.value);
      }}
    >
      <SelectTrigger appearance="admin" aria-label={label} className={cn('w-fit min-w-[140px] gap-3', className)}>
        <SelectValue placeholder={label}>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent collisionPadding={16} className="border-lightGray shadow-sm">
        {options.map((option, index) => (
          <SelectItem key={option.value} value={String(index)} className="focus:bg-whiteGray min-h-11">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
