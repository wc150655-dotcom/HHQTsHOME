/** 鼠标 / 手机陀螺仪动捕 —— 页面 UI 轻微晃动 */
import { useEffect, useState } from 'react';
import { clamp } from '../lib/utils';

export interface ParallaxOffset {
  x: number; // -1 .. 1
  y: number; // -1 .. 1
}

export function useParallax(enabled: boolean): ParallaxOffset {
  const [off, setOff] = useState<ParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setOff({ x: 0, y: 0 });
      return;
    }
    let target: ParallaxOffset = { x: 0, y: 0 };
    let raf = 0;
    let current = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      target = {
        x: clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1),
        y: clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1),
      };
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      target = { x: clamp(e.gamma / 25, -1, 1), y: clamp(e.beta / 25, -1, 1) };
    };

    const loop = () => {
      current = {
        x: current.x + (target.x - current.x) * 0.08,
        y: current.y + (target.y - current.y) * 0.08,
      };
      setOff({ x: current.x, y: current.y });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [enabled]);

  return off;
}

/** 在 iOS Safari 上请求陀螺仪权限（需用户手势触发） */
export function requestTiltPermission(): void {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  if (typeof DOE.requestPermission === 'function') {
    DOE.requestPermission()
      .then((r) => {
        if (r !== 'granted') console.info('[hhqt] 陀螺仪权限未授予');
      })
      .catch(() => undefined);
  }
}
