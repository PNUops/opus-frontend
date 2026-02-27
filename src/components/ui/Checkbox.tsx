import { FaCheck } from 'react-icons/fa';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const Checkbox = ({ checked, onChange, disabled = false, ariaLabel }: CheckboxProps) => {
  return (
    <div className="w-fit">
      <input
        id={ariaLabel}
        aria-label={ariaLabel}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <label
        htmlFor={ariaLabel}
        className="border-mainBlue peer-checked:bg-mainBlue flex h-5.5 w-5.5 items-center justify-center rounded-sm border p-1 hover:cursor-pointer"
      >
        {checked && <FaCheck fill="white" size={14} />}
      </label>
    </div>
  );
};

export default Checkbox;
