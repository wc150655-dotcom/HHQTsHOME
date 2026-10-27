/** 全站操作日志系统 —— 所有修改永久留痕，敏感操作日志禁止删除 */
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cx } from '../../lib/utils';
import { PageHeader, SectionCard, TextInput } from './controls';

export function LogsPage() {
  const { db } = useStore();
  const [module, setModule] = useState('');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [q, setQ] = useState('');

  const modules = Array.from(new Set(db.logs.map((l) => l.module)));
  const list = db.logs.filter(
    (l) =>
      (!module || l.module === module) &&
      (!sensitiveOnly || l.sensitive) &&
      (!q || l.action.includes(q) || l.detail.includes(q) || l.user.includes(q))
  );

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(iso));

  return (
    <div>
      <PageHeader
        title="全站操作日志"
        subtitle="所有修改永久留痕：修改人账号、时间、模块、内容明细。⚠️ 敏感操作日志（账号、金额、导入等）禁止删除，本页不提供任何删除能力。"
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          aria-label="按模块筛选"
          className="field-input !w-44"
          value={module}
          onChange={(e) => setModule(e.target.value)}
        >
          <option value="">全部模块</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-pressed={sensitiveOnly}
          onClick={() => setSensitiveOnly((v) => !v)}
          className={cx(
            'focus-ring flex items-center gap-1.5 rounded-[4px] border px-3 py-2 text-xs tracking-wider transition-colors',
            sensitiveOnly
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-[var(--line)] text-[var(--ink-soft)]'
          )}
        >
          <ShieldAlert size={13} />
          仅看敏感操作
        </button>
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索操作人 / 内容"
          className="!w-56"
        />
      </div>

      <SectionCard title={`日志记录 · ${list.length}`}>
        {list.length === 0 ? (
          <p className="py-8 text-center text-xs tracking-widest text-[var(--muted)]">暂无符合条件的日志</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {list.map((l) => (
              <li key={l.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-3">
                <span className="tnum w-36 shrink-0 text-[11px] text-[var(--muted)]">{fmt(l.time)}</span>
                <span className="w-20 shrink-0 truncate text-xs tracking-wider text-[var(--ink-soft)]">
                  {l.user}
                </span>
                <span className="w-20 shrink-0 rounded-[2px] border border-[var(--line)] px-1.5 py-0.5 text-center text-[9px] tracking-wider text-[var(--muted)]">
                  {l.module}
                </span>
                <span className="w-24 shrink-0 text-xs tracking-wider text-[var(--ink)]">{l.action}</span>
                <span className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--muted)]">{l.detail}</span>
                {l.sensitive && (
                  <span className="flex shrink-0 items-center gap-1 rounded-[2px] border border-[var(--accent)] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-[var(--accent)]">
                    <ShieldAlert size={10} /> 敏感 · 留痕
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
