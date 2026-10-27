/** 现实北京时间（时/分/秒/毫秒），250ms 刷新 */
import { useEffect, useState } from 'react';

export interface BeijingTime {
  h: number; // 0-11
  m: number;
  s: number;
  ms: number;
  h24: number;
}

function readBeijing(): BeijingTime {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const h24 = get('hour');
  const d = new Date();
  return { h: h24 % 12, m: get('minute'), s: get('second'), ms: d.getMilliseconds(), h24 };
}

export function useBeijingNow(): BeijingTime {
  const [now, setNow] = useState<BeijingTime>(readBeijing);
  useEffect(() => {
    const t = window.setInterval(() => setNow(readBeijing()), 250);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

export function beijingHMS(): { h24: number; m: number; s: number } {
  const { h24, m, s } = readBeijing();
  return { h24, m, s };
}
