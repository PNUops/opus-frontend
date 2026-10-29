import { useCallback, useEffect, useState } from 'react';

export const SIDEBAR_WIDTH = { default: 280, min: 240, max: 400, desktop: 1280, contentMin: 960 } as const;
export const SIDEBAR_WIDTH_KEY = 'opus:contest-sidebar-width';

export const parseSidebarWidth = (stored: string | null): number => {
  try {
    const value: unknown = JSON.parse(stored ?? 'null');
    return typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= SIDEBAR_WIDTH.min &&
      value <= SIDEBAR_WIDTH.max
      ? Math.round(value)
      : SIDEBAR_WIDTH.default;
  } catch {
    return SIDEBAR_WIDTH.default;
  }
};

export const sidebarMaxWidth = (viewport: number) =>
  Math.max(SIDEBAR_WIDTH.min, Math.min(SIDEBAR_WIDTH.max, viewport - SIDEBAR_WIDTH.contentMin));

const readWidth = () => {
  try {
    return parseSidebarWidth(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  } catch {
    return SIDEBAR_WIDTH.default;
  }
};

export const useSidebarWidth = () => {
  const [preferredWidth, setPreferredWidth] = useState(readWidth);
  const [viewport, setViewport] = useState(() => window.innerWidth);
  const maxWidth = sidebarMaxWidth(viewport);
  const width = Math.min(preferredWidth, maxWidth);

  useEffect(() => {
    const resize = () => setViewport(window.innerWidth);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const setWidth = useCallback((next: number, persist = false) => {
    const value = Math.round(Math.max(SIDEBAR_WIDTH.min, Math.min(next, sidebarMaxWidth(window.innerWidth))));
    setPreferredWidth(value);
    if (persist) {
      try {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, JSON.stringify(value));
      } catch {
        // 저장소를 사용할 수 없어도 현재 화면의 너비 조절은 유지합니다.
      }
    }
  }, []);

  const reset = useCallback(() => {
    setPreferredWidth(SIDEBAR_WIDTH.default);
    try {
      localStorage.removeItem(SIDEBAR_WIDTH_KEY);
    } catch {
      // 저장소 접근 실패가 기본값 복원을 막지 않도록 합니다.
    }
  }, []);

  return { width, maxWidth, isDesktop: viewport >= SIDEBAR_WIDTH.desktop, setWidth, reset };
};
