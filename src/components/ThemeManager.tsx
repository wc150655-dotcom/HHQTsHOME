/** 主题系统 —— 日/夜模式（访客偏好 > 后台默认）、强调色（暗色下自动提亮）、Favicon */
import { useEffect } from 'react';
import { useStore } from '../lib/store';

const PREF_KEY = 'hhqt_theme_pref';

export function getEffectiveTheme(): 'light' | 'dark' {
  const pref = localStorage.getItem(PREF_KEY);
  if (pref === 'light' || pref === 'dark') return pref;
  const saved = document.documentElement.dataset.theme as 'light' | 'dark' | undefined;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(143,106,43,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
function isLightColor(hex: string): boolean {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
/** 提亮颜色（暗色主题下强调色更醒目） */
function lighten(hex: string, amt: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const mix = (v: number) => Math.round(v + (255 - v) * amt);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function ThemeManager() {
  const { db } = useStore();
  const { themeMode, accent, faviconUrl } = db.settings;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const pref = localStorage.getItem(PREF_KEY);
      const dark =
        pref === 'dark' ||
        (pref !== 'light' && (themeMode === 'dark' || (themeMode === 'auto' && mq.matches)));
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';

      /* 强调色：暗色下自动提亮（青铜金在深夜更醒目） */
      const root = document.documentElement;
      const base = accent || '#8F6A2B';
      const eff = dark ? lighten(base, 0.4) : base;
      root.style.setProperty('--accent-base', base);
      root.style.setProperty('--accent', eff);
      root.style.setProperty('--accent-ink', isLightColor(eff) ? '#131112' : '#ffffff');
      root.style.setProperty('--accent-soft', hexToRgba(eff, 0.15));
    };
    apply();
    window.addEventListener('hhqt-theme', apply);
    window.addEventListener('storage', apply);
    if (themeMode === 'auto') mq.addEventListener('change', apply);
    return () => {
      window.removeEventListener('hhqt-theme', apply);
      window.removeEventListener('storage', apply);
      mq.removeEventListener('change', apply);
    };
  }, [themeMode, accent]);

  useEffect(() => {
    if (!faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}
