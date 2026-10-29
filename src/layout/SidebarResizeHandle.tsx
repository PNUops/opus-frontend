import { useRef, useState } from 'react';
import { SIDEBAR_WIDTH } from './hooks/useSidebarWidth';
import { cn } from '@utils/classname';

interface SidebarResizeHandleProps {
  width: number;
  maxWidth: number;
  onChange: (width: number, persist?: boolean) => void;
  onReset: () => void;
  editorial: boolean;
}

export const SidebarResizeHandle = ({ width, maxWidth, onChange, onReset, editorial }: SidebarResizeHandleProps) => {
  const drag = useRef<{ id: number; startX: number; startWidth: number; nextWidth: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cancel = () => {
    if (drag.current) onChange(drag.current.startWidth);
    drag.current = null;
    setIsDragging(false);
  };

  return (
    <div
      role="separator"
      aria-label="대회 목록 너비 조절"
      aria-controls="desktop-contest-navigation"
      aria-orientation="vertical"
      aria-valuemin={SIDEBAR_WIDTH.min}
      aria-valuemax={maxWidth}
      aria-valuenow={width}
      aria-valuetext={`${width}px`}
      tabIndex={0}
      title="드래그하거나 방향키로 너비 조절 · 두 번 클릭하면 기본값"
      className={cn(
        'group absolute inset-y-0 -right-1.5 z-10 flex w-3 cursor-col-resize touch-none items-start justify-center outline-none',
        isDragging && 'select-none',
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, startX: event.clientX, startWidth: width, nextWidth: width };
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId) return;
        current.nextWidth = current.startWidth + event.clientX - current.startX;
        onChange(current.nextWidth);
      }}
      onPointerUp={(event) => {
        if (drag.current?.id !== event.pointerId) return;
        const next = drag.current.nextWidth;
        drag.current = null;
        setIsDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
        onChange(next, true);
      }}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          cancel();
          return;
        }
        const step = event.shiftKey ? 40 : 10;
        const next =
          event.key === 'ArrowLeft'
            ? width - step
            : event.key === 'ArrowRight'
              ? width + step
              : event.key === 'Home'
                ? SIDEBAR_WIDTH.min
                : event.key === 'End'
                  ? maxWidth
                  : null;
        if (next !== null) {
          event.preventDefault();
          onChange(next, true);
        }
      }}
    >
      <span
        className={cn(
          'h-full w-0.5 transition-colors',
          editorial
            ? 'group-hover:bg-[#45d6ec] group-focus-visible:bg-[#45d6ec]'
            : 'group-hover:bg-mainBlue group-focus-visible:bg-mainBlue',
          isDragging && (editorial ? 'bg-[#45d6ec]' : 'bg-mainBlue'),
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute top-28 h-10 w-1 rounded-full',
          editorial
            ? 'bg-white/35 group-hover:bg-[#45d6ec] group-focus-visible:bg-[#45d6ec]'
            : 'group-hover:bg-mainBlue group-focus-visible:bg-mainBlue bg-neutral-300',
        )}
      />
    </div>
  );
};
