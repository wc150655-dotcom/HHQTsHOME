/** 超级管理员后台 · 入口（登录守卫 + 布局 + 子路由） */
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Eye,
  FileText,
  Image,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Mic,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  Sparkle,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { getSession, clearSession, canPerm, type Session } from '../../lib/auth';
import { useStore } from '../../lib/store';
import type { PermissionKey } from '../../lib/types';
import { cx } from '../../lib/utils';
import { LoginPage } from './LoginPage';
import { Dashboard } from './Dashboard';
import { SiteSettingsPage } from './SiteSettingsPage';
import { OpeningAdminPage } from './OpeningAdminPage';
import { OptionsAdminPage } from './OptionsAdminPage';
import { TeamAdminPage } from './TeamAdminPage';
import { CardsAdminPage } from './CardsAdminPage';
import { CompanionsAdminPage } from './CompanionsAdminPage';
import { TopAdminPage } from './TopAdminPage';
import { TarotAdminPage } from './TarotAdminPage';
import { FooterAdminPage } from './FooterAdminPage';
import { AssetsPage } from './AssetsPage';
import { AccountsPage } from './AccountsPage';
import { LogsPage } from './LogsPage';

interface ModuleDef {
  key: PermissionKey | 'dashboard';
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
}
const MODULES: ModuleDef[] = [
  { key: 'dashboard', path: '', label: '总览', icon: LayoutDashboard },
  { key: 'site', path: 'site', label: '站点设置', icon: SlidersHorizontal },
  { key: 'opening', path: 'opening', label: '开场页', icon: Sparkles },
  { key: 'options', path: 'options', label: '选项库', icon: Library },
  { key: 'team', path: 'team', label: '团队概况', icon: Users },
  { key: 'cards', path: 'cards', label: '卡项管理', icon: CreditCard },
  { key: 'companions', path: 'companions', label: '陪玩管理', icon: Mic },
  { key: 'top', path: 'top', label: '头牌管理', icon: Trophy },
  { key: 'tarot', path: 'tarot', label: '塔罗榜单', icon: Sparkle },
  { key: 'footer', path: 'footer', label: '页脚台账', icon: FileText },
  { key: 'assets', path: 'assets', label: '素材库', icon: Image },
  { key: 'accounts', path: 'accounts', label: '账号权限', icon: KeyRound },
  { key: 'logs', path: 'logs', label: '操作日志', icon: ScrollText },
];

function AdminLayout() {
  const nav = useNavigate();
  const { db, storageWarning } = useStore();
  const [session] = useState<Session | null>(getSession);
  const [open, setOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const firstRender = useRef(true);

  /* 数据变化提示：已自动保存 · 前后台实时同步 */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSavedAt(Date.now());
    const t = window.setTimeout(() => setSavedAt(null), 2600);
    return () => window.clearTimeout(t);
  }, [db]);

  if (!session) return <Navigate to="/admin/login" replace />;

  const visible = MODULES.filter(
    (m) => m.key === 'dashboard' || canPerm(session, m.key as PermissionKey)
  );

  const logout = () => {
    clearSession();
    nav('/admin/login');
  };

  const sidebar = (
    <nav aria-label="后台模块导航" className="flex h-full flex-col">
      <Link to="/admin" className="focus-ring flex items-center gap-3 border-b border-[var(--line)] px-5 py-5">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--accent)] font-display text-sm text-[var(--accent)]">
          LE
        </span>
        <span className="leading-tight">
          <span className="block text-sm tracking-[0.2em] text-[var(--ink)]">恨海情天</span>
          <span className="block text-[9px] uppercase tracking-[0.35em] text-[var(--muted)]">
            Admin console
          </span>
        </span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[9px] uppercase tracking-[0.4em] text-[var(--muted)]">
          Modules · 模块
        </p>
        <ul className="space-y-1">
          {visible.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.path}>
                <NavLink
                  to={m.path}
                  end={m.path === ''}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      'focus-ring flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-[13px] tracking-wider transition-colors',
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--ink-soft)] hover:bg-[var(--line)] hover:text-[var(--ink)]'
                    )
                  }
                >
                  <Icon size={15} />
                  {m.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t border-[var(--line)] p-3">
        <div className="flex items-center gap-3 rounded-[5px] px-3 py-2.5">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-xs font-semibold text-[var(--ink)]">
            {session.username.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs tracking-wider text-[var(--ink)]">
              {session.username}
            </span>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-[var(--muted)]">
              {session.role === 'super' ? 'Super admin' : 'Sub admin'}
            </span>
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="退出登录"
            className="focus-ring text-[var(--muted)] hover:text-[var(--accent)]"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* 桌面侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-[var(--line)] bg-[var(--panel)] backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* 移动侧栏 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-[var(--line)] bg-[var(--bg)] shadow-2xl">
            <button
              type="button"
              aria-label="关闭导航"
              onClick={() => setOpen(false)}
              className="focus-ring absolute right-3 top-4 text-[var(--muted)]"
            >
              <X size={16} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:pl-60">
        {/* 顶栏 */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/85 px-4 backdrop-blur-xl md:px-6">
          <button
            type="button"
            aria-label="打开导航"
            onClick={() => setOpen(true)}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--ink)] lg:hidden"
          >
            <Menu size={15} />
          </button>
          <p className="hidden text-[10px] uppercase tracking-[0.4em] text-[var(--muted)] lg:block">
            HENHAI QINGTIAN · MANAGEMENT
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/home"
              className="focus-ring flex items-center gap-2 rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-[11px] tracking-[0.25em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Eye size={13} />
              查看前台
            </Link>
            {session.role === 'super' && (
              <span className="hidden items-center gap-1.5 rounded-[4px] border border-[var(--accent)] px-3 py-1.5 text-[11px] tracking-[0.25em] text-[var(--accent)] md:flex">
                <ShieldAlert size={13} />
                超级管理员
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="site" element={<SiteSettingsPage />} />
            <Route path="opening" element={<OpeningAdminPage />} />
            <Route path="options" element={<OptionsAdminPage />} />
            <Route path="team" element={<TeamAdminPage />} />
            <Route path="cards" element={<CardsAdminPage />} />
            <Route path="companions" element={<CompanionsAdminPage />} />
            <Route path="top" element={<TopAdminPage />} />
            <Route path="tarot" element={<TarotAdminPage />} />
            <Route path="footer" element={<FooterAdminPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {/* 自动保存提示 */}
        {savedAt !== null && (
          <div
            role="status"
            aria-live="polite"
            className="glass pointer-events-none fixed bottom-5 right-5 z-[90] px-4 py-2.5 text-xs tracking-[0.2em] text-[var(--accent)]"
          >
            ✓ 已自动保存 · 前后台实时同步
          </div>
        )}

        {/* 存储失败警告 */}
        {storageWarning && (
          <div
            role="alert"
            className="fixed right-5 top-16 z-[95] max-w-sm rounded-[6px] border border-red-400/70 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400 backdrop-blur-md"
          >
            ⚠ {storageWarning}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminApp() {
  const session = getSession();
  return (
    <Routes>
      <Route path="login" element={session ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="*" element={session ? <AdminLayout /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
