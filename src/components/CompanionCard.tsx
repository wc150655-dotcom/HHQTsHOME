/** 陪玩卡片 + 组合筛选器 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Tag, EmptyState } from './ui';
import { cx } from '../lib/utils';
import type { Companion } from '../lib/types';

/** 头像：custom 用自定义图；random 用默认三图直链按 id 稳定随机 */
export function companionAvatar(c: Companion, presets: string[]): string {
  if (c.avatarMode === 'custom' && c.avatarUrl) return c.avatarUrl;
  if (presets.length === 0) return '';
  const h = Array.from(c.id).reduce((a, ch) => (a + ch.charCodeAt(0)) % 997, 0);
  return presets[h % presets.length];
}

export function CompanionCard({ c }: { c: Companion }) {
  const { db } = useStore();
  const opts = db.options;
  const avatar = companionAvatar(c, opts.avatarPresets);
  const voice = opts.voices.find((v) => v.id === c.voice)?.label ?? c.voice;
  const games = c.games.map((g) => opts.games.find((x) => x.id === g)?.label ?? g);
  const services = c.services.map((s) => opts.services.find((x) => x.id === s)?.label ?? s);

  return (
    <Link
      to={`/companions/${c.id}`}
      className="glass card-glow focus-ring group flex gap-4 p-4 sm:gap-5 sm:p-5"
      aria-label={`查看陪玩 ${c.nickname} 详情`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[4px] border border-[var(--line)] sm:h-24 sm:w-24">
        {avatar ? (
          <img
            src={avatar}
            alt={`${c.nickname} 头像`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-[var(--muted)]">
            {c.nickname.slice(0, 1)}
          </span>
        )}
        <span aria-hidden="true" className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-display text-lg tracking-wider text-[var(--ink)]">
            {c.nickname}
          </h3>
          {c.price && (
            <span className="tnum shrink-0 text-xs tracking-wider text-[var(--accent)]">{c.price}</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
          {c.signature || c.shortIntro}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag accent>{voice}</Tag>
          {services.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {games.map((g) => (
            <span key={g} className="text-[10px] tracking-[0.2em] text-[var(--muted)]">
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

/* ============ 组合筛选器 ============ */
export interface FilterState {
  voices: string[];
  games: string[];
  services: string[];
}

export const EMPTY_FILTER: FilterState = { voices: [], games: [], services: [] };

export function CompanionFilter({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const { db } = useStore();
  const opts = db.options;
  const enabled = (list: { id: string; label: string; enabled: boolean; order: number }[]) =>
    list.filter((i) => i.enabled).sort((a, b) => a.order - b.order);

  const group = (
    label: string,
    list: { id: string; label: string }[],
    key: 'voices' | 'games' | 'services'
  ) => {
    const sel = value[key];
    const toggle = (id: string) =>
      onChange({
        ...value,
        [key]: sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id],
      });
    return (
      <fieldset className="border border-[var(--line)] p-5">
        <legend className="px-2 text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
          {label}
        </legend>
        <div className="flex flex-wrap gap-2">
          {list.map((it) => {
            const active = sel.includes(it.id);
            return (
              <button
                key={it.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(it.id)}
                className={cx(
                  'focus-ring rounded-[3px] border px-3.5 py-1.5 text-xs tracking-[0.2em] transition-colors',
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]'
                )}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  };

  const total = value.voices.length + value.games.length + value.services.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Filter · 组合筛选
        </p>
        {total > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="focus-ring text-xs tracking-[0.25em] text-[var(--accent)] hover:underline"
          >
            清除全部筛选（{total}）
          </button>
        )}
      </div>
      {group('音色', enabled(opts.voices), 'voices')}
      {group('游戏', enabled(opts.games), 'games')}
      {group('服务类型', enabled(opts.services), 'services')}
    </div>
  );
}

/* ============ 筛选逻辑 ============ */
export function filterCompanions(list: Companion[], f: FilterState): Companion[] {
  const match = (ids: string[], sel: string[]) =>
    sel.length === 0 || ids.some((id) => sel.includes(id));
  return list.filter(
    (c) =>
      c.status === 'active' &&
      (f.voices.length === 0 || f.voices.includes(c.voice)) &&
      match(c.games, f.games) &&
      match(c.services, f.services)
  );
}

/* ============ 空结果 ============ */
export function CompanionEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      text="没有符合条件的陪玩"
      sub={onClear ? '试试调整筛选条件' : '陪玩列表为空，等待后台录入'}
    />
  );
}
