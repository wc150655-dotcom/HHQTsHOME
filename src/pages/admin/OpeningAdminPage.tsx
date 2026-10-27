/** 开场页管理 —— 标题图 + 左下角随机文案库（逐字生成 / 随机模糊消隐全参数配置） */
import { useState } from 'react';
import { ChevronDown, Copy, Eye, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { OpeningQuote, QuoteStyle } from '../../lib/types';
import { uid, cx } from '../../lib/utils';
import { QuoteText } from '../../components/OpeningPage';
import { Modal } from '../../components/ui';
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

const DEFAULT_STYLE: QuoteStyle = {
  fontSize: 15,
  color: '#494849',
  letterSpacing: 0.22,
  lineHeight: 2.1,
  padTop: 0,
  padRight: 24,
  padBottom: 0,
  padLeft: 32,
  charInterval: 90,
  blurMin: 2,
  blurMax: 8,
  fadeMin: 0.12,
  fadeMax: 0.55,
};

export function OpeningAdminPage() {
  const { db, update } = useStore();
  const [expanded, setExpanded] = useState<string | null>(db.opening.quotes[0]?.id ?? null);
  const [preview, setPreview] = useState<OpeningQuote | null>(null);

  const patchQuote = (id: string, fn: (q: OpeningQuote) => void) =>
    update(
      (d) => {
        const q = d.opening.quotes.find((x) => x.id === id);
        if (q) fn(q);
      },
      { module: '开场页', action: '编辑文案', detail: `编辑左下角文案 #${id}` }
    );

  const patchStyle = (id: string, fn: (s: QuoteStyle) => void) =>
    patchQuote(id, (q) => fn(q.style));

  const addQuote = () => {
    const q: OpeningQuote = {
      id: uid(),
      text: '新文案：在这里写下想说的话。',
      enabled: true,
      style: { ...DEFAULT_STYLE },
    };
    update((d) => {
      d.opening.quotes.push(q);
    }, { module: '开场页', action: '新增文案', detail: '新增左下角文案一条' });
    setExpanded(q.id);
  };

  const removeQuote = (id: string) =>
    update((d) => {
      d.opening.quotes = d.opening.quotes.filter((x) => x.id !== id);
    }, { module: '开场页', action: '删除文案', detail: `删除左下角文案 #${id}` });

  return (
    <div>
      <PageHeader
        title="开场页管理"
        subtitle="开场标题图与左下角随机文案库。前端每次进入随机展示一条已启用文案。"
      />

      <SectionCard title="开场标题「恨海情天」" desc="上传自定义标题图（留空则使用排版文字 + 渐变浮现动画）">
        <div className="max-w-md">
          <ImagePicker
            value={db.opening.titleImageUrl}
            onChange={(v) =>
              update((d) => {
                d.opening.titleImageUrl = v;
              }, { module: '开场页', action: '更新标题图', detail: v ? '上传开场标题图' : '清除开场标题图' })
            }
            label="开场标题图"
            hint="建议透明背景 PNG，高度约 300px；上传后前端将优先显示该图片"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="左下角随机文案库"
        desc="无限条文案；每条独立配置字号 / 颜色 / 字距 / 行距 / 四边页边距 / 逐字速度 / 随机模糊与消隐范围。"
      >
        <div className="space-y-3">
          {db.opening.quotes.map((q) => {
            const open = expanded === q.id;
            return (
              <div key={q.id} className="rounded-[6px] border border-[var(--line)]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setExpanded(open ? null : q.id)}
                    className="focus-ring flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      size={14}
                      className={cx('shrink-0 text-[var(--muted)] transition-transform', open && 'rotate-180')}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs tracking-wider text-[var(--ink-soft)]">
                      {q.text.replaceAll('\n', ' / ')}
                    </span>
                    <span
                      className={cx(
                        'shrink-0 rounded-[2px] border px-1.5 py-0.5 text-[9px] tracking-[0.2em]',
                        q.enabled
                          ? 'border-[var(--accent)] text-[var(--accent)]'
                          : 'border-[var(--line)] text-[var(--muted)]'
                      )}
                    >
                      {q.enabled ? '启用' : '停用'}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`预览文案 ${q.text.slice(0, 8)}`}
                    onClick={() => setPreview(q)}
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="复制文案"
                    onClick={() =>
                      update((d) => {
                        d.opening.quotes.push({
                          ...structuredClone(q),
                          id: uid(),
                          text: q.text + '（副本）',
                        });
                      }, { module: '开场页', action: '复制文案', detail: `复制文案 #${q.id}` })
                    }
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="删除文案"
                    onClick={() => removeQuote(q.id)}
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {open && (
                  <div className="border-t border-dashed border-[var(--line)] p-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <Field label="文案内容（支持换行）">
                          <TextArea
                            rows={4}
                            value={q.text}
                            onChange={(e) => patchQuote(q.id, (x) => (x.text = e.target.value))}
                          />
                        </Field>
                        <ToggleRow
                          label="启用此文案"
                          checked={q.enabled}
                          onChange={(v) => patchQuote(q.id, (x) => (x.enabled = v))}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="字号 px">
                            {(() => {
                              const cur = q.style;
                              return (
                                <TextInput
                                  type="number"
                                  value={cur.fontSize}
                                  onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.fontSize = Number(e.target.value)))}
                                />
                              );
                            })()}
                          </Field>
                          <Field label="字距 em">
                            <TextInput
                              type="number"
                              step={0.05}
                              value={q.style.letterSpacing}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.letterSpacing = Number(e.target.value)))}
                            />
                          </Field>
                          <Field label="行距（倍数）">
                            <TextInput
                              type="number"
                              step={0.1}
                              value={q.style.lineHeight}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.lineHeight = Number(e.target.value)))}
                            />
                          </Field>
                          <Field label="文字颜色">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                aria-label="文案颜色"
                                value={q.style.color}
                                onChange={(e) => patchStyle(q.id, (s) => (s.color = e.target.value))}
                                className="h-9 w-12 rounded-[4px] border border-[var(--line)] bg-transparent"
                              />
                              <TextInput
                                value={q.style.color}
                                onChange={(e) => patchStyle(q.id, (s) => (s.color = e.target.value))}
                              />
                            </div>
                          </Field>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                          四边页边距 px（超出自动回行）
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {(
                            [
                              ['padTop', '上边距'],
                              ['padRight', '右边距'],
                              ['padBottom', '下边距'],
                              ['padLeft', '左边距'],
                            ] as const
                          ).map(([key, label]) => (
                            <Field key={key} label={label}>
                              <TextInput
                                type="number"
                                value={q.style[key]}
                                onChange={(e) =>
                                  e.target.value !== '' && patchStyle(q.id, (s) => (s[key] = Number(e.target.value)))
                                }
                              />
                            </Field>
                          ))}
                        </div>
                        <Field label="逐字出现间隔（ms）">
                          <TextInput
                            type="number"
                            value={q.style.charInterval}
                            onChange={(e) =>
                              e.target.value !== '' && patchStyle(q.id, (s) => (s.charInterval = Math.max(20, Number(e.target.value))))
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="随机模糊下限 px">
                            <TextInput
                              type="number"
                              value={q.style.blurMin}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.blurMin = Number(e.target.value)))}
                            />
                          </Field>
                          <Field label="随机模糊上限 px">
                            <TextInput
                              type="number"
                              value={q.style.blurMax}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.blurMax = Number(e.target.value)))}
                            />
                          </Field>
                          <Field label="消隐透明度下限 (0–1)">
                            <TextInput
                              type="number"
                              step={0.05}
                              value={q.style.fadeMin}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.fadeMin = Number(e.target.value)))}
                            />
                          </Field>
                          <Field label="消隐透明度上限 (0–1)">
                            <TextInput
                              type="number"
                              step={0.05}
                              value={q.style.fadeMax}
                              onChange={(e) => e.target.value !== '' && patchStyle(q.id, (s) => (s.fadeMax = Number(e.target.value)))}
                            />
                          </Field>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                          约 30% 字符保持清晰，其余字符随机在清晰与模糊消隐之间缓慢呼吸。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addQuote}
          className="focus-ring mt-4 flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Plus size={13} /> 新增一条文案
        </button>
      </SectionCard>

      {/* 动画预览 */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="文案动画预览"
        width="max-w-2xl"
      >
        {preview && (
          <div className="flex min-h-[240px] items-start justify-start bg-[var(--bg)] p-8">
            <QuoteText key={preview.id + String(Date.now())} quote={preview} />
          </div>
        )}
      </Modal>
    </div>
  );
}
