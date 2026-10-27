/** 后台登录页 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, User } from 'lucide-react';
import { useStore } from '../../lib/store';
import { verifyLogin, setSession } from '../../lib/auth';
import { hashPassword, needsHashUpgrade } from '../../lib/utils';
import { PrimaryButton } from './controls';

export function LoginPage() {
  const { db, update } = useStore();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const acc = await verifyLogin(db.accounts, username, password);
    if (!acc) {
      setError('账号或密码错误，或该账号已被冻结');
      setBusy(false);
      return;
    }
    setSession({
      username: acc.username,
      role: acc.role,
      permissions: acc.permissions,
    });
    /* 旧格式密码（明文标记 / 无盐 SHA-256）首次登录后自动升级为 PBKDF2 加盐散列 */
    if (needsHashUpgrade(acc.passwordHash)) {
      const realHash = await hashPassword(password);
      update(
        (d) => {
          const a = d.accounts.find((x) => x.id === acc.id);
          if (a) a.passwordHash = realHash;
        },
        { module: '账号权限', action: '初始化', detail: `默认账号 ${acc.username} 密码已加密存储`, sensitive: true }
      );
    }
    update(
      (d) => {
        const a = d.accounts.find((x) => x.id === acc.id);
        if (a) a.lastLogin = new Date().toISOString();
      },
      { module: '账号权限', action: '登录', detail: `账号 ${acc.username} 登录后台`, sensitive: true }
    );
    nav('/admin');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-4">
      <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-30" />
      <div aria-hidden="true" className="absolute inset-y-0 left-[16%] hidden w-px bg-[var(--line)] lg:block" />
      <div aria-hidden="true" className="absolute inset-y-0 right-[16%] hidden w-px bg-[var(--line)] lg:block" />

      <div className="glass relative w-full max-w-md p-8 md:p-10">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-[var(--accent)] font-display text-lg text-[var(--accent)]">
            LE
          </span>
          <div>
            <h1 className="font-display text-xl tracking-[0.2em] text-[var(--ink)]">恨海情天 纯LE</h1>
            <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-[var(--muted)]">
              Super admin console
            </p>
          </div>
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs tracking-[0.25em] text-[var(--ink-soft)]">
          <ShieldAlert size={14} className="text-[var(--accent)]" />
          超级管理员专属后台 · 请登录
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="relative">
            <User size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="field-input !pl-9"
              placeholder="账号"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="password"
              className="field-input !pl-9"
              placeholder="密码"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-xs tracking-wider text-red-400">
              {error}
            </p>
          )}
          <PrimaryButton type="submit" className="w-full">
            {busy ? '验证中…' : '进入后台'}
          </PrimaryButton>
        </form>

        <div className="mt-8 border-t border-dashed border-[var(--line)] pt-5">
          <p className="text-[10px] leading-relaxed tracking-[0.2em] text-[var(--muted)]">
            仅限团内管理员登录 · 登录行为将记录于操作日志
          </p>
        </div>
      </div>
    </div>
  );
}
