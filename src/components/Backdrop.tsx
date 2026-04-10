import { HTMLAttributes } from 'react';
import { cn } from '@utils/classname';

interface Prop extends HTMLAttributes<HTMLDivElement> {
  isVisible: boolean;
  classname?: string;
}

/**
 * Backdrop 컴포넌트
 * 기본 z-index는 40이며, 수정을 원할 시 className으로 오버라이딩이 가능하다.
 */
const Backdrop = ({ isVisible, className, ...props }: Prop) => {
  if (!isVisible) return null;
  return <div className={cn('fixed inset-0 z-40 bg-black/30 backdrop-blur-xs', className)} {...props} />;
};

export default Backdrop;
