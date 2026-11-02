import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTargetOptions {
  targetId: number | null | undefined;
  enabled?: boolean;
  oncePerNavigation?: boolean;
}

/** 경로 이동과 패널 높이 전환이 끝난 뒤 대상 항목으로 스크롤한다. */
export const useScrollToTarget = <T extends HTMLElement>({
  targetId,
  enabled = true,
  oncePerNavigation = false,
}: ScrollToTargetOptions) => {
  const { key: navigationKey } = useLocation();
  const targetRef = useRef<T>(null);
  const scrolledKey = useRef<string | null>(null);
  const skipNextScrollRef = useRef(false);

  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    if (!enabled || targetId == null || (oncePerNavigation && scrolledKey.current === navigationKey)) return;

    let cancelled = false;
    const frame = requestAnimationFrame(async () => {
      await document.fonts.ready;
      if (cancelled) return;
      const target = targetRef.current;
      if (!target) return;

      const transitions =
        target.parentElement
          ?.getAnimations({ subtree: true })
          .filter(
            (animation) => animation instanceof CSSTransition && animation.transitionProperty === 'grid-template-rows',
          ) ?? [];
      await Promise.all(transitions.map((animation) => animation.finished.catch(() => undefined)));
      if (cancelled) return;

      scrolledKey.current = navigationKey;
      target.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [navigationKey, targetId, enabled, oncePerNavigation]);

  return {
    targetRef,
    skipNextScroll: () => {
      skipNextScrollRef.current = true;
    },
  };
};
