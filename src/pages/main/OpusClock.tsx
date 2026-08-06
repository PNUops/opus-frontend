import { useEffect, useState } from 'react';

const TIME_ZONE = 'Asia/Seoul';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const OpusClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(
      () => {
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), 1000);
      },
      1000 - (Date.now() % 1000),
    );

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="opus-clock" aria-label="현재 한국 표준시">
      <time dateTime={now.toISOString()}>
        <span className="opus-clock__date">{dateFormatter.format(now)}</span>
        <span className="opus-clock__time-row">
          <span className="opus-clock__time">{timeFormatter.format(now)}</span>
          <span className="opus-clock__zone" aria-hidden="true">
            KST
          </span>
        </span>
      </time>
    </div>
  );
};

export default OpusClock;
