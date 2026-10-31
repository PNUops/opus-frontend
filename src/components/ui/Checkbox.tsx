import { FaCheck } from 'react-icons/fa';
import { useId } from 'react';
import { cn } from '@utils/classname';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  touchTarget?: boolean;
}

const Checkbox = ({ checked, onChange, disabled = false, ariaLabel, touchTarget = false }: CheckboxProps) => {
  const id = useId();
  return (
    <div className="w-fit">
      <input
        id={id}
        aria-label={ariaLabel}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'peer-focus-visible:outline-mainBlue flex items-center justify-center rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 hover:cursor-pointer',
          touchTarget ? 'h-11 w-11 lg:h-5.5 lg:w-5.5' : 'h-5.5 w-5.5',
        )}
      >
        <span
          className={cn(
            'border-mainBlue flex h-5.5 w-5.5 items-center justify-center rounded-sm border p-1',
            checked && 'bg-mainBlue',
          )}
        >
          {checked && <FaCheck fill="white" size={14} />}
        </span>
      </label>
    </div>
  );
};

export default Checkbox;
