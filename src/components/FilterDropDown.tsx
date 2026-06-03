import { useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';
import { cn } from '@utils/classname';

type Option<T extends string = string> = {
  label: string;
  value: T;
};

/** pill: 기존 회색 알약형 / select: 테두리 있는 셀렉트 박스형 */
type FilterDropDownVariant = 'pill' | 'select';

interface FilterDropDownProps<T extends string = string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  variant?: FilterDropDownVariant;
  /** 트리거 버튼에 추가할 클래스 (너비 등 미세 조정용) */
  className?: string;
}

const FilterDropDown = <T extends string = string>({
  label,
  value,
  options,
  onChange,
  variant = 'pill',
  className,
}: FilterDropDownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = value ?? '';
  const safeOptions = options && options.length > 0 ? options : [{ label: '', value: '' as T }];
  const isActive = safeValue !== '' && safeValue !== safeOptions[0].value;
  const isSelect = variant === 'select';

  const triggerClass = isSelect
    ? cn(
        'flex h-9 w-fit min-w-[140px] items-center justify-between gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
        isActive ? 'border-mainBlue text-mainBlue' : 'border-lightGray text-darkGray hover:bg-gray-50',
        className,
      )
    : cn(
        'flex w-fit items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors',
        isActive ? 'bg-mainBlue text-white hover:bg-sky-800' : 'bg-whiteGray hover:bg-lightGray text-black',
        className,
      );

  return (
    <div className="relative flex w-fit flex-col">
      <button className={triggerClass} onClick={() => setIsOpen(!isOpen)}>
        <p className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">{label}</p>
        <FaChevronDown className="size-3 shrink-0" />
      </button>
      {isOpen && (
        <div className={cn('absolute top-full left-0 z-10 mt-1', isSelect && 'w-full min-w-[140px]')}>
          {isSelect ? (
            <div className="border-lightGray flex flex-col rounded-md border bg-white p-1 shadow-md">
              {safeOptions.map((opt, idx) => {
                const isChecked = (safeValue === '' && opt.value === '' && idx === 0) || opt.value === safeValue;
                return (
                  <button
                    key={opt.value}
                    className="hover:bg-whiteGray flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm whitespace-nowrap"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    <FaCheck className={cn('text-mainBlue size-3 shrink-0', !isChecked && 'invisible')} />
                    <span className="flex-1">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-whiteGray flex flex-col items-start gap-1 rounded-sm p-2">
              {safeOptions.map((opt, idx) => {
                const isChecked = (safeValue === '' && opt.value === '' && idx === 0) || opt.value === safeValue;
                return (
                  <button
                    key={opt.value}
                    className="hover:bg-lightGray flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm whitespace-nowrap"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    {isChecked && <FaCheck className="size-3" />}
                    <p className="w-full text-right">{opt.label}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropDown;
