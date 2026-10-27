/** 开场页 —— 「恨海情天」标题渐变浮现，左下角逐字生成 + 随机模糊消隐文案 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { useBeijingNow } from '../hooks/useBeijingNow';
import { useParallax, requestTiltPermission } from '../hooks/useParallax';
import { Vinyl } from './Vinyl';
import { constellationAsset } from '../lib/assets';
import type { OpeningQuote } from '../lib/types';

const pad = (n: number) => String(n).padStart(2, '0');

/* ============ 左下角逐字文案 ============ */
export function QuoteText({ quote }: { quote: OpeningQuote }) {
  const { db } = useStore();
  const fx = db.settings.effects.quoteFx;
  const st = quote.style;
  const chars = useMemo(() => Array.from(quote.text), [quote.text]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!fx) {
      setCount(chars.length);
      return;
    }
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= chars.length) window.clearInterval(t);
    }, Math.max(30, st.charInterval));
    return () => window.clearInterval(t);
  }, [quote.id, fx, st.charInterval, chars.length]);

  /* 每个字符独立的随机模糊 / 消隐参数（约 30% 字符保持清晰） */
  const rand = useMemo(
    () =>
      chars.map(() => {
        const staySharp = Math.random() < 0.3;
        return {
          staySharp,
          blur: st.blurMin + Math.random() * Math.max(0, st.blurMax - st.blurMin),
          fade: st.fadeMin + Math.random() * Math.max(0, st.fadeMax - st.fadeMin),
          dur: 6 + Math.random() * 10,
          delay: Math.random() * 6,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quote.id, chars.length]
  );

  return (
    <p
      className="max-w-[min(72vw,26rem)] whitespace-pre-wrap font-light"
      style={{
        fontSize: st.fontSize,
        color: st.color,
        letterSpacing: `${st.letterSpacing}em`,
        lineHeight: st.lineHeight,
        paddingTop: st.padTop,
        paddingRight: st.padRight,
        paddingBottom: st.padBottom,
        paddingLeft: st.padLeft,
      }}
      aria-label={quote.text}
    >
      {chars.slice(0, count).map((c, i) => {
        if (c === '\n') return <br key={i} />;
        const r = rand[i];
        if (!fx || r.staySharp) return <span key={i}>{c}</span>;
        return (
          <span
            key={i}
            className="quote-char"
            style={
              {
                '--qb': `${r.blur.toFixed(1)}px`,
                '--qf': r.fade.toFixed(2),
                '--qd': `${r.dur.toFixed(1)}s`,
                '--qdel': `${r.delay.toFixed(1)}s`,
              } as React.CSSProperties
            }
          >
            {c}
          </span>
        );
      })}
      {fx && count < chars.length && (
        <span aria-hidden="true" className="animate-blink inline-block text-[var(--accent)]">
          ▍
        </span>
      )}
    </p>
  );
}

/* ============ 开场页 ============ */
export function OpeningPage() {
  const { db } = useStore();
  const nav = useNavigate();
  const now = useBeijingNow();
  const fx = db.settings.effects;
  const off = useParallax(fx.parallax);

  const quotes = db.opening.quotes.filter((q) => q.enabled);
  const [quote] = useState<OpeningQuote | null>(() => {
    if (quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const titleImage = db.opening.titleImageUrl;
  const openHour = db.settings.openHour;
  const closeHour = db.settings.closeHour;

  const enter = () => {
    requestTiltPermission();
    nav('/home');
  };

  const titleChars = ['恨', '海', '情', '天'];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)]">
      {/* 背景构成：点阵 + 细线 + 轨道曲线 */}
      <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-40" />
      <div aria-hidden="true" className="absolute inset-y-0 left-[12%] hidden w-px bg-[var(--line)] md:block" />
      <div aria-hidden="true" className="absolute inset-y-0 right-[18%] hidden w-px bg-[var(--line)] md:block" />
      <svg
        aria-hidden="true"
        className="absolute right-[6%] top-[16%] hidden h-64 w-64 text-[var(--line-strong)] lg:block"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="86" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 8" />
        <ellipse cx="100" cy="100" rx="96" ry="34" stroke="currentColor" strokeWidth="0.7" transform="rotate(-28 100 100)" />
        <circle cx="100" cy="14" r="3" fill="currentColor" />
        <circle cx="166" cy="134" r="2.4" fill="currentColor" />
      </svg>
      <img
        src={constellationAsset}
        alt=""
        aria-hidden="true"
        className="absolute right-[5%] top-[46%] hidden w-72 opacity-50 xl:block"
      />

      {/* 顶部：Logo 与唱片 */}
      <motion.header
        className="relative z-10 flex items-start justify-between p-6 md:p-10"
        style={{
          transform: fx.parallax ? `translate(${off.x * -8}px, ${off.y * -6}px)` : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          {db.settings.logoUrl && (
            <img src={db.settings.logoUrl} alt="恨海情天 纯LE" className="h-11 w-11 rounded-sm" />
          )}
          <div className="leading-tight">
            <p className="font-display text-sm tracking-[0.3em] text-[var(--ink)]">
              {db.settings.title}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              {db.settings.subtitle}
            </p>
          </div>
        </div>
        <Vinyl size={46} showHint />
      </motion.header>

      {/* 中央标题 */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <motion.div
          className="select-none text-center"
          style={{
            transform: fx.parallax ? `translate(${off.x * -14}px, ${off.y * -10}px)` : undefined,
          }}
        >
          {titleImage ? (
            <motion.img
              src={titleImage}
              alt="恨海情天"
              initial={fx.titleReveal ? { opacity: 0, scale: 0.97, filter: 'blur(10px)' } : false}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="mx-auto max-h-[38vh] cursor-pointer object-contain"
              onClick={enter}
            />
          ) : (
            <button
              type="button"
              onClick={enter}
              aria-label="点击标题进入主界面"
              className="focus-ring group block"
            >
              <span className="flex items-baseline justify-center gap-[0.18em] font-display text-[17vw] font-bold leading-none tracking-[0.06em] text-[var(--ink)] md:text-[9rem] lg:text-[11rem]">
                {titleChars.map((c, i) => (
                  <motion.span
                    key={i}
                    className="title-char inline-block"
                    initial={fx.titleReveal ? { opacity: 0, y: 26, filter: 'blur(8px)' } : false}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.1, delay: 0.25 + i * 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {c}
                  </motion.span>
                ))}
              </span>
              {fx.titleReveal && (
                <motion.span
                  aria-hidden="true"
                  className="mt-2 block h-px w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 0.85 }}
                  transition={{ duration: 1.6, delay: 0.9, ease: 'easeInOut' }}
                />
              )}
              <motion.span
                className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-[var(--muted)] transition-colors group-hover:text-[var(--ink)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                <span aria-hidden="true" className="h-4 w-px bg-[var(--line-strong)]" />
                点击进入 · Enter the sea
                <span aria-hidden="true" className="h-4 w-px bg-[var(--line-strong)]" />
              </motion.span>
            </button>
          )}
          <p className="mt-8 font-display text-sm italic tracking-[0.35em] text-[var(--muted)]">
            {db.settings.slogan}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.5em] text-[var(--accent)]">
            ΘΕΟΙ ΕΛΛΗΝΩΝ · 众神见证
          </p>
        </motion.div>
      </main>

      {/* 左下角：逐字生成 + 随机模糊消隐文案 */}
      <motion.aside
        aria-label="随机文案"
        className="relative z-10 px-6 pb-6 md:absolute md:bottom-0 md:left-0 md:px-10 md:pb-10"
        style={{
          transform: fx.parallax ? `translate(${off.x * -10}px, ${off.y * -8}px)` : undefined,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="mb-3 flex items-center gap-3" aria-hidden="true">
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent)]" />
          <span className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
            ephemera · 碎语
          </span>
        </div>
        {quote ? (
          <QuoteText quote={quote} />
        ) : (
          <p className="text-sm text-[var(--muted)]">（左下角文案库为空）</p>
        )}
      </motion.aside>

      {/* 右下角：营业时间 + 北京时间 */}
      <motion.footer
        className="relative z-10 hidden px-10 pb-10 text-right md:absolute md:bottom-0 md:right-0 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">北京时间</p>
        <p className="tnum mt-1 font-display text-2xl text-[var(--ink)]">
          {pad(now.h24)}:{pad(now.m)}
          <span className="text-sm text-[var(--muted)]">:{pad(now.s)}</span>
        </p>
        <p className="mt-3 text-[10px] tracking-[0.3em] text-[var(--muted)]">
          营业 {openHour} – {closeHour} (GMT+8)
        </p>
      </motion.footer>
    </div>
  );
}
