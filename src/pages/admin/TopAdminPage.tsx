/** 本月头牌专区后台管理 —— 排名 / 业绩数据 / 徽章光效 / 月度一键重置 */
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { TopCompanion } from '../../lib/types';
import { companionAvatar } from '../../components/CompanionCard';
import { uid, monthKey } from '../../lib/utils';
import {
  ConfirmButton,
  Field,
  ImagePicker,
  ListEditor,
  PageHeader,
  PairEditor,
  SectionCard,
  TextInput,
  ToggleRow,
} from './controls';

const emptyTop = (rank: number): TopCompanion => ({
  id: uid(),
  rank,
  companionId: '',
  name: '',
  avatarUrl: '',
  tags: [],
  stats: [{ label: '本月单量', value: '' }],
  badge: '',
  glow: '',
  enabled: true,
});

export function TopAdminPage() {
  const { db, update } = useStore();
  const list = [...db.top].sort((a, b) => a.rank - b.rank);

  const patch = (id: string, fn: (t: TopCompanion) => void) =>
    update((d) => {
      const t = d.top.find((x) => x.id === id);
      if (t) fn(t);
    }, { module: '头牌管理', action: '编辑头牌', detail: `编辑头牌 #${id}` });

  const linkCompanion = (id: string, companionId: string) => {
    const c = db.companions.find((x) => x.id === companionId);
    patch(id, (t) => {
      t.companionId = companionId;
      if (c) {
        t.name = c.nickname;
        t.avatarUrl = companionAvatar(c, db.options.avatarPresets);
        const voice = db.options.voices.find((v) => v.id === c.voice)?.label ?? '';
        const games = c.games.map((g) => db.options.games.find((x) => x.id === g)?.label ?? g);
        t.tags = [voice, ...games].filter(Boolean).slice(0, 4);
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="本月头牌管理"
        subtitle="配置当月表现最好的陪玩：排名顺序、业绩数据、专属徽章与光效。第一名前端特殊高亮。"
        actions={
          <ConfirmButton
            danger
            confirmText="确认清空并开启新一期头牌？（不可撤销）"
            onConfirm={() =>
              update(
                (d) => {
                  d.top = [];
                  d.monthKey = monthKey();
                },
                { module: '头牌管理', action: '月度重置', detail: '一键清空头牌榜单，开启新一期', sensitive: true }
              )
            }
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={13} /> 月度一键重置
            </span>
          </ConfirmButton>
        }
      />

      <p className="mb-5 text-xs tracking-wider text-[var(--muted)]">
        当前期数：{db.monthKey} · 重置后前端将显示空状态
      </p>

      <div className="space-y-4">
        {list.length === 0 && (
          <SectionCard title="暂无头牌配置" desc="点击下方「新增席位」开始配置，或从陪玩资料一键导入">
            <p className="text-xs text-[var(--muted)]">前端「本月头牌」专区将显示优雅空占位。</p>
          </SectionCard>
        )}

        {list.map((t) => (
          <SectionCard
            key={t.id}
            title={`第 ${t.rank} 名 · ${t.name || '未命名'}`}
            desc={t.rank === 1 ? '第一名在前端突出显示' : undefined}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="排名">
                    <TextInput
                      type="number"
                      value={t.rank}
                      onChange={(e) => e.target.value !== '' && patch(t.id, (x) => (x.rank = Number(e.target.value)))}
                    />
                  </Field>
                  <Field label="从陪玩资料导入">
                    <select
                      className="field-input"
                      value={t.companionId}
                      onChange={(e) => linkCompanion(t.id, e.target.value)}
                    >
                      <option value="">手动填写</option>
                      {db.companions
                        .filter((c) => c.status === 'active')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nickname}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
                <Field label="昵称">
                  <TextInput value={t.name} onChange={(e) => patch(t.id, (x) => (x.name = e.target.value))} />
                </Field>
                <Field label="音色 / 游戏标签">
                  <ListEditor items={t.tags} onChange={(v) => patch(t.id, (x) => (x.tags = v))} placeholder="如：御姐音" />
                </Field>
                <Field label="本月业绩数据">
                  <PairEditor pairs={t.stats} onChange={(v) => patch(t.id, (x) => (x.stats = v))} />
                </Field>
              </div>
              <div className="space-y-4">
                <Field label="头牌头像">
                  <ImagePicker value={t.avatarUrl} onChange={(v) => patch(t.id, (x) => (x.avatarUrl = v))} label="头牌头像" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="专属徽章文案">
                    <TextInput
                      value={t.badge}
                      placeholder="如：本月头牌 · 第一"
                      onChange={(e) => patch(t.id, (x) => (x.badge = e.target.value))}
                    />
                  </Field>
                  <Field label="装饰光效颜色">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="光效颜色"
                        value={t.glow || '#9C3A3A'}
                        onChange={(e) => patch(t.id, (x) => (x.glow = e.target.value))}
                        className="h-9 w-12 rounded-[4px] border border-[var(--line)] bg-transparent"
                      />
                      <TextInput
                        value={t.glow}
                        placeholder="rgba(…)"
                        onChange={(e) => patch(t.id, (x) => (x.glow = e.target.value))}
                      />
                    </div>
                  </Field>
                </div>
                <ToggleRow label="上架展示" checked={t.enabled} onChange={(v) => patch(t.id, (x) => (x.enabled = v))} />
                <button
                  type="button"
                  onClick={() => {
                    update((d) => {
                      d.top = d.top.filter((x) => x.id !== t.id);
                    }, { module: '头牌管理', action: '删除席位', detail: `删除头牌席位「${t.name}」` });
                  }}
                  className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs tracking-wider text-[var(--muted)] hover:border-red-400 hover:text-red-400"
                >
                  <Trash2 size={12} /> 删除席位
                </button>
              </div>
            </div>
          </SectionCard>
        ))}

        <button
          type="button"
          onClick={() =>
            update((d) => {
              d.top.push(emptyTop(d.top.length + 1));
            }, { module: '头牌管理', action: '新增席位', detail: '新增头牌席位' })
          }
          className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Plus size={13} /> 新增席位
        </button>
      </div>
    </div>
  );
}
