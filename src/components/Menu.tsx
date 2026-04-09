import { useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

import { useOutsideClick } from '@hooks/useOutsideClick';

export type MenuValue = number | string;

export interface MenuOption<T extends MenuValue = MenuValue> {
  label: string;
  value: T;
}

interface MenuProps<T extends MenuValue = MenuValue> {
  options: MenuOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

const Menu = <T extends MenuValue>({
  options,
  value,
  onChange,
  placeholder = '항목을 선택해주세요.',
  loading = false,
  error,
  emptyMessage = '다시 시도해주세요.',
}: MenuProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const selected = options.find((option) => option.value === value);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  if (loading) {
    return <div className="border-lightGray h-12 w-full animate-pulse rounded border bg-gray-100" />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (options.length === 0) {
    return (
      <div className="bg-mainRed/10 border-mainRed text-mainRed rounded-full border px-3 py-1 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="text-exsm relative w-full max-w-sm sm:text-sm">
      <button
        type="button"
        className="border-lightGray focus:ring-subGreen focus:border-mainGreen flex w-full items-center justify-between rounded border px-5 py-3 text-left duration-150 hover:cursor-pointer focus:outline-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={selected ? '' : 'text-midGray'}>{selected?.label ?? placeholder}</span>
        <FaChevronDown className={`${isOpen ? 'text-mainGreen' : 'text-lightGray'}`} />
      </button>

      {isOpen && (
        <ul
          className="border-lightGray absolute z-10 mt-4 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-sm"
          ref={dropdownRef}
        >
          {options.map((option) => (
            <li
              key={String(option.value)}
              className={`border-whiteGray cursor-pointer border-b-1 p-4 transition-colors duration-200 ease-in-out ${
                option.value === value ? 'bg-whiteGray text-mainGreen' : 'hover:bg-whiteGray'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Menu;
