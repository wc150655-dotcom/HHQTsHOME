/** 陪玩团概况区 —— 编辑式排版：顶部横向文字区 / 左侧大主图 / 左下短文字 / 右侧竖置+横置文案框 */
import { useState } from 'react';
import { Reveal, Tag } from './ui';
import { useStore } from '../lib/store';
import { laurelAsset } from '../lib/assets';
import { safeUrl } from '../lib/utils';
import { Check, Copy } from 'lucide-react';

function ContactRow({
  role,
  name,
  contact,
  note,
  copied,
  onCopy,
}: {
  role: string;
  name: string;
  contact: string;
  note: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 hairline-b last:border-b-0">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="shrink-0 text-[11px] tracking-[0.15em] text-[var(--muted)]">{role}</span>
        <span className="truncate text-sm text-[var(--ink)]">{name}</span>
        {note && (
          <span className="hidden shrink-0 text-[10px] tracking-wider text-[var(--muted)] md:inline">
            {note}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`复制 ${role} ${name} 的联系方式`}
        className="focus-ring flex shrink-0 items-center gap-1.5 text-xs tracking-wider text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
      >
        {copied ? <Check size={12} className="text-[var(--accent)]" /> : <Copy size={12} />}
        <span className="tnum">{contact}</span>
      </button>
    </div>
  );
}

/** 直属接待 —— 宽松纵向排版，职位 / 昵称 / 联系方式各占一行，名字完整展示 */
function ReceptionRow({
  role,
  name,
  contact,
  copied,
  onCopy,
}: {
  role: string;
  name: string;
  contact: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 hairline-b last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">{role}</p>
        <p className="mt-1.5 break-words text-[15px] tracking-wide text-[var(--ink)]">{name}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`复制 ${role} ${name} 的联系方式`}
        className="focus-ring flex shrink-0 items-center gap-1.5 rounded-[3px] border border-[var(--line)] px-2.5 py-1.5 text-xs tracking-wider text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {copied ? <Check size={12} className="text-[var(--accent)]" /> : <Copy size={12} />}
        <span className="tnum max-w-[9rem] truncate">{contact}</span>
      </button>
    </div>
  );
}

export function TeamOverview() {
  const { db } = useStore();
  const s = db.settings;
  const t = db.team;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      /* 剪贴板不可用 */
    }
  };

  return (
    <section id="overview" aria-label="陪玩团概况" className="relative mx-auto max-w-[1400px] px-4 pb-24 pt-28 md:px-8 lg:px-16">
      {/* 顶部横向文字排版区 */}
      <Reveal>
        <div className="relative border-b border-[var(--line)] pb-8">
          <span
            aria-hidden="true"
            className="outline-num pointer-events-none absolute -top-10 right-2 hidden text-[9rem] opacity-50 lg:block"
          >
            Α
          </span>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3">
                <img src={laurelAsset} alt="" aria-hidden="true" className="h-4 w-auto opacity-90" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">
                  Companion Guild · 陪玩团概况
                </p>
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-wide text-[var(--ink)] md:text-6xl">
                恨海情天
                <span className="ml-4 align-middle font-light italic text-[var(--muted)] md:text-3xl">
                  纯 LE
                </span>
              </h1>
              <p className="mt-3 font-display text-sm italic tracking-[0.3em] text-[var(--accent)]">
                ΑΦΡΟΔΙΤΗ ΕΚ ΘΑΛΑΣΣΗΣ · 爱自恨海中升起
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed tracking-wider text-[var(--muted)]">
                {s.slogan}
              </p>
            </div>
            {/* 数据条 */}
            <div className="flex gap-10 text-right md:gap-14">
              <div>
                <p className="tnum font-display text-4xl text-[var(--ink)] md:text-5xl">
                  {t.memberCount || '—'}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">在团人数</p>
              </div>
              <div>
                <p className="tnum font-display text-4xl text-[var(--ink)] md:text-5xl">
                  {t.serviceGames.length}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">服务游戏</p>
              </div>
              <div className="hidden md:block">
                <p className="tnum font-display text-2xl leading-[3.2rem] text-[var(--ink)]">
                  {s.openHour}–{s.closeHour}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">营业时间 · 北京时间</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* 左侧：大矩形主图展示框 + 左下角短文字 */}
        <div className="lg:col-span-7">
          <Reveal>
            <figure className="relative">
              <div
                aria-hidden="true"
                className="absolute -left-3 -top-3 -z-10 h-full w-full border border-[var(--line-strong)]"
              />
              <div className="relative overflow-hidden border border-[var(--line)] bg-[var(--panel)]">
                <img
                  src={s.heroUrl}
                  alt="恨海情天 纯LE 主视觉"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
                <span aria-hidden="true" className="absolute left-4 top-4 h-6 w-6 border-l border-t border-[var(--ink)] opacity-60" />
                <span aria-hidden="true" className="absolute bottom-4 right-4 h-6 w-6 border-b border-r border-[var(--ink)] opacity-60" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                <span>Fig. 01 — {s.title} · 诸神见证</span>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[var(--accent)]" />
                  Beijing · GMT+8
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex items-start gap-6">
              <span aria-hidden="true" className="mt-2 h-px w-10 shrink-0 bg-[var(--line-strong)]" />
              <div>
                <p className="font-display text-xl leading-relaxed text-[var(--ink-soft)] md:text-2xl">
                  「{s.slogan}」
                </p>
                <p className="mt-4 max-w-lg text-sm leading-loose tracking-wide text-[var(--muted)]">
                  {s.intro}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="mr-3 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
                服务游戏
              </span>
              {t.serviceGames.length === 0 && (
                <span className="text-xs text-[var(--muted)]">暂无</span>
              )}
              {t.serviceGames.map((g) => (
                <Tag key={g}>{g}</Tag>
              ))}
              <span className="ml-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] md:hidden">
                营业 {s.openHour}–{s.closeHour}
              </span>
            </div>
          </Reveal>
        </div>

        {/* 右侧：竖置短文案框 + 横置短文案框 */}
        <div className="relative lg:col-span-5">
          <div
            aria-hidden="true"
            className="writing-vertical absolute -left-7 top-2 hidden text-[11px] uppercase tracking-[0.5em] text-[var(--muted)] lg:block"
          >
            HATE SEA · LOVE SKY — PURE LE
          </div>

          <div className="space-y-8 lg:pl-10">
            {/* 横置简介框 */}
            <Reveal delay={0.05}>
              <div className="relative border border-[var(--line)] p-6">
                <span aria-hidden="true" className="absolute -right-2 -top-2 h-6 w-6 border-r border-t border-[var(--line-strong)]" />
                <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">About us · 团队简介</p>
                <p className="mt-4 text-sm leading-loose tracking-wide text-[var(--ink-soft)]">
                  {s.intro}
                </p>
              </div>
            </Reveal>

            {/* 团内联系方式 */}
            <Reveal delay={0.1}>
              <div className="border border-[var(--line)] p-6">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
                    团内联系方式
                  </p>
                  <p className="text-[10px] tracking-[0.2em] text-[var(--muted)]">添加备注来意</p>
                </div>
                <div className="mt-3">
                  {t.leadership.map((l) => (
                    <ContactRow
                      key={l.id}
                      role={l.role}
                      name={l.name}
                      contact={l.contact}
                      note={l.note}
                      copied={copied === l.id}
                      onCopy={() => copy(l.id, l.contact)}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 点单方式 */}
            <Reveal delay={0.15}>
              <div className="border border-[var(--line)] p-6 md:p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
                    点单方式 · 直属接待
                  </p>
                  <p className="text-[10px] tracking-[0.25em] text-[var(--muted)]">点击复制联系方式</p>
                </div>
                <div className="mt-2">
                  {t.reception.map((r) => (
                    <ReceptionRow
                      key={r.id}
                      role={r.role}
                      name={r.name}
                      contact={r.contact}
                      copied={copied === r.id}
                      onCopy={() => copy(r.id, r.contact)}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 应聘 / 下单入口（外链仅放行 http/https/mailto，防协议注入） */}
            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-4">
                <a
                  href={safeUrl(t.orderUrl) || '#cards'}
                  onClick={
                    !safeUrl(t.orderUrl)
                      ? (e) => {
                          e.preventDefault();
                          document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      : undefined
                  }
                  className="focus-ring btn-accent rounded-[4px] px-8 py-3 text-xs tracking-[0.4em]"
                >
                  立即下单
                </a>
                <a
                  href={safeUrl(t.applyUrl) || '#about'}
                  onClick={
                    !safeUrl(t.applyUrl)
                      ? (e) => {
                          e.preventDefault();
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      : undefined
                  }
                  className="focus-ring rounded-[4px] border border-[var(--line-strong)] px-8 py-3 text-xs tracking-[0.4em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  应聘加入
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
