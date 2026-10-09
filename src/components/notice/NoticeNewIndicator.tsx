import type { ComponentProps } from 'react';

interface NoticeNewIndicatorProps extends ComponentProps<'span'> {
  label?: string;
}

export const NoticeNewIndicator = ({ className = '', label = '새 공지', ...props }: NoticeNewIndicatorProps) => (
  <span {...props} role="img" aria-label={label} className={`size-1.5 shrink-0 rounded-full ${className}`.trim()} />
);
