/** 页脚 —— 开发人员信息 · 档案袋式感谢名单 · 打赏区（50% 捐赠 + 台账公开） */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Modal, EmptyState, AnchorLink } from './ui';
import { Mail, QrCode, ChevronDown, HeartHandshake, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* ---------- 感谢名单（档案袋样式） ---------- */
function ThanksArchive() {
  const { db } = useStore();
  const [open, setOpen] = useState(false);
  const thanks = db.footer.thanks;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开感谢名单档案袋"
        className="focus-ring group flex items-center gap-2.5 rounded-[4px] border border-[var(--line)] px-4 py-2.5 text-xs tracking-[0.3em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Mail size={14} className="transition-transform group-hover:-translate-y-0.5" />
        感谢名单
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="感谢名单 · 档案袋" width="max-w-xl">
        {/* 档案袋造型 */}
        <div className="relative border border-[var(--line-strong)] bg-[var(--panel)] p-1">
          <div
            aria-hidden="true"
            className="absolute -top-6 left-6 flex h-6 w-44 items-center justify-center rounded-t-[4px] border border-b-0 border-[var(--line-strong)] bg-[var(--panel)] text-[10px] tracking-[0.35em] text-[var(--muted)]"
          >
            ARCHIVE · 名单
          </div>
          <div className="border border-dashed border-[var(--line-strong)] p-6">
            <p className="text-xs leading-relaxed tracking-wider text-[var(--ink-soft)]">
              感谢以下协助开发、提供灵感与支持的每一位 —— 档案留存，情义常新。
            </p>
            <div className="mt-5">
              {thanks.length === 0 ? (
                <EmptyState text="感谢名单暂未填写" />
              ) : (
                <ul className="divide-y divide-dashed divide-[var(--line)]">
                  {thanks.map((t, i) => (
                    <li key={t.id} className="flex items-start gap-4 py-3.5">
                      <span className="tnum shrink-0 pt-0.5 font-display text-sm italic text-[var(--muted)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base tracking-wider text-[var(--ink)]">
                          {t.name}
                        </p>
                        {t.note && (
                          <p className="mt-1 text-xs leading-relaxed tracking-wide text-[var(--muted)]">
                            {t.note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-6 text-right font-display text-xs italic tracking-[0.3em] text-[var(--muted)]">
              —— 恨海情天 纯LE
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ---------- 打赏区（二维码 + 捐赠承诺 + 台账） ---------- */
function DonationPanel() {
  const { db } = useStore();
  const [open, setOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const f = db.footer;
  const ledger = f.ledger;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开打赏二维码"
        className="focus-ring group flex items-center gap-2.5 rounded-[4px] border border-[var(--accent)] px-4 py-2.5 text-xs tracking-[0.3em] text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
      >
        <QrCode size={14} />
        打赏支持
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="感谢打赏 · 公益承诺" width="max-w-md">
        <div className="flex flex-col items-center">
          <div className="relative border border-[var(--line)] p-2">
            {f.donationQr ? (
              <img src={f.donationQr} alt="打赏二维码" className="h-52 w-52 object-contain" />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center text-xs tracking-widest text-[var(--muted)]">
                二维码待上传
              </div>
            )}
            <span aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[var(--ink)] opacity-60" />
            <span aria-hidden="true" className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[var(--ink)] opacity-60" />
          </div>
          <div className="mt-5 flex items-start gap-3 border border-[var(--line)] p-4">
            <HeartHandshake size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <p className="text-xs leading-loose tracking-wide text-[var(--ink-soft)]">
              {f.donationNote}
            </p>
          </div>

          {/* 往期台账 */}
          <div className="mt-5 w-full">
            <button
              type="button"
              aria-expanded={ledgerOpen}
              onClick={() => setLedgerOpen((v) => !v)}
              className="focus-ring flex w-full items-center justify-between border border-[var(--line)] px-4 py-3 text-left text-xs tracking-[0.25em] text-[var(--ink-soft)] transition-colors hover:border-[var(--line-strong)]"
            >
              往期打赏总收入记录 + 捐款记录（公开可查）
              <ChevronDown
                size={14}
                className="text-[var(--muted)] transition-transform"
                style={{ transform: ledgerOpen ? 'rotate(180deg)' : undefined }}
              />
            </button>
            <AnimatePresence initial={false}>
              {ledgerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border border-t-0 border-[var(--line)] p-4">
                    {ledger.length === 0 ? (
                      <EmptyState text="暂无台账记录" sub="打赏与捐款记录将在后台录入后公示" />
                    ) : (
                      <ul className="space-y-4">
                        {ledger.map((l) => (
                          <li key={l.id} className="border-l-2 border-[var(--line-strong)] pl-4">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-sm tracking-wider text-[var(--ink)]">{l.period}</p>
                              <p className="tnum text-xs text-[var(--muted)]">{l.date}</p>
                            </div>
                            <p className="tnum mt-1.5 text-xs tracking-wider text-[var(--ink-soft)]">
                              打赏收入 {l.income} · 捐款 {l.donated}
                            </p>
                            {l.proofUrl && (
                              <details className="mt-2">
                                <summary className="focus-ring inline-block cursor-pointer text-[11px] tracking-[0.2em] text-[var(--accent)] hover:underline">
                                  查看捐款凭证
                                </summary>
                                <img
                                  src={l.proofUrl}
                                  alt={`${l.period} 捐款凭证`}
                                  className="mt-2 max-h-64 rounded-[4px] border border-[var(--line)]"
                                  loading="lazy"
                                />
                              </details>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ---------- 页脚 ---------- */
export function Footer() {
  const { db } = useStore();
  const s = db.settings;
  const f = db.footer;
  const year = new Date().getFullYear();

  return (
    <footer id="about" aria-label="页脚" className="relative border-t border-[var(--line)]">
      <div aria-hidden="true" className="greek-divider" />
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 lg:px-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* 品牌区 */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              {s.logoUrl && <img src={s.logoUrl} alt="" className="h-10 w-10 rounded-sm" />}
              <div>
                <p className="font-display text-lg tracking-[0.2em] text-[var(--ink)]">{s.title}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.4em] text-[var(--muted)]">
                  {s.subtitle}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-xs leading-loose tracking-wide text-[var(--muted)]">
              {f.devNote || s.slogan}
            </p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
              {f.devText}
            </p>
          </div>

          {/* 感谢名单 / 打赏 */}
          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
              Archive · 档案
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <ThanksArchive />
              <DonationPanel />
            </div>
          </div>

          {/* 快速入口 */}
          <div className="md:col-span-3">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
              Entrance · 入口
            </p>
            <ul className="mt-5 space-y-3 text-xs tracking-[0.25em] text-[var(--ink-soft)]">
              <li>
                <AnchorLink id="overview" className="focus-ring hover:text-[var(--accent)]">陪玩团概况</AnchorLink>
              </li>
              <li>
                <AnchorLink id="cards" className="focus-ring hover:text-[var(--accent)]">卡项分区</AnchorLink>
              </li>
              <li>
                <AnchorLink id="top" className="focus-ring hover:text-[var(--accent)]">本月头牌</AnchorLink>
              </li>
              <li>
                <AnchorLink id="tarot" className="focus-ring hover:text-[var(--accent)]">老板消费前三</AnchorLink>
              </li>
              <li>
                <Link to="/companions" className="focus-ring hover:text-[var(--accent)]">
                  全部陪玩
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="focus-ring inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  <Settings size={12} />
                  超级管理员后台
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-[10px] tracking-[0.3em] text-[var(--muted)] md:flex-row">
          <p className="md:pl-44">© {year} {s.title} · 保留所有解释权</p>
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[var(--accent)]" />
            前端内容 100% 由后台动态渲染 · 数据实时同步
          </p>
        </div>
      </div>
    </footer>
  );
}
