/** 顶部导航 —— 含角色切换（前台/后台）、日夜间切换、唱片按钮 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { Vinyl } from './Vinyl';
import { AnchorLink } from './ui';
import { cx } from '../lib/utils';
import { getEffectiveTheme } from './ThemeManager';

const LINKS = [
  { href: '#overview', label: '概况' },
  { href: '#cards', label: '卡项' },
  { href: '#companions', label: '陪玩' },
  { href: '#top', label: '头牌' },
  { href: '#tarot', label: '榜单' },
  { href: '#about', label: '关于' },
];

export function Navbar() {
  const { db } = useStore();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getEffectiveTheme);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('hhqt_theme_pref', next);
    window.dispatchEvent(new Event('hhqt-theme'));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <nav aria-label="主导航" className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Link
          to="/home"
          className="focus-ring flex items-center gap-3"
          aria-label="返回首页"
        >
          {db.settings.logoUrl && (
            <img src={db.settings.logoUrl} alt="" className="h-9 w-9 rounded-sm border border-[var(--line)]" />
          )}
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-sm tracking-[0.2em] text-[var(--ink)]">
              {db.settings.title}
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[var(--muted)]">
              {db.settings.subtitle}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <AnchorLink
                id={l.href.slice(1)}
                className="focus-ring group relative py-1 text-[13px] tracking-[0.25em] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"
                />
              </AnchorLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
            className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:flex"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link
            to="/admin"
            aria-label="进入超级管理员后台"
            className={cx(
              'focus-ring hidden h-9 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-[11px] tracking-[0.2em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:flex'
            )}
          >
            <Settings size={13} />
            后台
          </Link>
          <Vinyl size={38} />
          <button
            type="button"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-[var(--line)] bg-[var(--bg)] lg:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <AnchorLink
                    id={l.href.slice(1)}
                    onNavigate={() => setOpen(false)}
                    className="focus-ring block rounded-sm px-3 py-2.5 text-sm tracking-[0.3em] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]"
                  >
                    {l.label}
                  </AnchorLink>
                </li>
              ))}
              <li className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-3">
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="focus-ring flex items-center gap-2 px-3 py-2 text-xs tracking-[0.25em] text-[var(--muted)]"
                >
                  <Settings size={13} /> 超级管理员后台
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="focus-ring flex items-center gap-2 px-3 py-2 text-xs tracking-[0.25em] text-[var(--muted)]"
                >
                  {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                  {theme === 'dark' ? '日间模式' : '夜间模式'}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
