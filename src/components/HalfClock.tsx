/**
 * 左侧半圆钟表 ——
 * · 只展示钟表左半边（半圆），贴在页面最左侧，右半部分裁切隐藏
 * · 罗马数字刻度 + 细轨道虚线 + 星点辅助线（黑白灰线稿）
 * · 指针跟随现实北京时间实时转动（永不停止）
 * · 音乐播放时表盘装饰缓慢旋转；暂停时装饰停止（指针照常走时）
 * · 唱片按钮隐藏在表盘正中心（右半被页面边缘裁切），点击控制音乐
 */
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { useBeijingNow } from '../hooks/useBeijingNow';
import { audio, type MusicState } from '../lib/audio';
import { useClickDouble } from './Vinyl';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const pad = (n: number) => String(n).padStart(2, '0');

function calcR(): number {
  if (typeof window === 'undefined') return 300;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 768) return Math.min(h * 0.34, w * 0.5, 190);
  return Math.min(h * 0.46, w * 0.42, 360);
}

export function HalfClock() {
  const { db } = useStore();
  const now = useBeijingNow();
  const [music, setMusic] = useState<MusicState>({ playing: false, track: null });
  const [R, setR] = useState<number>(calcR);

  useEffect(() => audio.subscribe(setMusic), []);
  useEffect(() => {
    const onResize = () => setR(calcR());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* 指针角度（连续累积，避免跨零时反向回旋） */
  const hDeg = ((now.h + now.m / 60) / 12) * 360;
  const mDeg = ((now.m + now.s / 60) / 60) * 360;
  const sDeg = ((now.s + now.ms / 1000) / 60) * 360;
  const acc = useRef({ h: hDeg, m: mDeg, s: sDeg });
  const fix = (t: number, p: number) => t + Math.round((p - t) / 360) * 360;
  const hA = fix(hDeg, acc.current.h);
  const mA = fix(mDeg, acc.current.m);
  const sA = fix(sDeg, acc.current.s);
  acc.current = { h: hA, m: mA, s: sA };

  const linked = db.settings.music.clockLinked;
  const spinning = linked && music.playing;
  const clicks = useClickDouble(() => audio.toggle(), () => audio.next());

  const rN = R * 0.84;
  const rV = Math.max(34, Math.min(R * 0.23, 54));

  const numerals = NUMERALS.map((label, i) => {
    const hh = i + 1;
    const aDeg = hh * 30 - 90;
    const rad = (aDeg * Math.PI) / 180;
    const x = R + Math.cos(rad) * rN;
    const y = R + Math.sin(rad) * rN;
    if (Math.cos(rad) > 0.02) return null; // 右半边不可见
    const anchor = Math.abs(Math.cos(rad)) < 0.06 ? 'end' : 'middle'; // VI / XII 贴边完整显示
    return (
      <text
        key={label}
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="central"
        fontFamily="'Playfair Display', Georgia, 'Songti SC', serif"
        fontSize={R * 0.095}
        fill="currentColor"
        opacity={0.8}
      >
        {label}
      </text>
    );
  });

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const rad = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const r1 = R * (major ? 0.925 : 0.948);
    const r2 = R * 0.975;
    ticks.push(
      <line
        key={i}
        x1={R + Math.cos(rad) * r1}
        y1={R + Math.sin(rad) * r1}
        x2={R + Math.cos(rad) * r2}
        y2={R + Math.sin(rad) * r2}
        stroke="currentColor"
        strokeWidth={major ? 1 : 0.5}
        opacity={major ? 0.55 : 0.28}
      />
    );
  }

  const rayAngles = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  const starOrbit = [
    [-0.9, 0.12],
    [-0.72, -0.28],
    [-0.5, -0.54],
    [-0.25, -0.62],
    [-0.04, -0.5],
    [-0.2, -0.3],
    [-0.1, -0.16],
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="半圆钟表 · 点击切换背景音乐，双击随机切歌"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          audio.toggle();
        }
      }}
      onClick={clicks.onClick}
      onDoubleClick={clicks.onDoubleClick}
      className="focus-ring fixed left-0 top-0 z-0 block h-screen select-none overflow-hidden opacity-45 md:opacity-90"
      style={{ width: R, color: 'var(--ink-soft)', opacity: 0.9 }}
    >
      <svg
        aria-hidden="true"
        className="absolute left-0 top-1/2 -translate-y-1/2"
        width={R * 2}
        height={R * 2}
        viewBox={`0 0 ${R * 2} ${R * 2}`}
      >
        <g transform={`translate(${R},${R})`}>
          {/* ---- 装饰层：随音乐缓慢旋转 ---- */}
          <g
            style={{
              animation: 'spinSlow 120s linear infinite',
              animationPlayState: spinning ? 'running' : 'paused',
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          >
            <circle r={R * 0.99} fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 7" opacity="0.6" />
            <circle r={R * 0.885} fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 11" opacity="0.5" />
            <circle r={R * 0.63} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <circle r={R * 0.34} fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 7" opacity="0.4" />
            {rayAngles.map((a, i) => (
              <line
                key={i}
                x1={Math.cos(a) * R * 0.36}
                y1={Math.sin(a) * R * 0.36}
                x2={Math.cos(a) * R * 0.99}
                y2={Math.sin(a) * R * 0.99}
                stroke="currentColor"
                strokeWidth="0.4"
                opacity={0.34}
              />
            ))}
            {/* 时辰星环 */}
            <g fill="currentColor">
              {rayAngles.map((a, i) => (
                <circle key={i} cx={Math.cos(a) * R * 0.34} cy={Math.sin(a) * R * 0.34} r={i % 3 === 0 ? 1.9 : 1.1} opacity={0.6} />
              ))}
              {rayAngles.map((a, i) => (
                <circle key={i} cx={Math.cos(a) * R * 0.63} cy={Math.sin(a) * R * 0.63} r={1.7} opacity={0.5} />
              ))}
              <circle cx={-R * 0.885} cy={0} r={2.6} opacity={0.7} />
              <circle cx={0} cy={-R * 0.885} r={2.6} opacity={0.7} />
              <circle cx={0} cy={R * 0.885} r={2.6} opacity={0.7} />
            </g>
            {/* 星座连线 */}
            <polyline
              points={starOrbit.map(([ux, uy]) => `${(ux * R).toFixed(1)},${(uy * R).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 5"
              opacity="0.5"
            />
            <g fill="currentColor">
              {starOrbit.map(([ux, uy], i) => (
                <circle key={i} cx={ux * R} cy={uy * R} r={i === 4 ? 2.2 : 1.4} opacity={0.65} />
              ))}
            </g>
            {/* 星点 */}
            {[
              [-0.72, -0.45],
              [-0.5, 0.62],
              [-0.86, 0.2],
            ].map(([ux, uy], i) => (
              <g key={i} transform={`translate(${ux * R},${uy * R})`} stroke="currentColor" strokeWidth="0.6" opacity={0.7}>
                <line x1={-5.5} y1={0} x2={5.5} y2={0} />
                <line x1={0} y1={-5.5} x2={0} y2={5.5} />
              </g>
            ))}
          </g>

          {/* ---- 刻度与罗马数字（固定） ---- */}
          {ticks}
          {numerals}

          {/* ---- 指针（现实北京时间） ---- */}
          <g
            style={{ transition: 'transform 0.25s linear' }}
            transform={`rotate(${hA})`}
          >
            <line x1={-R * 0.1} y1={0} x2={R * 0.42} y2={0} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" opacity={0.9} />
          </g>
          <g style={{ transition: 'transform 0.25s linear' }} transform={`rotate(${mA})`}>
            <line x1={-R * 0.12} y1={0} x2={R * 0.6} y2={0} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
          </g>
          <g style={{ transition: 'transform 0.25s linear' }} transform={`rotate(${sA})`}>
            <line x1={-R * 0.16} y1={0} x2={R * 0.72} y2={0} stroke="var(--accent)" strokeWidth={0.9} strokeLinecap="round" />
            <circle cx={0} cy={0} r={2.6} fill="var(--accent)" />
          </g>
          <circle r={4.6} fill="currentColor" opacity={0.9} />
          <circle r={1.8} fill="var(--bg)" />

          {/* ---- 隐藏在表盘中心的唱片（右半被页面边缘裁切） ---- */}
          <g style={{ pointerEvents: 'none' }}>
            <circle r={rV} fill="#131112" />
            <g
              style={{
                animation: 'vinylSpin 2.6s linear infinite',
                animationPlayState: music.playing ? 'running' : 'paused',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            >
              <circle r={rV * 0.72} fill="none" stroke="#2a2728" strokeWidth="0.8" />
              <circle r={rV * 0.5} fill="none" stroke="#232021" strokeWidth="0.8" />
              <circle r={rV * 0.28} fill="none" stroke="#2a2728" strokeWidth="0.8" />
            </g>
            <circle r={rV * 0.24} fill="var(--accent)" />
            <text
              y={rV * 0.07}
              textAnchor="middle"
              fontSize={rV * 0.17}
              fontWeight={600}
              fill="var(--accent-ink)"
            >
              LE
            </text>
          </g>

          {/* 北京时间 */}
          <text
            x={-R * 0.1}
            y={R * 0.58}
            textAnchor="start"
            fontSize={10.5}
            letterSpacing="0.18em"
            fill="currentColor"
            opacity={0.6}
            className="tnum"
          >
            北京时间 {pad(now.h24)}:{pad(now.m)}:{pad(now.s)}
          </text>
        </g>
      </svg>
      <span className="sr-only">
        {music.playing ? '音乐播放中' : '音乐已暂停'}，北京时间 {pad(now.h24)} 点 {pad(now.m)} 分 {pad(now.s)} 秒
      </span>
    </div>
  );
}
