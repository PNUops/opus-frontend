import { useEffect, useRef, useState } from 'react';
import { Heart, LayoutGrid, Trophy, Users, type LucideIcon } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { getMainStats } from '@apis/statistics';
import { type MainStatsDto } from '@dto/statisticsDto';

const STATS_REFRESH_INTERVAL = 10 * 60 * 1000;

type MetricKey = keyof MainStatsDto;
type MetricAccent = 'blue' | 'cyan' | 'coral' | 'lime';

interface MetricDefinition {
  key: MetricKey;
  eyebrow: 'CONTESTS' | 'PROJECTS' | 'REACTIONS' | 'COMMUNITY';
  label: string;
  unit: '개' | '명';
  focus: (value: string) => string;
  accent: MetricAccent;
  icon: LucideIcon;
}

const METRICS: MetricDefinition[] = [
  {
    key: 'totalContests',
    eyebrow: 'CONTESTS',
    label: '함께한 대회',
    unit: '개',
    focus: (value) => `${value}번의 도전이 OPUS에서 시작되었습니다.`,
    accent: 'blue',
    icon: Trophy,
  },
  {
    key: 'totalProjects',
    eyebrow: 'PROJECTS',
    label: '완성된 프로젝트',
    unit: '개',
    focus: (value) => `${value}개의 아이디어가 완성된 결과로 이어졌습니다.`,
    accent: 'cyan',
    icon: LayoutGrid,
  },
  {
    key: 'totalLikes',
    eyebrow: 'REACTIONS',
    label: '보낸 응원',
    unit: '개',
    focus: (value) => `${value}번의 응원이 동료의 프로젝트에 닿았습니다.`,
    accent: 'coral',
    icon: Heart,
  },
  {
    key: 'totalMembers',
    eyebrow: 'COMMUNITY',
    label: '함께하는 구성원',
    unit: '명',
    focus: (value) => `${value}명이 OPUS를 함께 만들고 있습니다.`,
    accent: 'lime',
    icon: Users,
  },
];

const formatNumber = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

const useAnimatedNumber = (target: number) => {
  const [displayValue, setDisplayValue] = useState(target);
  const currentValueRef = useRef(target);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentValueRef.current = target;
      setDisplayValue(target);
      return;
    }

    const startedAt = performance.now();
    const startValue = currentValueRef.current;
    const difference = target - startValue;
    let animationFrame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 420, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + difference * easedProgress);
      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [target]);

  return displayValue;
};

const MetricButton = ({
  metric,
  value,
  index,
  isActive,
  isCurrent,
  onPreview,
  onPreviewEnd,
  onSelect,
}: {
  metric: MetricDefinition;
  value: number;
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  onPreview: () => void;
  onPreviewEnd: () => void;
  onSelect: () => void;
}) => {
  const Icon = metric.icon;

  return (
    <button
      type="button"
      className="opus-live-metric"
      data-metric={metric.key}
      data-accent={metric.accent}
      data-active={isActive}
      data-current={isCurrent}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreview}
      onBlur={onPreviewEnd}
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`${metric.eyebrow}, ${formatNumber(value)}${metric.unit} ${metric.label}${isActive ? ', 선택됨' : ''}`}
    >
      <span className="opus-live-metric__index">{String(index + 1).padStart(2, '0')}</span>
      <span className="opus-live-metric__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="opus-live-metric__content">
        <span className="opus-live-metric__eyebrow">{metric.eyebrow}</span>
        <strong>
          {formatNumber(value)} <small>{metric.unit}</small>
        </strong>
        <span>{metric.label}</span>
      </span>
    </button>
  );
};

const ActiveMetric = ({ metric, value }: { metric: MetricDefinition; value: number }) => {
  const Icon = metric.icon;
  const animatedValue = useAnimatedNumber(value);

  return (
    <div className="opus-live-active" data-accent={metric.accent} aria-live="polite" aria-atomic="true">
      <span className="opus-live-active__orbit" aria-hidden="true" />
      <span className="opus-live-active__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="opus-live-active__eyebrow">{metric.eyebrow}</span>
      <strong>
        {formatNumber(animatedValue)} <small>{metric.unit}</small>
      </strong>
      <span className="opus-live-active__label">{metric.label}</span>
    </div>
  );
};

const MetricConnectors = ({ currentKey }: { currentKey: MetricKey }) => (
  <svg className="opus-live-connectors" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
    <path
      data-metric="totalContests"
      data-current={currentKey === 'totalContests'}
      d="M 205 130 C 330 130 350 220 420 245"
    />
    <path
      data-metric="totalProjects"
      data-current={currentKey === 'totalProjects'}
      d="M 205 430 C 330 430 350 340 420 315"
    />
    <path data-metric="totalLikes" data-current={currentKey === 'totalLikes'} d="M 795 130 C 670 130 650 220 580 245" />
    <path
      data-metric="totalMembers"
      data-current={currentKey === 'totalMembers'}
      d="M 795 430 C 670 430 650 340 580 315"
    />
  </svg>
);

const LiveIndexView = () => {
  const [activeKey, setActiveKey] = useState<MetricKey>('totalLikes');
  const [previewKey, setPreviewKey] = useState<MetricKey | null>(null);
  const { data } = useSuspenseQuery({
    queryKey: ['mainStats'],
    queryFn: getMainStats,
    staleTime: STATS_REFRESH_INTERVAL,
    refetchInterval: STATS_REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
  });

  const currentKey = previewKey ?? activeKey;
  const currentMetric = METRICS.find((metric) => metric.key === currentKey) ?? METRICS[2];
  const currentValue = data[currentMetric.key];

  return (
    <div className="opus-live-index">
      <header className="opus-live-index__header">
        <p>LIVE INDEX</p>
        <div>
          <h1>숫자로 보는 OPUS</h1>
          <p>도전하고, 완성하고, 서로를 응원하는 순간이 지금도 계속 쌓이고 있어요!</p>
        </div>
        <span>숫자는 10분마다 업데이트 됩니다</span>
      </header>

      <div className="opus-live-stage" data-current={currentMetric.accent}>
        <MetricConnectors currentKey={currentKey} />

        {METRICS.map((metric, index) => (
          <MetricButton
            key={metric.key}
            metric={metric}
            value={data[metric.key]}
            index={index}
            isActive={activeKey === metric.key}
            isCurrent={currentKey === metric.key}
            onPreview={() => setPreviewKey(metric.key)}
            onPreviewEnd={() => setPreviewKey(null)}
            onSelect={() => {
              setActiveKey(metric.key);
              setPreviewKey(null);
            }}
          />
        ))}

        <ActiveMetric metric={currentMetric} value={currentValue} />
      </div>

      <div className="opus-live-focus" data-accent={currentMetric.accent} aria-live="polite" aria-atomic="true">
        <span>FOCUS {String(METRICS.findIndex((metric) => metric.key === currentKey) + 1).padStart(2, '0')}</span>
        <p>{currentMetric.focus(formatNumber(currentValue))}</p>
      </div>
    </div>
  );
};

export const LiveIndexSkeleton = () => (
  <div className="opus-live-index opus-live-index--loading" aria-label="OPUS 통계를 불러오는 중" aria-busy="true">
    <header className="opus-live-index__header">
      <p>LIVE INDEX</p>
      <div>
        <h1>숫자로 보는 OPUS</h1>
        <p>OPUS에 쌓인 기록을 불러오고 있습니다.</p>
      </div>
    </header>
    <div className="opus-live-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <strong />
    </div>
  </div>
);

export const LiveIndexError = ({ resetErrorBoundary }: FallbackProps) => (
  <div className="opus-live-index opus-live-index--error" role="alert">
    <p>LIVE INDEX</p>
    <h1>OPUS의 기록을 불러오지 못했습니다.</h1>
    <button type="button" onClick={resetErrorBoundary}>
      다시 불러오기 ↗
    </button>
  </div>
);

export default LiveIndexView;
