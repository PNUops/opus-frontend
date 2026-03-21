import { useState } from 'react';
import { Option } from '../sub-tab/useFilterQueryData';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';

interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}

const FilterDropDown = <T extends string>({ label, value, options, onChange }: Props<T>) => {
  const [open, setOpen] = useState(false);
  const isActive = value !== '';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={` ${
          isActive ? 'bg-mainBlue text-white' : 'bg-whiteGray text-black'
        } flex items-center gap-1 rounded-sm px-2 py-1 text-sm`}
      >
        {label}
        <FaChevronDown />
      </button>

      {open && (
        <div className="bg-whiteGray absolute mt-1 rounded-sm p-2">
          {options.map((opt) => {
            const checked = value === opt.value;

            return (
              <button
                key={opt.value}
                className="hover:bg-lightGray flex items-center gap-2 px-2 py-1"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {checked && <FaCheck />}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropDown;
