import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';
import Sidebar from '@layout/Sidebar';
import { useSidebar } from '@layout/SidebarContext';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@components/ui/sheet';
import { cn } from '@utils/classname';
import { useSidebarWidth } from './hooks/useSidebarWidth';
import { SidebarResizeHandle } from './SidebarResizeHandle';

const SidebarLayout = () => {
  const { isOpen, close, triggerRef } = useSidebar();
  const location = useLocation();
  const { width, maxWidth, isDesktop, setWidth, reset } = useSidebarWidth();
  const desktopRef = useRef<HTMLDivElement>(null);
  const isHomeRoute = location.pathname === '/';
  const tone = isHomeRoute ? 'editorial' : 'default';

  useEffect(() => close(), [location.key, close]);
  useEffect(() => {
    if (isDesktop) close();
  }, [isDesktop, close]);

  return (
    <div className="flex w-full justify-center">
      {isDesktop ? (
        <aside
          className={cn(
            'relative shrink-0 border-r',
            isHomeRoute ? 'border-white/35 bg-[#06172f]' : 'border-lightGray bg-white',
          )}
          style={{ width }}
        >
          <div
            id="desktop-contest-navigation"
            ref={desktopRef}
            className="sticky top-0 h-[calc(100dvh-var(--spacing-header))]"
          >
            <Sidebar
              tone={tone}
              footer={
                <button
                  type="button"
                  onClick={reset}
                  aria-label="사이드바 너비 기본값 복원"
                  className={cn(
                    'flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-2',
                    isHomeRoute
                      ? 'text-white/65 hover:bg-white/5 focus-visible:outline-[#45d6ec]'
                      : 'hover:bg-whiteGray focus-visible:outline-mainBlue text-neutral-600',
                  )}
                >
                  <RotateCcw size={14} aria-hidden /> 기본 너비로{' '}
                  <span className="ml-auto tabular-nums">{width}px</span>
                </button>
              }
            />
            <SidebarResizeHandle
              width={width}
              maxWidth={maxWidth}
              onChange={setWidth}
              onReset={reset}
              editorial={isHomeRoute}
            />
          </div>
        </aside>
      ) : (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
          <SheetContent
            id="contest-navigation-drawer"
            side="left"
            className={cn(
              'h-dvh w-[min(360px,calc(100vw-32px))] gap-0 border-0 motion-reduce:animate-none',
              isHomeRoute ? 'bg-[#06172f] text-white' : 'bg-white',
            )}
            onEscapeKeyDown={(event) => {
              // 포털 안의 정렬 설정을 먼저 닫고 대회 목록은 유지합니다.
              if (event.target instanceof Element && event.target.closest('[data-sidebar-sort-settings]')) {
                event.preventDefault();
              }
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (triggerRef.current?.offsetParent) triggerRef.current.focus();
              else desktopRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
            }}
          >
            <div className="flex shrink-0 items-center justify-between px-5 pt-3 pb-2">
              <SheetTitle className={cn('text-base font-medium', isHomeRoute && 'text-white')}>대회 목록</SheetTitle>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="대회 목록 닫기"
                  className={cn(
                    'flex size-11 items-center justify-center rounded-md focus-visible:outline-2',
                    isHomeRoute
                      ? 'hover:bg-white/10 focus-visible:outline-[#45d6ec]'
                      : 'hover:bg-whiteGray focus-visible:outline-mainBlue',
                  )}
                >
                  <X size={20} aria-hidden />
                </button>
              </SheetClose>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar variant="mobile" tone={tone} onNavigate={close} />
            </div>
          </SheetContent>
        </Sheet>
      )}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
