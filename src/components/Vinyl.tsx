/** 圆形唱片按钮 —— 播放时唱片旋转；单击切换播放/暂停，双击随机切歌 */
import { useEffect, useRef, useState } from 'react';
import { audio, type MusicState } from '../lib/audio';
import { cx } from '../lib/utils';

/** 单击 / 双击区分：单击延迟触发，双击优先 */
export function useClickDouble(single: () => void, double: () => void) {
  const timer = useRef<number | null>(null);
  return {
    onClick: () => {
      if (timer.current !== null) return;
      timer.current = window.setTimeout(() => {
        timer.current = null;
        single();
      }, 240);
    },
    onDoubleClick: () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      double();
    },
  };
}

export function Vinyl({
  size = 46,
  className,
  showHint = false,
}: {
  size?: number;
  className?: string;
  showHint?: boolean;
}) {
  const [st, setSt] = useState<MusicState>({ playing: false, track: null });
  useEffect(() => audio.subscribe(setSt), []);
  const clicks = useClickDouble(() => audio.toggle(), () => audio.next());

  return (
    <div className={cx('flex items-center gap-3', className)}>
      <button
        type="button"
        role="button"
        aria-label={st.playing ? '暂停背景音乐' : '播放背景音乐'}
        aria-pressed={st.playing}
        title="单击：播放 / 暂停 · 双击：随机切歌"
        onClick={clicks.onClick}
        onDoubleClick={clicks.onDoubleClick}
        className="focus-ring vinyl-btn relative shrink-0 rounded-full border border-[var(--line)] shadow-[0_10px_30px_-12px_var(--glow)] transition-transform hover:scale-105 active:scale-95"
        style={{ width: size, height: size }}
      >
        {/* 唱片本体 */}
        <span
          aria-hidden="true"
          className="vinyl-disc absolute inset-0 rounded-full"
          style={{ animationPlayState: st.playing ? 'running' : 'paused' }}
        />
        {/* 中心标签 */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]"
          style={{ width: size * 0.3, height: size * 0.3 }}
        >
          <span style={{ fontSize: size * 0.14 }} className="font-semibold">
            LE
          </span>
        </span>
      </button>
      {showHint && (
        <div className="hidden flex-col lg:flex">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
            {st.playing ? 'Now Playing' : 'BGM Paused'}
          </span>
          <span className="mt-0.5 max-w-[10rem] truncate text-xs text-[var(--ink-soft)]">
            {st.track?.name ?? '暂无曲目'}
          </span>
        </div>
      )}
    </div>
  );
}
