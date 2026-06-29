type ScrollToElementByHashOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  intervalMs?: number;
  timeoutMs?: number;
};

export const scrollToElementByHash = (
  hash: string,
  { behavior = 'auto', block = 'start', intervalMs = 100, timeoutMs = 5000 }: ScrollToElementByHashOptions = {},
) => {
  const targetId = decodeURIComponent(hash.replace(/^#/, ''));
  if (!targetId) {
    return;
  }

  let timeoutId: number | undefined;
  const startedAt = Date.now();

  const scrollToTarget = () => {
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ block, behavior });
      return;
    }

    if (Date.now() - startedAt < timeoutMs) {
      timeoutId = window.setTimeout(scrollToTarget, intervalMs);
    }
  };

  timeoutId = window.setTimeout(scrollToTarget, 0);

  return () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
};
