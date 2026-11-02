import type { ReactNode } from 'react';

interface AuthFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
}

const AuthField = ({ id, label, children, error, hint }: AuthFieldProps) => (
  <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium text-neutral-700">
      {label}
    </label>
    {children}
    {hint && (
      <p id={`${id}-hint`} className="text-xs leading-relaxed text-neutral-600">
        {hint}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} className="text-destructive text-sm leading-relaxed break-keep" role="alert">
        {error}
      </p>
    )}
  </div>
);

export default AuthField;
