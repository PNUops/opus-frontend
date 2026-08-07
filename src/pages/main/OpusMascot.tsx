import { useEffect, useRef, useState } from 'react';

const OpusMascot = () => {
  const mascotRef = useRef<HTMLButtonElement | null>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerFrameRef = useRef<number | null>(null);
  const greetingFrameRef = useRef<number | null>(null);
  const greetingTimerRef = useRef<number | null>(null);
  const [isGreeting, setIsGreeting] = useState(false);

  const resetPointerPosition = () => {
    const mascot = mascotRef.current;
    if (!mascot) return;

    mascot.style.setProperty('--mascot-look-x', '0px');
    mascot.style.setProperty('--mascot-look-y', '0px');
    mascot.style.setProperty('--mascot-head-x', '0px');
    mascot.style.setProperty('--mascot-head-y', '0px');
    mascot.style.setProperty('--mascot-tilt-x', '0deg');
    mascot.style.setProperty('--mascot-tilt-y', '0deg');
  };

  const updatePointerPosition = () => {
    const mascot = mascotRef.current;
    const bounds = boundsRef.current;
    if (!mascot || !bounds) return;

    const eyeCenterX = bounds.left + bounds.width * (211 / 360);
    const eyeCenterY = bounds.top + bounds.height * (74 / 230);
    const deltaX = pointerRef.current.x - eyeCenterX;
    const deltaY = pointerRef.current.y - eyeCenterY;
    const distance = Math.hypot(deltaX, deltaY);
    const viewportDistance = Math.max(1, Math.hypot(window.innerWidth, window.innerHeight) * 0.42);
    const influence = Math.min(1, distance / viewportDistance);
    const directionX = distance === 0 ? 0 : deltaX / distance;
    const directionY = distance === 0 ? 0 : deltaY / distance;
    const lookX = directionX * influence * 4;
    const lookY = directionY * influence * 3;
    const horizontalPosition = Math.max(-1, Math.min(1, deltaX / window.innerWidth));
    const verticalPosition = Math.max(-1, Math.min(1, deltaY / window.innerHeight));

    mascot.style.setProperty('--mascot-look-x', `${lookX}px`);
    mascot.style.setProperty('--mascot-look-y', `${lookY}px`);
    mascot.style.setProperty('--mascot-head-x', `${lookX * 0.28}px`);
    mascot.style.setProperty('--mascot-head-y', `${lookY * 0.28}px`);
    mascot.style.setProperty('--mascot-tilt-x', `${verticalPosition * -0.8}deg`);
    mascot.style.setProperty('--mascot-tilt-y', `${horizontalPosition * 0.8}deg`);
  };

  const handleGreeting = () => {
    if (greetingFrameRef.current !== null) window.cancelAnimationFrame(greetingFrameRef.current);
    if (greetingTimerRef.current !== null) window.clearTimeout(greetingTimerRef.current);

    setIsGreeting(false);
    greetingFrameRef.current = window.requestAnimationFrame(() => {
      setIsGreeting(true);
      greetingTimerRef.current = window.setTimeout(() => setIsGreeting(false), 720);
    });
  };

  useEffect(() => {
    const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const canTrackPointer = () => hoverMedia.matches && !reducedMotionMedia.matches;
    const updateBounds = () => {
      boundsRef.current = mascotRef.current?.getBoundingClientRect() ?? null;
    };
    const handleGlobalPointerMove = (event: PointerEvent) => {
      if (!canTrackPointer()) return;

      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (pointerFrameRef.current !== null) return;

      pointerFrameRef.current = window.requestAnimationFrame(() => {
        updatePointerPosition();
        pointerFrameRef.current = null;
      });
    };
    const handleMotionPreferenceChange = () => {
      updateBounds();
      if (!canTrackPointer()) resetPointerPosition();
    };

    updateBounds();
    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, { passive: true });
    window.addEventListener('blur', resetPointerPosition);
    hoverMedia.addEventListener('change', handleMotionPreferenceChange);
    reducedMotionMedia.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
      window.removeEventListener('blur', resetPointerPosition);
      hoverMedia.removeEventListener('change', handleMotionPreferenceChange);
      reducedMotionMedia.removeEventListener('change', handleMotionPreferenceChange);
      if (pointerFrameRef.current !== null) window.cancelAnimationFrame(pointerFrameRef.current);
      if (greetingFrameRef.current !== null) window.cancelAnimationFrame(greetingFrameRef.current);
      if (greetingTimerRef.current !== null) window.clearTimeout(greetingTimerRef.current);
    };
  }, []);

  return (
    <button
      ref={mascotRef}
      type="button"
      className={`opus-mascot ${isGreeting ? 'is-greeting' : ''}`}
      aria-label="OPUS 마스코트에게 인사하기"
      onClick={handleGreeting}
    >
      <span className="opus-mascot__entrance" aria-hidden="true">
        <span className="opus-mascot__idle">
          <svg className="opus-mascot__svg" viewBox="0 0 360 230" focusable="false">
            <defs>
              <radialGradient id="opus-glass-head" cx="33%" cy="20%" r="82%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="37%" stopColor="#d8f4ff" stopOpacity="0.72" />
                <stop offset="76%" stopColor="#83c9ff" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#1787e8" stopOpacity="0.22" />
              </radialGradient>
              <linearGradient id="opus-glass-body" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
                <stop offset="48%" stopColor="#b9e8ff" stopOpacity="0.46" />
                <stop offset="100%" stopColor="#3f9cf1" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="opus-laptop-screen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eaf8ff" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#6daef0" stopOpacity="0.76" />
              </linearGradient>
              <filter id="opus-glass-shadow" x="-30%" y="-30%" width="160%" height="170%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#001228" floodOpacity="0.38" />
              </filter>
            </defs>

            <g className="opus-mascot__scene">
              <ellipse cx="214" cy="207" rx="116" ry="9" fill="#001126" opacity="0.42" />

              <g className="opus-mascot__blocks" filter="url(#opus-glass-shadow)">
                <rect x="296" y="126" width="36" height="66" rx="5" fill="#187df2" stroke="#9bdcff" />
                <rect x="326" y="153" width="27" height="39" rx="4" fill="#b9dc17" stroke="#efff8e" />
                <path d="M302 134h24" stroke="#ffffff" strokeOpacity="0.48" strokeLinecap="round" />
              </g>

              <g className="opus-mascot__character" filter="url(#opus-glass-shadow)">
                <path
                  d="M192 109c-22 11-32 35-28 68 3 23 20 34 47 34s45-11 48-34c4-33-6-57-29-68z"
                  fill="url(#opus-glass-body)"
                  stroke="#dff6ff"
                  strokeWidth="2"
                />
                <path
                  d="M183 139c-16 7-27 21-28 40"
                  fill="none"
                  stroke="#c6ecff"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  className="opus-mascot__arm"
                  d="M240 138c14 7 23 18 25 34"
                  fill="none"
                  stroke="#bde8ff"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M183 123c13 6 43 6 57 0"
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.42"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <g className="opus-mascot__head">
                  <circle cx="211" cy="71" r="50" fill="url(#opus-glass-head)" stroke="#eafaff" strokeWidth="2.25" />
                  <path
                    d="M181 42c13-18 36-24 54-13"
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.76"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M245 53c7 21 0 45-17 56"
                    fill="none"
                    stroke="#43b7ff"
                    strokeOpacity="0.24"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <g className="opus-mascot__eyes">
                    <g className="opus-mascot__blink">
                      <ellipse cx="198" cy="74" rx="3.6" ry="5.2" fill="#06172f" />
                      <ellipse cx="224" cy="74" rx="3.6" ry="5.2" fill="#06172f" />
                    </g>
                  </g>
                </g>
              </g>

              <g className="opus-mascot__laptop" filter="url(#opus-glass-shadow)">
                <path
                  d="M51 124h116l14 66H68z"
                  fill="url(#opus-laptop-screen)"
                  stroke="#dff6ff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="119" cy="158" r="9" fill="#ffffff" fillOpacity="0.46" stroke="#dff6ff" />
                <path d="M68 190h126l-10 9H77z" fill="#8bc9f7" stroke="#dcf7ff" strokeLinejoin="round" />
                <path
                  className="opus-mascot__screen-glow"
                  d="M64 132h89"
                  stroke="#ffffff"
                  strokeOpacity="0.48"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              <g className="opus-mascot__confetti">
                <circle cx="276" cy="74" r="4" fill="#43d8ee" />
                <circle cx="291" cy="89" r="3.5" fill="#bedb24" />
                <circle cx="277" cy="103" r="3" fill="#ff7167" />
              </g>
            </g>
          </svg>
        </span>
      </span>
    </button>
  );
};

export default OpusMascot;
