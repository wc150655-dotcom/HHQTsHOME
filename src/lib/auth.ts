/** 管理员会话（sessionStorage） */
import type { AdminAccount, PermissionKey } from './types';
import { verifyPassword } from './utils';

export interface Session {
  username: string;
  role: 'super' | 'sub';
  permissions: PermissionKey[];
}

const KEY = 'hhqt_admin_session';

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
export function setSession(s: Session): void {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}
export function clearSession(): void {
  sessionStorage.removeItem(KEY);
}

export function canPerm(session: Session | null, perm: PermissionKey): boolean {
  if (!session) return false;
  if (session.role === 'super') return true;
  return session.permissions.includes(perm);
}

/** 校验登录；返回账号信息，失败返回 null */
export async function verifyLogin(
  accounts: AdminAccount[],
  username: string,
  password: string
): Promise<AdminAccount | null> {
  const acc = accounts.find((a) => a.username === username.trim());
  if (!acc || acc.frozen) return null;
  const ok = await verifyPassword(acc.passwordHash, password);
  return ok ? acc : null;
}
