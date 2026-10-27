/** 陪玩人员完整管理系统（核心模块） —— 新增 / 编辑 / 退团自动隐藏 / 详情与战绩评价 */
import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { Companion } from '../../lib/types';
import { companionAvatar } from '../../components/CompanionCard';
import { uid, cx } from '../../lib/utils';
import {
  ConfirmButton,
  Field,
  ImagePicker,
  ListEditor,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
  ToggleRow,
} from './controls';

const emptyCompanion = (): Companion => ({
  id: uid(),
  nickname: '新陪玩',
  avatarMode: 'random',
  avatarUrl: '',
  voice: '',
  games: [],
  services: [],
  shortIntro: '',
  signature: '',
  detail: '',
  rank: '',
  specialty: '',
  price: '',
  status: 'active',
  extra: {
    showAge: false,
    age: '',
    showHours: false,
    hours: '',
    showTags: false,
    tags: [],
    showSocial: false,
    social: [],
  },
  records: [],
});

export function CompanionsAdminPage() {
  const { db, update } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const list = db.companions;
  const opts = db.options;

  const patch = (id: string, fn: (c: Companion) => void) =>
    update((d) => {
      const c = d.companions.find((x) => x.id === id);
      if (c) fn(c);
    }, { module: '陪玩管理', action: '编辑陪玩', detail: `编辑陪玩 #${id}` });

  const addCompanion = () => {
    const c = emptyCompanion();
    update((d) => {
      d.companions.unshift(c);
    }, { module: '陪玩管理', action: '新增陪玩', detail: `新增陪玩「${c.nickname}」` });
    setExpanded(c.id);
  };

  const label = (list2: { id: string; label: string }[], id: string) =>
    list2.find((x) => x.id === id)?.label ?? id;

  const checkGroup = (
    field: 'games' | 'services',
    c: Companion,
    items: { id: string; label: string; enabled: boolean }[]
  ) => (
    <div className="flex flex-wrap gap-2">
      {items
        .filter((i) => i.enabled)
        .map((it) => {
          const on = c[field].includes(it.id);
          return (
            <button
              key={it.id}
              type="button"
              aria-pressed={on}
              onClick={() =>
                patch(c.id, (x) => {
                  x[field] = on ? x[field].filter((v) => v !== it.id) : [...x[field], it.id];
                })
              }
              className={cx(
                'focus-ring rounded-[3px] border px-3 py-1.5 text-xs tracking-wider transition-colors',
                on
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]'
              )}
            >
              {it.label}
            </button>
          );
        })}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="陪玩人员管理"
        subtitle="陪玩资料完整管理：退团自动在前端隐藏；录入后前端筛选系统自动生效。"
        actions={
          <button
            type="button"
            onClick={addCompanion}
            className="focus-ring btn-accent flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-xs tracking-[0.3em]"
          >
            <Plus size={13} /> 新增陪玩
          </button>
        }
      />

      <div className="space-y-3">
        {list.length === 0 && (
          <SectionCard title="暂无陪玩资料" desc="点击右上角「新增陪玩」开始录入">
            <p className="text-xs text-[var(--muted)]">录入后前端「陪玩展示」将自动出现卡片。</p>
          </SectionCard>
        )}

        {list.map((c) => {
          const open = expanded === c.id;
          const avatar = companionAvatar(c, opts.avatarPresets);
          return (
            <div key={c.id} className="rounded-[6px] border border-[var(--line)]">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : c.id)}
                className="focus-ring flex w-full items-center gap-4 px-4 py-3 text-left"
              >
                <ChevronDown
                  size={14}
                  className={cx('shrink-0 text-[var(--muted)] transition-transform', open && 'rotate-180')}
                />
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--bg)]">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-[var(--muted)]">{c.nickname.slice(0, 1)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm tracking-wider text-[var(--ink)]">
                    {c.nickname}
                    {c.status === 'left' && (
                      <span className="ml-2 rounded-[2px] border border-[var(--line)] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-[var(--muted)]">
                        已退团 · 前端隐藏
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] tracking-wider text-[var(--muted)]">
                    {label(opts.voices, c.voice) || '未设音色'} · {c.games.map((g) => label(opts.games, g)).join(' / ') || '未设游戏'}
                  </span>
                </span>
                <span
                  className={cx(
                    'shrink-0 rounded-[2px] border px-2 py-0.5 text-[9px] tracking-[0.2em]',
                    c.status === 'active'
                      ? 'border-[var(--accent)] text-[var(--accent)]'
                      : 'border-[var(--line)] text-[var(--muted)]'
                  )}
                >
                  {c.status === 'active' ? '在团' : '退团'}
                </span>
              </button>

              {open && (
                <div className="border-t border-dashed border-[var(--line)] p-4 md:p-5">
                  <div className="grid gap-5 lg:grid-cols-2">
                    {/* 左列：基础资料 */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="陪玩昵称">
                          <TextInput value={c.nickname} onChange={(e) => patch(c.id, (x) => (x.nickname = e.target.value))} />
                        </Field>
                        <Field label="音色（选项库）">
                          <select
                            className="field-input"
                            value={c.voice}
                            onChange={(e) => patch(c.id, (x) => (x.voice = e.target.value))}
                          >
                            <option value="">未选择</option>
                            {opts.voices.filter((v) => v.enabled).map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <Field label="可接游戏（多选）">{checkGroup('games', c, opts.games)}</Field>
                      <Field label="服务类型（多选）">{checkGroup('services', c, opts.services)}</Field>
                      <Field label="简短首页简介">
                        <TextInput value={c.shortIntro} onChange={(e) => patch(c.id, (x) => (x.shortIntro = e.target.value))} />
                      </Field>
                      <Field label="一句话个性签名">
                        <TextInput value={c.signature} onChange={(e) => patch(c.id, (x) => (x.signature = e.target.value))} />
                      </Field>
                      <Field label="详情页完整长简介">
                        <TextArea rows={3} value={c.detail} onChange={(e) => patch(c.id, (x) => (x.detail = e.target.value))} />
                      </Field>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="段位">
                          <TextInput value={c.rank} onChange={(e) => patch(c.id, (x) => (x.rank = e.target.value))} />
                        </Field>
                        <Field label="特长">
                          <TextInput value={c.specialty} onChange={(e) => patch(c.id, (x) => (x.specialty = e.target.value))} />
                        </Field>
                        <Field label="价格 / 其它">
                          <TextInput value={c.price} onChange={(e) => patch(c.id, (x) => (x.price = e.target.value))} />
                        </Field>
                      </div>
                      <ToggleRow
                        label="接单状态：在团 / 退团"
                        hint="设为退团后，该陪玩立即从前端所有列表隐藏"
                        checked={c.status === 'active'}
                        onChange={(v) => patch(c.id, (x) => (x.status = v ? 'active' : 'left'))}
                      />
                    </div>

                    {/* 右列：头像与拓展字段 */}
                    <div className="space-y-4">
                      <Field label="头像模式">
                        <div className="flex gap-2">
                          {(
                            [
                              ['random', '三图随机默认'],
                              ['custom', '自定义头像'],
                            ] as const
                          ).map(([v, t]) => (
                            <button
                              key={v}
                              type="button"
                              aria-pressed={c.avatarMode === v}
                              onClick={() => patch(c.id, (x) => (x.avatarMode = v))}
                              className={cx(
                                'focus-ring rounded-[3px] border px-3 py-1.5 text-xs tracking-wider transition-colors',
                                c.avatarMode === v
                                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                  : 'border-[var(--line)] text-[var(--ink-soft)]'
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </Field>
                      {c.avatarMode === 'custom' && (
                        <Field label="自定义头像">
                          <ImagePicker value={c.avatarUrl} onChange={(v) => patch(c.id, (x) => (x.avatarUrl = v))} label="陪玩头像" />
                        </Field>
                      )}

                      <ToggleRow
                        label="显示年龄"
                        checked={c.extra.showAge}
                        onChange={(v) => patch(c.id, (x) => (x.extra.showAge = v))}
                      />
                      {c.extra.showAge && (
                        <Field label="年龄">
                          <TextInput value={c.extra.age} onChange={(e) => patch(c.id, (x) => (x.extra.age = e.target.value))} />
                        </Field>
                      )}
                      <ToggleRow
                        label="显示接单时间段"
                        checked={c.extra.showHours}
                        onChange={(v) => patch(c.id, (x) => (x.extra.showHours = v))}
                      />
                      {c.extra.showHours && (
                        <Field label="接单时间段">
                          <TextInput
                            value={c.extra.hours}
                            placeholder="如：20:00 - 02:00"
                            onChange={(e) => patch(c.id, (x) => (x.extra.hours = e.target.value))}
                          />
                        </Field>
                      )}
                      <ToggleRow
                        label="显示个人标签"
                        checked={c.extra.showTags}
                        onChange={(v) => patch(c.id, (x) => (x.extra.showTags = v))}
                      />
                      {c.extra.showTags && (
                        <Field label="个人标签">
                          <ListEditor items={c.extra.tags} onChange={(v) => patch(c.id, (x) => (x.extra.tags = v))} placeholder="如：深夜档" />
                        </Field>
                      )}
                      <ToggleRow
                        label="显示社交账号"
                        checked={c.extra.showSocial}
                        onChange={(v) => patch(c.id, (x) => (x.extra.showSocial = v))}
                      />
                      {c.extra.showSocial && (
                        <Field label="社交账号（可单独隐藏）">
                          <div className="space-y-2">
                            {c.extra.social.map((s, i) => (
                              <div key={i} className="flex gap-2">
                                <TextInput
                                  value={s.platform}
                                  placeholder="平台"
                                  className="!w-28"
                                  onChange={(e) =>
                                    patch(c.id, (x) => (x.extra.social[i] = { ...x.extra.social[i], platform: e.target.value }))
                                  }
                                />
                                <TextInput
                                  value={s.account}
                                  placeholder="账号"
                                  onChange={(e) =>
                                    patch(c.id, (x) => (x.extra.social[i] = { ...x.extra.social[i], account: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  aria-pressed={s.hidden}
                                  onClick={() =>
                                    patch(c.id, (x) => (x.extra.social[i] = { ...x.extra.social[i], hidden: !s.hidden }))
                                  }
                                  className="focus-ring w-16 shrink-0 rounded-[4px] border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--muted)]"
                                >
                                  {s.hidden ? '隐藏' : '显示'}
                                </button>
                                <button
                                  type="button"
                                  aria-label="删除账号"
                                  onClick={() =>
                                    patch(c.id, (x) => (x.extra.social = x.extra.social.filter((_, j) => j !== i)))
                                  }
                                  className="focus-ring flex w-9 shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                patch(c.id, (x) => (x.extra.social = [...x.extra.social, { platform: '', account: '', hidden: false }]))
                              }
                              className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                            >
                              <Plus size={12} /> 添加账号
                            </button>
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>

                  {/* 战绩与评价 */}
                  <div className="mt-6 border-t border-dashed border-[var(--line)] pt-5">
                    <p className="mb-3 text-xs tracking-[0.2em] text-[var(--ink-soft)]">历史战绩 / 用户评价</p>
                    <div className="space-y-2">
                      {c.records.map((r, i) => (
                        <div key={r.id} className="flex flex-wrap gap-2">
                          <select
                            aria-label="记录类型"
                            className="field-input !w-28"
                            value={r.kind}
                            onChange={(e) =>
                              patch(c.id, (x) => (x.records[i] = { ...x.records[i], kind: e.target.value as 'record' | 'review' }))
                            }
                          >
                            <option value="record">战绩</option>
                            <option value="review">评价</option>
                          </select>
                          <TextInput
                            value={r.content}
                            placeholder="内容"
                            className="!flex-1"
                            onChange={(e) => patch(c.id, (x) => (x.records[i] = { ...x.records[i], content: e.target.value }))}
                          />
                          <TextInput
                            value={r.date}
                            placeholder="时间 2026-10"
                            className="!w-32"
                            onChange={(e) => patch(c.id, (x) => (x.records[i] = { ...x.records[i], date: e.target.value }))}
                          />
                          <button
                            type="button"
                            aria-label="删除记录"
                            onClick={() => patch(c.id, (x) => (x.records = x.records.filter((_, j) => j !== i)))}
                            className="focus-ring flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          patch(c.id, (x) =>
                            x.records.push({ id: uid(), kind: 'record', content: '', date: '' })
                          )
                        }
                        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                      >
                        <Plus size={12} /> 添加记录
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-dashed border-[var(--line)] pt-4">
                    <ConfirmButton
                      danger
                      onConfirm={() => {
                        update((d) => {
                          d.companions = d.companions.filter((x) => x.id !== c.id);
                        }, { module: '陪玩管理', action: '删除陪玩', detail: `删除陪玩「${c.nickname}」` });
                      }}
                    >
                      删除该陪玩
                    </ConfirmButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
