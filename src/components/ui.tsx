/** 共享 UI 基础组件 —— 极简杂志风通用件 */
import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cx } from '../lib/utils';
import { emptyArt } from '../lib/assets';

/* ---------- 入场揭示（滚动进入视口淡入上移） ---------- */
export function Reveal({
  children,
  delay = 0,
  className,
  noAnim = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  noAnim?: boolean;
}) {
  if (noAnim)
    return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- 章节标题（杂志式编号 + 细线） ---------- */
export function SectionHeader({
  no,
  title,
  subtitle,
  right,
}: {
  no: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-display text-sm italic tracking-widest text-[var(--muted)]">
              {no}
            </span>
            <span aria-hidden="true" className="h-px w-12 bg-[var(--line-strong)]" />
            <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[var(--accent)]" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-wide text-[var(--ink)] md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed tracking-wider text-[var(--muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </Reveal>
  );
}

/* ---------- 标签 ---------- */
export function Tag({
  children,
  className,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] tracking-wider',
        accent
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'border-[var(--line)] text-[var(--ink-soft)]',
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- 徽章 ---------- */
export function Badge({ children, glow }: { children: ReactNode; glow?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--accent)] px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]"
      style={glow ? { boxShadow: `0 0 26px -8px ${glow}` } : undefined}
    >
      <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[var(--accent)]" />
      {children}
    </span>
  );
}

/* ---------- 模态框 ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cx('glass relative max-h-[86vh] w-full overflow-y-auto', width)}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] px-5 py-4 backdrop-blur-md">
              <h3 className="font-display text-lg tracking-wider text-[var(--ink)]">{title}</h3>
              <button
                type="button"
                aria-label="关闭"
                className="focus-ring text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 空状态 ---------- */
export function EmptyState({
  text = '此处内容尚未配置',
  sub,
  className,
}: {
  text?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-3 py-10 text-center', className)}>
      <img src={emptyArt} alt="" className="w-32 opacity-70" aria-hidden="true" />
      <p className="text-sm tracking-widest text-[var(--muted)]">{text}</p>
      {sub && <p className="text-xs tracking-wider text-[var(--muted)] opacity-70">{sub}</p>}
    </div>
  );
}

/* ---------- 开关 ---------- */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'focus-ring relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300',
        checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--line-strong)] bg-transparent'
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-300',
          checked ? 'left-[calc(100%-1.25rem)] bg-[var(--accent-ink)]' : 'left-0.5 bg-[var(--line-strong)]'
        )}
      />
    </button>
  );
}

/* ---------- 锚点滚动链接（SPA 内平滑滚动到页面区块） ---------- */
export function AnchorLink({
  id,
  children,
  className,
  onNavigate,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}

/* ---------- 细线分隔 ---------- */
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-1" aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--line)]" />
      {label && (
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">{label}</span>
      )}
      <span className="h-px flex-1 bg-[var(--line)]" />
    </div>
  );
}
