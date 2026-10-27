/** 卡项分区 —— 冠卡 / 包陪卡 / VIP 卡 分组切换，玻璃卡片，悬浮浮起+发光 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Gem, Package } from 'lucide-react';
import { useStore } from '../lib/store';
import { SectionHeader, Reveal, EmptyState, Tag } from './ui';
import { cx, safeUrl } from '../lib/utils';
import type { CrownCard, PackageCard, VipCard } from '../lib/types';

type TabKey = 'crown' | 'packages' | 'vip';

const TABS: { key: TabKey; label: string; en: string; icon: typeof Crown }[] = [
  { key: 'crown', label: '冠卡', en: 'Crown', icon: Crown },
  { key: 'packages', label: '包陪卡', en: 'Package', icon: Package },
  { key: 'vip', label: 'VIP 卡', en: 'VIP', icon: Gem },
];

/* ---------- 冠卡 ---------- */
function CrownCardItem({ card, glow }: { card: CrownCard; glow: boolean }) {
  return (
    <article
      className={cx('glass group flex flex-col overflow-hidden p-0', glow && 'card-glow')}
      aria-label={`${card.name} 冠卡`}
    >
      <div className="relative overflow-hidden border-b border-[var(--line)]">
        <img src={card.imageUrl} alt={`${card.name} 卡面`} className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span aria-hidden="true" className="absolute left-3 top-3 border border-[var(--line)] bg-[var(--bg)]/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.4em] text-[var(--muted)] backdrop-blur-sm">
          Crown
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl tracking-widest text-[var(--ink)]">{card.name}</h3>
        <ul className="mt-4 space-y-2.5">
          {card.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-[var(--accent)]" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/* ---------- 包陪卡 ---------- */
function PackageCardItem({ card, glow, onConsult }: { card: PackageCard; glow: boolean; onConsult: (url: string) => void }) {
  return (
    <article
      className={cx('glass group flex flex-col overflow-hidden p-0', glow && 'card-glow')}
      aria-label={`${card.name} 包陪卡`}
    >
      <div className="relative overflow-hidden border-b border-[var(--line)]">
        <img src={card.imageUrl} alt={`${card.name} 卡面`} className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span aria-hidden="true" className="absolute left-3 top-3 border border-[var(--line)] bg-[var(--bg)]/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.4em] text-[var(--muted)] backdrop-blur-sm">
          Package
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl tracking-widest text-[var(--ink)]">{card.name}</h3>
          <p className="tnum font-display text-xl text-[var(--accent)]">{card.price}</p>
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">{card.duration}</p>
        <ul className="mt-4 flex-1 space-y-2.5">
          {card.services.map((sv, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-[var(--accent)]" />
              {sv}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onConsult(card.consultUrl)}
          className="focus-ring mt-5 w-full rounded-[4px] border border-[var(--line-strong)] py-2.5 text-xs tracking-[0.4em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          购买 / 咨询
        </button>
      </div>
    </article>
  );
}

/* ---------- VIP 卡 ---------- */
function VipCardItem({ card, glow, onConsult }: { card: VipCard; glow: boolean; onConsult: (url: string) => void }) {
  return (
    <article
      className={cx('glass group relative flex flex-col overflow-hidden p-0', glow && 'card-glow')}
      aria-label={`${card.name} VIP 卡`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5">
        <h3 className="font-display text-2xl tracking-widest text-[var(--ink)]">{card.name}</h3>
        {card.badgeUrl ? (
          <img src={card.badgeUrl} alt="专属标识" className="h-12 w-12 rounded-full border border-[var(--line)]" />
        ) : (
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent)] text-[var(--accent)]">
            <Gem size={18} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">Tiers · 充值档位</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {card.tiers.map((t, i) => (
            <div key={i} className="flex items-center justify-between border border-[var(--line)] px-3.5 py-2.5">
              <span className="text-xs tracking-[0.2em] text-[var(--ink-soft)]">{t.label}</span>
              <span className="tnum font-display text-sm text-[var(--accent)]">{t.price}</span>
            </div>
          ))}
        </div>
        <ul className="mt-5 flex-1 space-y-2.5">
          {card.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-[var(--accent)]" />
              {b}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onConsult(card.consultUrl)}
          className="focus-ring mt-5 w-full rounded-[4px] border border-[var(--line-strong)] py-2.5 text-xs tracking-[0.4em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          购买 / 咨询
        </button>
      </div>
    </article>
  );
}

/* ---------- 分区容器 ---------- */
export function CardSection() {
  const { db } = useStore();
  const glow = db.settings.effects.cardGlow;
  const [tab, setTab] = useState<TabKey>('crown');
  const cards = db.cards;

  const onConsult = (url: string) => {
    /* 外链仅放行 http/https/mailto，防协议注入；无有效链接则滚动到团队概况联系方式 */
    const safe = safeUrl(url);
    if (safe) window.open(safe, '_blank', 'noopener');
    else document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
  };

  const visible = {
    crown: cards.crown.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    packages: cards.packages.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    vip: cards.vip.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
  }[tab];

  const tabMeta = TABS.find((t) => t.key === tab)!;

  return (
    <section id="cards" aria-label="卡项分区" className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8 lg:px-16">
      <SectionHeader
        no="02"
        title="卡项分区"
        subtitle="冠卡 · 包陪卡 · VIP 卡 —— 每一种卡，都是一种被认真对待的方式。"
        right={          <div
            role="tablist"
            aria-label="卡项类型切换"
            className="flex rounded-[4px] border border-[var(--line)] p-1"
          >
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
                    'focus-ring flex items-center gap-2 rounded-[3px] px-4 py-2 text-xs tracking-[0.25em] transition-colors',
                    active
                      ? 'bg-[var(--ink)] text-[var(--bg)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  )}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <div aria-hidden="true" className="greek-divider mb-2 mt-8" />

      <div className="mt-10">
        <Reveal>
          <div className="mb-6 flex items-center gap-4" aria-hidden="true">
            <span className="font-display text-sm italic tracking-widest text-[var(--muted)]">
              {tabMeta.en}
            </span>
            <span className="h-px w-16 bg-[var(--line)]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              {visible.length} cards available
            </span>
          </div>
        </Reveal>
        {visible.length === 0 ? (
          <EmptyState text="该分类暂无上架卡项" sub="管理员可在后台添加并上架" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
            >
              {tab === 'crown' &&
                visible.map((c) => <CrownCardItem key={c.id} card={c as CrownCard} glow={glow} />)}
              {tab === 'packages' &&
                visible.map((c) => (
                  <PackageCardItem key={c.id} card={c as PackageCard} glow={glow} onConsult={onConsult} />
                ))}
              {tab === 'vip' &&
                visible.map((c) => <VipCardItem key={c.id} card={c as VipCard} glow={glow} onConsult={onConsult} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-12 flex items-center gap-4 border-t border-[var(--line)] pt-6">
          <Tag accent>提示</Tag>
          <p className="text-xs leading-relaxed tracking-wider text-[var(--muted)]">
            卡项细则以团内最新说明为准 · 具体价格与附赠服务请咨询直属接待
          </p>
        </div>
      </Reveal>
    </section>
  );
}
