import { useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';

type Option<T extends string = string> = {
  label: string;
  value: T;
};

interface FilterDropDownProps<T extends string = string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

const FilterDropDown = <T extends string = string>({ label, value, options, onChange }: FilterDropDownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = value ?? '';
  const safeOptions = options && options.length > 0 ? options : [{ label: '', value: '' as T }];
  const isActive = safeValue !== '' && safeValue !== safeOptions[0].value;
  return (
    <div className="relative flex w-fit flex-col">
      <button
        className={`${isActive ? 'bg-mainBlue text-white hover:bg-sky-800' : 'bg-whiteGray hover:bg-lightGray text-black'} flex w-fit items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="max-w-30 overflow-hidden text-ellipsis whitespace-nowrap">{label}</p>
        <FaChevronDown className="size-3" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-10 mt-1">
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
        </div>
      )}
    </div>
  );
};

export default FilterDropDown;
