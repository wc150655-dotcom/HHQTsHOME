/**
 * 老板消费前三 · 塔罗牌专属后台（重点敏感模块）
 * —— 三名席位固定：第1=日牌 / 第2=月牌 / 第3=星牌
 * —— 昵称匿名 / 金额打码开关；大阿尔卡纳 + 三张附属小牌全套素材与释义
 * —— 未填写数据时前端显示空白优雅占位，不崩坏布局
 */
import { useState } from 'react';
import { Moon, ShieldAlert, Star, Sun, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { TarotSeat } from '../../lib/types';
import { cx } from '../../lib/utils';
import {
  ConfirmButton,
  Field,
  ImagePicker,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
  ToggleRow,
} from './controls';

const SEATS = [
  { rank: 1, label: '第一名', back: '日牌', icon: Sun },
  { rank: 2, label: '第二名', back: '月牌', icon: Moon },
  { rank: 3, label: '第三名', back: '星牌', icon: Star },
] as const;

export function TarotAdminPage() {
  const { db, update } = useStore();
  const [tab, setTab] = useState<number>(1);
  const seat = db.tarot.find((s) => s.rank === tab) as TarotSeat;

  const patch = (fn: (s: TarotSeat) => void, action: string) =>
    update((d) => {
      const s = d.tarot.find((x) => x.rank === tab);
      if (s) fn(s);
    }, { module: '塔罗榜单', action, detail: `编辑${SEATS[tab - 1].label}（${SEATS[tab - 1].back}）席位`, sensitive: true });

  const clearSeat = () =>
    update((d) => {
      const s = d.tarot.find((x) => x.rank === tab);
      if (s) {
        s.configured = false;
        s.bossName = '';
        s.amount = '';
        s.level = '';
        s.title = '';
        s.badge = '';
        s.glow = '';
        s.majorName = '';
        s.majorMeaning = '';
      }
    }, { module: '塔罗榜单', action: '清空席位', detail: `清空${SEATS[tab - 1].label}席位`, sensitive: true });

  const meta = SEATS[tab - 1];

  return (
    <div>
      <PageHeader
        title="老板消费前三 · 塔罗榜单"
        subtitle="三个席位固定对应日 / 月 / 星牌背。⚠️ 本模块包含敏感数据（消费金额 / 昵称），操作永久留痕。"
      />

      <div className="mb-6 flex items-start gap-3 border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <p className="text-xs leading-relaxed text-[var(--ink-soft)]">
          敏感数据区：昵称支持匿名化（自动打码），消费金额支持「金额打码加密」开关；前端将严格服从本页设置。
          未配置席位时，前端塔罗组件显示空白优雅占位，布局不崩坏。
        </p>
      </div>

      <div role="tablist" aria-label="席位切换" className="mb-6 flex flex-wrap gap-2">
        {SEATS.map((s) => {
          const Icon = s.icon;
          const active = tab === s.rank;
          const st = db.tarot.find((x) => x.rank === s.rank);
          return (
            <button
              key={s.rank}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(s.rank)}
              className={cx(
                'focus-ring flex items-center gap-2 rounded-[4px] border px-4 py-2 text-xs tracking-[0.2em] transition-colors',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]'
              )}
            >
              <Icon size={13} />
              {s.label} · {s.back}
              <span className={cx('h-1.5 w-1.5 rounded-full', st?.configured ? 'bg-[var(--accent)]' : 'bg-[var(--line-strong)]')} />
            </button>
          );
        })}
      </div>

      <SectionCard
        title={`${meta.label} · ${meta.back} 席位`}
        desc={seat.configured ? '已配置 · 前端翻面后展示' : '未配置 · 前端显示「静候揭晓」空占位'}
      >
        <ToggleRow
          label="启用此席位（配置数据）"
          hint="关闭后前端恢复空占位状态"
          checked={seat.configured}
          onChange={(v) => patch((s) => (s.configured = v), '启用席位')}
        />

        {seat.configured && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">展示数据（敏感）</p>
              <Field label="老板昵称 / 自定义代号">
                <TextInput value={seat.bossName} onChange={(e) => patch((s) => (s.bossName = e.target.value), '编辑昵称')} />
              </Field>
              <ToggleRow
                label="昵称匿名化"
                hint="前端显示为「首字+***」，保护老板隐私"
                checked={seat.anonymous}
                onChange={(v) => patch((s) => (s.anonymous = v), '匿名开关')}
              />
              <Field label="消费金额（敏感字段）">
                <TextInput value={seat.amount} onChange={(e) => patch((s) => (s.amount = e.target.value), '编辑金额')} />
              </Field>
              <ToggleRow
                label="金额打码 / 加密"
                hint="前端显示为 ¥ ****"
                checked={seat.maskAmount}
                onChange={(v) => patch((s) => (s.maskAmount = v), '打码开关')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="消费等级">
                  <TextInput value={seat.level} onChange={(e) => patch((s) => (s.level = e.target.value), '编辑等级')} />
                </Field>
                <Field label="专属称号">
                  <TextInput value={seat.title} onChange={(e) => patch((s) => (s.title = e.target.value), '编辑称号')} />
                </Field>
                <Field label="专属徽章">
                  <TextInput value={seat.badge} onChange={(e) => patch((s) => (s.badge = e.target.value), '编辑徽章')} />
                </Field>
                <Field label="装饰光效颜色">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="光效颜色"
                      value={seat.glow || '#9C3A3A'}
                      onChange={(e) => patch((s) => (s.glow = e.target.value), '编辑光效')}
                      className="h-9 w-12 rounded-[4px] border border-[var(--line)] bg-transparent"
                    />
                    <TextInput
                      value={seat.glow}
                      placeholder="rgba(…)"
                      onChange={(e) => patch((s) => (s.glow = e.target.value), '编辑光效')}
                    />
                  </div>
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                大阿尔卡纳主牌（代表该老板）
              </p>
              <Field label="主牌名称">
                <TextInput value={seat.majorName} placeholder="如：皇帝 / 女祭司" onChange={(e) => patch((s) => (s.majorName = e.target.value), '编辑主牌名')} />
              </Field>
              <Field label="主牌图片">
                <ImagePicker value={seat.majorUrl} onChange={(v) => patch((s) => (s.majorUrl = v), '更新主牌图')} label="大阿尔卡纳主牌" />
              </Field>
              <Field label="主牌释义">
                <TextArea rows={3} value={seat.majorMeaning} onChange={(e) => patch((s) => (s.majorMeaning = e.target.value), '编辑主牌释义')} />
              </Field>
            </div>
          </div>
        )}

        {seat.configured && (
          <div className="mt-6 border-t border-dashed border-[var(--line)] pt-6">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
              三张附属小牌（翻面后在主牌下方展开，点击展开文字解读）
            </p>
            <div className="grid gap-5 lg:grid-cols-3">
              {seat.minors.map((m, i) => (
                <div key={m.id} className="space-y-3 rounded-[6px] border border-[var(--line)] p-4">
                  <Field label={`小牌 ${i + 1} 标题`}>
                    <TextInput value={m.title} onChange={(e) => patch((s) => (s.minors[i] = { ...s.minors[i], title: e.target.value }), '编辑小牌标题')} />
                  </Field>
                  <Field label={`小牌 ${i + 1} 图片`}>
                    <ImagePicker value={m.imageUrl} onChange={(v) => patch((s) => (s.minors[i] = { ...s.minors[i], imageUrl: v }), '更新小牌图')} label={`附属小牌 ${i + 1}`} />
                  </Field>
                  <Field label={`小牌 ${i + 1} 文字释义`}>
                    <TextArea rows={3} value={m.meaning} onChange={(e) => patch((s) => (s.minors[i] = { ...s.minors[i], meaning: e.target.value }), '编辑小牌释义')} />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-dashed border-[var(--line)] pt-4">
          <ConfirmButton danger confirmText="确认清空该席位？（前端恢复空占位）" onConfirm={clearSeat}>
            <span className="flex items-center gap-1.5">
              <Trash2 size={13} /> 清空席位
            </span>
          </ConfirmButton>
        </div>
      </SectionCard>
    </div>
  );
}
