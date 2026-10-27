/** 圆点自定义光标 —— 大小适中，跟随带缓动，悬停交互元素时放大 */
import { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';

export function Cursor() {
  const { db } = useStore();
  const enabled = db.settings.effects.dotCursor;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    document.documentElement.classList.toggle('cursor-dot', enabled);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    if (!dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let dx = tx;
    let dy = ty;
    let rx = tx;
    let ry = ty;
    let hover = false;
    let down = false;
    let seen = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        dx = tx;
        dy = ty;
        rx = tx;
        ry = ty;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      const t = e.target as Element | null;
      hover = !!t?.closest?.('a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]');
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);
    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onEnter = () => {
      if (seen) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const loop = () => {
      dx += (tx - dx) * 0.32;
      dy += (ty - dy) * 0.32;
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      const s = down ? 0.7 : hover ? 1.9 : 1;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%) scale(${s})`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%) scale(${hover ? 1.6 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full border border-[var(--ink)] opacity-0 transition-[opacity] duration-300 [@media(pointer:fine)]:block"
        style={{ width: 34, height: 34, opacity: 0 }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full bg-[var(--ink)] opacity-0 transition-[opacity] duration-300 [@media(pointer:fine)]:block"
        style={{ width: 13, height: 13, opacity: 0, transition: 'opacity .3s ease' }}
      />
    </>
  );
}
