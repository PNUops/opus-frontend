import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled = false, ariaLabel }) => {
  return (
    <input
      aria-label={ariaLabel}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      className={`text-mainBlue accent-mainBlue h-5 w-5 rounded border-gray-300 focus:ring-0 disabled:opacity-50`}
    />
  );
};

export default Checkbox;
