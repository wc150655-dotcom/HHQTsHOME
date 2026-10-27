/** 卡项系统后台管理 —— 冠卡 / 包陪卡 / VIP 卡 三大类完整独立管理 */
import { useState } from 'react';
import { Crown, Gem, Package, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { CrownCard, PackageCard, VipCard } from '../../lib/types';
import { uid, cx } from '../../lib/utils';
import {
  Field,
  ImagePicker,
  ListEditor,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
  ToggleRow,
} from './controls';

type Tab = 'crown' | 'packages' | 'vip';

export function CardsAdminPage() {
  const { db, update } = useStore();
  const [tab, setTab] = useState<Tab>('crown');

  const log = (action: string, detail: string) =>
    update(() => undefined, { module: '卡项管理', action, detail });

  const cards = db.cards;

  /* ---------- 冠卡 ---------- */
  const patchCrown = (id: string, fn: (c: CrownCard) => void) =>
    update((d) => {
      const c = d.cards.crown.find((x) => x.id === id);
      if (c) fn(c);
    }, { module: '卡项管理', action: '编辑冠卡', detail: `编辑冠卡 #${id}` });

  /* ---------- 包陪卡 ---------- */
  const patchPkg = (id: string, fn: (c: PackageCard) => void) =>
    update((d) => {
      const c = d.cards.packages.find((x) => x.id === id);
      if (c) fn(c);
    }, { module: '卡项管理', action: '编辑包陪卡', detail: `编辑包陪卡 #${id}` });

  /* ---------- VIP ---------- */
  const patchVip = (id: string, fn: (c: VipCard) => void) =>
    update((d) => {
      const c = d.cards.vip.find((x) => x.id === id);
      if (c) fn(c);
    }, { module: '卡项管理', action: '编辑VIP卡', detail: `编辑VIP卡 #${id}` });

  const TABS: { key: Tab; label: string; icon: typeof Crown }[] = [
    { key: 'crown', label: '冠卡（日/周/月/年）', icon: Crown },
    { key: 'packages', label: '包陪卡（天/夜/周/月/年）', icon: Package },
    { key: 'vip', label: 'VIP 卡（常驻/累充）', icon: Gem },
  ];

  return (
    <div>
      <PageHeader
        title="卡项系统管理"
        subtitle="三大卡类完整独立管理：名称、封面图、服务说明、价格、上下架。前端玻璃卡片实时渲染。"
      />

      <div role="tablist" aria-label="卡类切换" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cx(
                'focus-ring flex items-center gap-2 rounded-[4px] border px-4 py-2 text-xs tracking-[0.2em] transition-colors',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]'
              )}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ============ 冠卡 ============ */}
      {tab === 'crown' && (
        <div className="space-y-4">
          {cards.crown.map((c) => (
            <SectionCard key={c.id} title={`${c.name || '未命名冠卡'}（顺序 ${c.order}）`}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="卡类型名称">
                    <TextInput value={c.name} onChange={(e) => patchCrown(c.id, (x) => (x.name = e.target.value))} />
                  </Field>
                  <Field label="展示顺序">
                    <TextInput
                      type="number"
                      value={c.order}
                      onChange={(e) => e.target.value !== '' && patchCrown(c.id, (x) => (x.order = Number(e.target.value)))}
                    />
                  </Field>
                  <Field label="全套附赠服务说明">
                    <ListEditor
                      items={c.perks}
                      onChange={(v) => patchCrown(c.id, (x) => (x.perks = v))}
                      placeholder="如：专属点单优先通道"
                    />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="卡封面图">
                    <ImagePicker value={c.imageUrl} onChange={(v) => patchCrown(c.id, (x) => (x.imageUrl = v))} label="冠卡封面" />
                  </Field>
                  <ToggleRow
                    label="上架 / 下架"
                    checked={c.enabled}
                    onChange={(v) => patchCrown(c.id, (x) => (x.enabled = v))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      update((d) => {
                        d.cards.crown = d.cards.crown.filter((x) => x.id !== c.id);
                      }, { module: '卡项管理', action: '删除冠卡', detail: `删除冠卡「${c.name}」` });
                    }}
                    className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs tracking-wider text-[var(--muted)] hover:border-red-400 hover:text-red-400"
                  >
                    <Trash2 size={12} /> 删除此卡
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
          <button
            type="button"
            onClick={() => {
              update((d) => {
                d.cards.crown.push({
                  id: uid(),
                  name: '新冠卡',
                  imageUrl: '',
                  perks: [],
                  enabled: true,
                  order: d.cards.crown.length + 1,
                });
              }, { module: '卡项管理', action: '新增冠卡', detail: '新增冠卡一张' });
            }}
            className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={13} /> 新增冠卡
          </button>
        </div>
      )}

      {/* ============ 包陪卡 ============ */}
      {tab === 'packages' && (
        <div className="space-y-4">
          {cards.packages.map((c) => (
            <SectionCard key={c.id} title={`${c.name || '未命名包陪卡'}（顺序 ${c.order}）`}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="包陪类型">
                      <TextInput value={c.name} onChange={(e) => patchPkg(c.id, (x) => (x.name = e.target.value))} />
                    </Field>
                    <Field label="价格">
                      <TextInput value={c.price} onChange={(e) => patchPkg(c.id, (x) => (x.price = e.target.value))} />
                    </Field>
                  </div>
                  <Field label="时长说明">
                    <TextInput value={c.duration} onChange={(e) => patchPkg(c.id, (x) => (x.duration = e.target.value))} />
                  </Field>
                  <Field label="包含的服务说明">
                    <ListEditor
                      items={c.services}
                      onChange={(v) => patchPkg(c.id, (x) => (x.services = v))}
                      placeholder="如：全程陪玩"
                    />
                  </Field>
                  <Field label="咨询按钮跳转链接" hint="留空则点击后跳转至团队概况联系方式">
                    <TextInput
                      value={c.consultUrl}
                      placeholder="https://…"
                      onChange={(e) => patchPkg(c.id, (x) => (x.consultUrl = e.target.value))}
                    />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="卡片图片">
                    <ImagePicker value={c.imageUrl} onChange={(v) => patchPkg(c.id, (x) => (x.imageUrl = v))} label="包陪卡封面" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="展示顺序">
                      <TextInput
                        type="number"
                        value={c.order}
                        onChange={(e) => e.target.value !== '' && patchPkg(c.id, (x) => (x.order = Number(e.target.value)))}
                      />
                    </Field>
                    <ToggleRow label="上架" checked={c.enabled} onChange={(v) => patchPkg(c.id, (x) => (x.enabled = v))} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      update((d) => {
                        d.cards.packages = d.cards.packages.filter((x) => x.id !== c.id);
                      }, { module: '卡项管理', action: '删除包陪卡', detail: `删除包陪卡「${c.name}」` });
                    }}
                    className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs tracking-wider text-[var(--muted)] hover:border-red-400 hover:text-red-400"
                  >
                    <Trash2 size={12} /> 删除此卡
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
          <button
            type="button"
            onClick={() => {
              update((d) => {
                d.cards.packages.push({
                  id: uid(),
                  name: '新包陪卡',
                  duration: '',
                  price: '',
                  services: [],
                  imageUrl: '',
                  consultUrl: '',
                  enabled: true,
                  order: d.cards.packages.length + 1,
                });
              }, { module: '卡项管理', action: '新增包陪卡', detail: '新增包陪卡一张' });
            }}
            className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={13} /> 新增包陪卡
          </button>
        </div>
      )}

      {/* ============ VIP 卡 ============ */}
      {tab === 'vip' && (
        <div className="space-y-4">
          {cards.vip.map((c) => (
            <SectionCard key={c.id} title={`${c.name || '未命名VIP卡'}（顺序 ${c.order}）`}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="VIP 类型名称">
                    <TextInput value={c.name} onChange={(e) => patchVip(c.id, (x) => (x.name = e.target.value))} />
                  </Field>
                  <Field label="权益说明">
                    <ListEditor
                      items={c.benefits}
                      onChange={(v) => patchVip(c.id, (x) => (x.benefits = v))}
                      placeholder="如：专属徽章与光效"
                    />
                  </Field>
                  <div>
                    <p className="field-label">充值档位 / 价格</p>
                    <div className="space-y-2">
                      {c.tiers.map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <TextInput
                            value={t.label}
                            placeholder="档位"
                            onChange={(e) =>
                              patchVip(c.id, (x) => (x.tiers[i] = { ...x.tiers[i], label: e.target.value }))
                            }
                          />
                          <TextInput
                            value={t.price}
                            placeholder="价格"
                            onChange={(e) =>
                              patchVip(c.id, (x) => (x.tiers[i] = { ...x.tiers[i], price: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            aria-label="删除档位"
                            onClick={() => patchVip(c.id, (x) => (x.tiers = x.tiers.filter((_, j) => j !== i)))}
                            className="focus-ring flex w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => patchVip(c.id, (x) => (x.tiers = [...x.tiers, { label: '', price: '' }]))}
                        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        <Plus size={12} /> 添加档位
                      </button>
                    </div>
                  </div>
                  <Field label="购买咨询链接">
                    <TextInput
                      value={c.consultUrl}
                      placeholder="https://…"
                      onChange={(e) => patchVip(c.id, (x) => (x.consultUrl = e.target.value))}
                    />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="专属标识图片">
                    <ImagePicker value={c.badgeUrl} onChange={(v) => patchVip(c.id, (x) => (x.badgeUrl = v))} label="VIP专属标识" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="展示顺序">
                      <TextInput
                        type="number"
                        value={c.order}
                        onChange={(e) => e.target.value !== '' && patchVip(c.id, (x) => (x.order = Number(e.target.value)))}
                      />
                    </Field>
                    <ToggleRow label="上架" checked={c.enabled} onChange={(v) => patchVip(c.id, (x) => (x.enabled = v))} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      update((d) => {
                        d.cards.vip = d.cards.vip.filter((x) => x.id !== c.id);
                      }, { module: '卡项管理', action: '删除VIP卡', detail: `删除VIP卡「${c.name}」` });
                    }}
                    className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs tracking-wider text-[var(--muted)] hover:border-red-400 hover:text-red-400"
                  >
                    <Trash2 size={12} /> 删除此卡
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
          <button
            type="button"
            onClick={() => {
              update((d) => {
                d.cards.vip.push({
                  id: uid(),
                  name: '新VIP卡',
                  benefits: [],
                  tiers: [{ label: '', price: '' }],
                  badgeUrl: '',
                  consultUrl: '',
                  enabled: true,
                  order: d.cards.vip.length + 1,
                });
              }, { module: '卡项管理', action: '新增VIP卡', detail: '新增VIP卡一张' });
            }}
            className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={13} /> 新增 VIP 卡
          </button>
        </div>
      )}
    </div>
  );
}
