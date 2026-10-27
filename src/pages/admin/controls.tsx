/** 后台通用表单控件 —— 全站管理页面共用 */
import { useRef, useState, type ReactNode } from 'react';
import { Check, Copy, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { Modal, Toggle, EmptyState } from '../../components/ui';
import { cx, fileToCompressedDataUrl } from '../../lib/utils';
import { useStore } from '../../lib/store';

/* ---------- 字段容器 ---------- */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('block', className)}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-relaxed text-[var(--muted)]">{hint}</span>}
    </div>
  );
}

/* ---------- 基础输入 ---------- */
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('field-input', props.className)} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx('field-input min-h-[90px] resize-y leading-relaxed', props.className)} />;
}

/* ---------- 开关行 ---------- */
export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-[var(--line)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm tracking-wide text-[var(--ink)]">{label}</p>
        {hint && <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

/* ---------- 图片选择器（上传 / 链接 / 素材库 / 清除） ---------- */
export function ImagePicker({
  value,
  onChange,
  label = '图片',
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  hint?: string;
}) {
  const { db } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState('');
  const [picker, setPicker] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const data = await fileToCompressedDataUrl(f);
      onChange(data);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      alert('文件读取失败');
    }
  };

  return (
    <div className={cx('rounded-[6px] border border-[var(--line)] p-3')}>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--bg)]">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={16} className="text-[var(--muted)]" />
          )}
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="focus-ring rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-xs tracking-wider text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            上传文件
          </button>
          <button
            type="button"
            onClick={() => setUrlMode((v) => !v)}
            className="focus-ring rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-xs tracking-wider text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            粘贴链接
          </button>
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="focus-ring rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-xs tracking-wider text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            素材库
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="focus-ring flex items-center gap-1 rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:text-[var(--accent)]"
            >
              <X size={12} /> 清除
            </button>
          )}
        </div>
      </div>
      {urlMode && (
        <div className="mt-3 flex gap-2">
          <TextInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… 或 data:image/…"
          />
          <button
            type="button"
            className="focus-ring btn-accent shrink-0 rounded-[4px] px-4 text-xs tracking-wider"
            onClick={() => {
              if (url.trim()) {
                onChange(url.trim());
                setUrl('');
                setUrlMode(false);
              }
            }}
          >
            确定
          </button>
        </div>
      )}
      {hint && <p className="mt-2 text-[11px] text-[var(--muted)]">{hint}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <Modal open={picker} onClose={() => setPicker(false)} title="从素材库选择" width="max-w-2xl">
        {db.assets.length === 0 ? (
          <EmptyState text="素材库为空" sub="请先在「素材库」模块上传图片" />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {db.assets.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-label={`选择素材 ${a.name}`}
                onClick={() => {
                  onChange(a.url);
                  setPicker(false);
                }}
                className="focus-ring group overflow-hidden rounded-[4px] border border-[var(--line)] hover:border-[var(--accent)]"
              >
                <img src={a.url} alt={a.name} className="aspect-square w-full object-cover" />
                <span className="block truncate px-1.5 py-1 text-[10px] text-[var(--muted)]">{a.name}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ---------- 字符串列表编辑器 ---------- */
export function ListEditor({
  items,
  onChange,
  placeholder = '输入内容',
  addLabel = '添加一项',
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button
            type="button"
            aria-label="删除该项"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="focus-ring flex w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

/* ---------- 键值对编辑器（如头牌业绩数据） ---------- */
export interface Pair {
  label: string;
  value: string;
}
export function PairEditor({
  pairs,
  onChange,
}: {
  pairs: Pair[];
  onChange: (v: Pair[]) => void;
}) {
  return (
    <div className="space-y-2">
      {pairs.map((p, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={p.label}
            placeholder="指标名"
            className="!w-1/3"
            onChange={(e) => onChange(pairs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
          />
          <TextInput
            value={p.value}
            placeholder="数值"
            onChange={(e) => onChange(pairs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
          />
          <button
            type="button"
            aria-label="删除该指标"
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}
            className="focus-ring flex w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...pairs, { label: '', value: '' }])}
        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Plus size={13} /> 添加指标
      </button>
    </div>
  );
}

/* ---------- 两步确认按钮 ---------- */
export function ConfirmButton({
  onConfirm,
  children,
  confirmText = '再次点击确认',
  danger = false,
  className,
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmText?: string;
  danger?: boolean;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={cx(
        'focus-ring rounded-[4px] border px-4 py-2 text-xs tracking-wider transition-colors',
        danger
          ? armed
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-red-400/60 text-red-400 hover:border-red-500'
          : armed
            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
            : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
        className
      )}
    >
      {armed ? confirmText : children}
    </button>
  );
}

/* ---------- 复制链接按钮 ---------- */
export function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          window.setTimeout(() => setOk(false), 1200);
        } catch {
          /* noop */
        }
      }}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
    >
      {ok ? <Check size={13} className="text-[var(--accent)]" /> : <Copy size={13} />}
    </button>
  );
}

/* ---------- 页面标题 ---------- */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-[var(--ink)] md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed tracking-wide text-[var(--muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ---------- 卡片分区 ---------- */
export function SectionCard({
  title,
  desc,
  children,
  className,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('glass mb-6 p-5 md:p-6', className)}>
      <h2 className="text-sm font-semibold tracking-[0.2em] text-[var(--ink)]">{title}</h2>
      {desc && <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ---------- 主按钮 ---------- */
export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button type={type} onClick={onClick} className={cx('focus-ring btn-accent rounded-[4px] px-6 py-2.5 text-xs tracking-[0.3em]', className)}>
      {children}
    </button>
  );
}
