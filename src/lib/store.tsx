/**
 * 全局数据库（localStorage 持久化）——
 * 前端所有展示内容、后台所有管理内容，全部读写这里。
 * 后台每次修改自动写入操作日志（敏感操作永久留痕）。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DB, LogEntry } from './types';
import { buildDefaultDB } from './defaultData';
import { majorArcanaPlaceholder } from './assets';
import { uid, nowISO } from './utils';

const DB_KEY = 'hhqt_db_v3';
export const LOG_LIMIT = 500;

function deepMerge<T>(def: T, obj: unknown): T {
  if (obj === null || obj === undefined) return def;
  if (Array.isArray(def)) {
    return (Array.isArray(obj) ? obj : def) as T;
  }
  if (typeof def === 'object') {
    const out: Record<string, unknown> = { ...(def as Record<string, unknown>) };
    const o = obj as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      if (k in out && typeof out[k] === 'object' && out[k] !== null) {
        out[k] = deepMerge(out[k], o[k]);
      } else if (o[k] !== undefined) {
        out[k] = o[k];
      }
    }
    return out as T;
  }
  return (obj as T) ?? def;
}

/**
 * 一次性审美升级（v3 → v4，希腊众神神话视觉体系）：
 * 仅替换「仍是旧版默认素材 / 旧默认强调色」的字段，用户自定义内容不受影响。
 */
function migrateToV4(db: DB): DB {
  if (db.version >= 4) return db;
  const def = buildDefaultDB();
  const has = (s: string | undefined | null, m: string) => !!s && s.includes(m);

  if (db.settings.accent === '#9C3A3A') db.settings.accent = def.settings.accent;
  if (has(db.settings.logoUrl, 'r="44"')) db.settings.logoUrl = def.settings.logoUrl;
  if (has(db.settings.heroUrl, 'EST. 2026')) db.settings.heroUrl = def.settings.heroUrl;

  const swapImgs = <T extends { imageUrl: string }>(list: T[], defList: T[]) =>
    list.forEach((c, i) => {
      if (has(c.imageUrl, 'HENHAI · LE') && defList[i]) c.imageUrl = defList[i].imageUrl;
    });
  swapImgs(db.cards.crown, def.cards.crown);
  swapImgs(db.cards.packages, def.cards.packages);
  db.cards.vip.forEach((c, i) => {
    if (has(c.badgeUrl, 'viewBox="0 0 240 240"') && def.cards.vip[i]) c.badgeUrl = def.cards.vip[i].badgeUrl;
  });

  if (db.options.avatarPresets.some((u) => has(u, 'viewBox="0 0 400 400"'))) {
    db.options.avatarPresets = [...def.options.avatarPresets];
  }
  db.top.forEach((t) => {
    if (has(t.avatarUrl, 'viewBox="0 0 400 400"')) {
      const idx = Math.max(0, Math.min(db.options.avatarPresets.length - 1, 3 - t.rank));
      t.avatarUrl = db.options.avatarPresets[idx];
    }
  });

  db.tarot.forEach((s) => {
    if (!s.configured) {
      if (has(s.majorUrl, 'ARCANUM')) s.majorUrl = majorArcanaPlaceholder;
      s.minors.forEach((m, i) => {
        if (m.meaning.includes('（后台可配置这张小牌的图文与释义）') && def.tarot[0]?.minors[i]) {
          m.imageUrl = def.tarot[0].minors[i].imageUrl;
        }
      });
    }
  });

  db.assets.forEach((a) => {
    if (has(a.url, 'r="44"')) a.url = def.settings.logoUrl;
    else if (has(a.url, 'EST. 2026')) a.url = def.settings.heroUrl;
  });

  db.version = 4;
  return db;
}

/** 解析 + 迁移（load 与跨标签页同步共用） */
function parseWithMigration(raw: string): DB {
  const parsed = JSON.parse(raw) as DB;
  return migrateToV4(deepMerge(buildDefaultDB(), parsed));
}

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return parseWithMigration(raw);
  } catch {
    /* 数据损坏时回退默认 */
  }
  const def = buildDefaultDB();
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(def));
  } catch {
    /* 私密模式等场景忽略 */
  }
  return def;
}

export interface LogMeta {
  module: string;
  action: string;
  detail: string;
  sensitive?: boolean;
}

interface StoreValue {
  db: DB;
  /** 修改数据库；log 可省略（前台行为不记日志） */
  update: (fn: (draft: DB) => void, log?: LogMeta) => void;
  /** 整体替换（导入 / 重置） */
  replace: (next: DB) => void;
  /** 追加日志 */
  addLog: (log: Omit<LogEntry, 'id' | 'time'>) => void;
  /** 本地存储写入失败时的警告文案（容量不足等） */
  storageWarning: string | null;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const lastPersisted = useRef<string>('');

  const update = useCallback((fn: (draft: DB) => void, log?: LogMeta) => {
    setDb((prev) => {
      const next = structuredClone(prev);
      fn(next);
      if (log) {
        let user = 'anonymous';
        try {
          const raw = sessionStorage.getItem('hhqt_admin_session');
          if (raw) {
            const s = JSON.parse(raw) as { username?: string };
            if (s?.username) user = s.username;
          }
        } catch {
          /* keep anonymous */
        }
        const entry: LogEntry = {
          id: uid(),
          time: nowISO(),
          user,
          module: log.module,
          action: log.action,
          detail: log.detail,
          sensitive: !!log.sensitive,
        };
        next.logs = [entry, ...next.logs].slice(0, LOG_LIMIT);
      }
      return next;
    });
  }, []);

  const replace = useCallback((next: DB) => {
    setDb(next);
  }, []);

  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'time'>) => {
    setDb((prev) => {
      const next = structuredClone(prev);
      next.logs = [{ id: uid(), time: nowISO(), ...log }, ...next.logs].slice(0, LOG_LIMIT);
      return next;
    });
  }, []);

  /* 每次数据变化自动持久化（内容不变时不重复写入；失败时给出可见警告并保留重试机会） */
  useEffect(() => {
    let raw = '';
    try {
      raw = JSON.stringify(db);
    } catch {
      return;
    }
    if (raw === lastPersisted.current) return;
    try {
      localStorage.setItem(DB_KEY, raw);
      lastPersisted.current = raw;
      setStorageWarning(null);
    } catch (e) {
      console.warn('[hhqt] 本地存储写入失败（可能超出容量）', e);
      setStorageWarning(
        '浏览器本地存储空间不足：本次修改未能持久保存，刷新后会丢失。请在「素材库」删除大体积图片，或将图片 / 音频改用外链。'
      );
    }
  }, [db]);

  /* 跨标签页实时同步：后台修改 → 已打开的前台标签页立即刷新数据 */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DB_KEY || !e.newValue) return;
      try {
        const next = parseWithMigration(e.newValue);
        lastPersisted.current = e.newValue;
        setStorageWarning(null);
        setDb(next);
      } catch {
        /* 忽略损坏数据 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ db, update, replace, addLog, storageWarning }),
    [db, update, replace, addLog, storageWarning]
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore 必须在 StoreProvider 内使用');
  return v;
}
