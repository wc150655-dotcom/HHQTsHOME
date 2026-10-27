/**
 * 老板消费前三专区 · 塔罗牌
 * —— 视觉秩序：第一名居中（人在电子设备上的视觉重心在中间），第二、第三分列左右
 * —— ⚠️ 敏感数据区域：老板昵称 / 消费金额受后台「匿名化 / 打码加密」开关控制，
 *    后台未配置数据时前端显示优雅空占位，布局不崩坏。
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { SectionHeader, Reveal, EmptyState, Badge } from './ui';
import { tarotBackImages, majorArcanaPlaceholder, laurelAsset } from '../lib/assets';
import { maskAmount, maskName, cx } from '../lib/utils';
import { ChevronDown, Crown, Moon, Star, Sun } from 'lucide-react';
import type { TarotSeat } from '../lib/types';

const SEAT_META = [
  { label: '第一名', back: '日牌', icon: Sun },
  { label: '第二名', back: '月牌', icon: Moon },
  { label: '第三名', back: '星牌', icon: Star },
];

function TarotSlot({ seat }: { seat: TarotSeat }) {
  const { db } = useStore();
  const flipAnim = db.settings.effects.tarotFlip;
  const globalMask = db.settings.sensitive.globalMask;
  const [flipped, setFlipped] = useState(false);
  const [openMinor, setOpenMinor] = useState<string | null>(null);
  const meta = SEAT_META[seat.rank - 1];
  const Icon = meta.icon;

  /* 敏感字段处理：后台开关决定匿名化 / 打码 */
  const showName =
    seat.configured && (seat.anonymous || globalMask) ? maskName(seat.bossName) : seat.bossName;
  const showAmount =
    seat.configured && (seat.maskAmount || globalMask) ? maskAmount(seat.amount) : seat.amount;

  return (
    <div className="flex flex-col items-center">
      {/* 塔罗牌主体 */}
      <button
        type="button"
        aria-label={`${meta.back} · ${meta.label}，点击翻面`}
        aria-pressed={flipped}
        onClick={() => setFlipped((v) => !v)}
        className="focus-ring group block w-full max-w-[250px]"
        style={{ perspective: 1400 }}
      >
        <motion.div
          className="relative aspect-[3/5] w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            flipAnim
              ? { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }
              : { duration: 0 }
          }
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 背面：日 / 月 / 星（固定顺序） */}
          <div
            className="absolute inset-0 overflow-hidden rounded-lg border border-[var(--line)] shadow-[0_24px_60px_-30px_var(--glow)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={tarotBackImages[seat.rank - 1]}
              alt={`${meta.back} 牌背`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          {/* 正面：大阿尔卡纳 */}
          <div
            className="absolute inset-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[#F4F2EF]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex h-full flex-col">
              <div className="relative flex-1 overflow-hidden border-b border-[#D8D5D0]">
                <img
                  src={seat.majorUrl || majorArcanaPlaceholder}
                  alt={seat.configured ? seat.majorName || '大阿尔卡纳主牌' : '未配置的塔罗牌'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {seat.glow && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-40 mix-blend-screen"
                    style={{ background: `radial-gradient(circle at 50% 30%, ${seat.glow}, transparent 70%)` }}
                  />
                )}
              </div>
              {seat.configured ? (
                <div className="space-y-1.5 p-4 text-[#1D1D1F]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-base font-semibold tracking-wider">
                      {showName}
                    </p>
                    {seat.badge && (
                      <span className="shrink-0 rounded-[2px] border border-[#9C3A3A] px-1.5 py-0.5 text-[9px] tracking-[0.15em] text-[#9C3A3A]">
                        {seat.badge}
                      </span>
                    )}
                  </div>
                  <p className="tnum text-xs tracking-wider text-[#494849]">
                    消费金额：{showAmount}
                    {seat.level && <span className="ml-2 text-[#86868B]">· {seat.level}</span>}
                  </p>
                  {seat.title && (
                    <p className="text-[10px] tracking-[0.2em] text-[#86868B]">{seat.title}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                  <p className="font-display text-sm tracking-[0.3em] text-[#494849]">静候揭晓</p>
                  <p className="text-[10px] tracking-[0.2em] text-[#86868B]">命运之牌 · 尚未配置</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </button>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
        <Icon size={12} className="text-[var(--accent)]" />
        {meta.label} · {meta.back}
      </div>

      {/* 翻面后展开的三张附属小牌 */}
      <AnimatePresence initial={false}>
        {flipped && seat.configured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-[250px] overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {seat.minors.map((m) => {
                const open = openMinor === m.id;
                return (
                  <div key={m.id} className={open ? 'col-span-3' : ''}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-label={`${m.title}，点击${open ? '收起' : '展开'}释义`}
                      onClick={() => setOpenMinor(open ? null : m.id)}
                      className="focus-ring group/minor block w-full overflow-hidden rounded-[4px] border border-[var(--line)] bg-[#F4F2EF] transition-transform hover:-translate-y-1"
                    >
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                        className={open ? 'aspect-[2/1] w-full object-cover' : 'aspect-[3/5] w-full object-cover'}
                        loading="lazy"
                      />
                      <span className="flex items-center justify-between px-2 py-1.5 text-[10px] tracking-wider text-[#494849]">
                        {m.title}
                        <ChevronDown
                          size={11}
                          className="transition-transform"
                          style={{ transform: open ? 'rotate(180deg)' : undefined }}
                        />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden rounded-b-[4px] border border-t-0 border-[var(--line)] bg-[var(--panel)] px-3 py-3 text-[11px] leading-relaxed text-[var(--ink-soft)]"
                        >
                          {m.meaning || '（暂无释义）'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopSpenderPanel() {
  const { db } = useStore();
  const seats = db.tarot;
  const anyConfigured = seats.some((s) => s.configured);

  /* 第一名居中（视觉重心），第二、第三分列左右 */
  const ordered = useMemo(() => {
    if (seats.length === 3) {
      const r1 = seats.find((s) => s.rank === 1);
      const r2 = seats.find((s) => s.rank === 2);
      const r3 = seats.find((s) => s.rank === 3);
      if (r1 && r2 && r3) return [r2, r1, r3];
    }
    return [...seats].sort((a, b) => a.rank - b.rank);
  }, [seats]);

  return (
    <section
      id="tarot"
      aria-label="老板消费前三专区"
      className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8 lg:px-16"
    >
      {/* ⚠️ 敏感数据区域标注 */}
      <SectionHeader
        no="05"
        title="老板消费前三"
        subtitle="命运三女神（Μοῖραι）以日 · 月 · 星纺线成牌，点击翻面揭晓。第一名居中之位 —— 视觉的焦点，命运的冠冕。"
        right={
          <span className="hidden items-center gap-2 md:flex">
            <img src={laurelAsset} alt="" aria-hidden="true" className="h-4 w-auto opacity-80" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              Μοῖραι · Tarot archive
            </span>
          </span>
        }
      />

      {/* 敏感数据提示（代码注释：SENSITIVE DATA AREA） */}
      <Reveal delay={0.1}>
        <p className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
          <Crown size={12} className="text-[var(--accent)]" />
          消费金额属敏感信息 · 支持匿名与打码显示
        </p>
      </Reveal>

      <div aria-hidden="true" className="greek-divider mb-12 mt-4" />

      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-6">
        {ordered.map((seat, i) => {
          const isCenter = seat.rank === 1 && seats.length === 3;
          return (
            <Reveal key={seat.id} delay={0.08 * i} className={isCenter ? 'sm:-translate-y-4' : undefined}>
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={cx(
                    'outline-num mb-3',
                    isCenter ? 'text-6xl opacity-90 md:text-7xl' : 'text-3xl opacity-50 md:text-4xl'
                  )}
                >
                  {String(seat.rank).padStart(2, '0')}
                </span>
                {isCenter && (
                  <span className="mb-4">
                    <Badge glow={seat.glow || undefined}>冠冕之位 · 视觉焦点</Badge>
                  </span>
                )}
                <div
                  className={cx(
                    'w-full transition-transform duration-700 ease-out',
                    isCenter && 'sm:scale-[1.08]'
                  )}
                >
                  <TarotSlot seat={seat} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {!anyConfigured && (
        <Reveal delay={0.2}>
          <EmptyState
            text="榜单静候命运安排"
            sub="后台配置老板信息后，翻面即可揭晓大阿尔卡纳与三张附属小牌"
            className="mt-12"
          />
        </Reveal>
      )}
    </section>
  );
}
