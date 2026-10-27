/** 陪玩详情页 —— 大图头像 / 全部标签 / 个性签名 / 可接服务与价格 / 历史战绩与评价 */
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { companionAvatar } from '../components/CompanionCard';
import { Tag, EmptyState, Divider, Reveal } from '../components/ui';

export function CompanionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useStore();
  const c = db.companions.find((x) => x.id === id);
  const opts = db.options;

  if (!c || c.status === 'left') {
    return (
      <div className="relative min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6">
          <EmptyState text="这位陪玩已离开团队或不存在" sub="她曾在这里留下过声音，祝她前程似锦" />
          <Link
            to="/companions"
            className="focus-ring mt-6 inline-flex items-center gap-2 text-xs tracking-[0.3em] text-[var(--accent)] hover:underline"
          >
            <ArrowLeft size={14} />
            返回全部陪玩
          </Link>
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    );
  }

  const avatar = companionAvatar(c, opts.avatarPresets);
  const voice = opts.voices.find((v) => v.id === c.voice)?.label ?? c.voice;
  const games = c.games.map((g) => opts.games.find((x) => x.id === g)?.label ?? g);
  const services = c.services.map((s) => opts.services.find((x) => x.id === s)?.label ?? s);
  const records = c.records.filter((r) => r.kind === 'record');
  const reviews = c.records.filter((r) => r.kind === 'review');

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1100px] px-4 pb-24 pt-28 md:px-8">
        <Reveal>
          <Link
            to="/companions"
            className="focus-ring inline-flex items-center gap-2 text-xs tracking-[0.3em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft size={14} />
            返回全部陪玩
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-12 md:grid-cols-12">
          {/* 大图头像 */}
          <div className="md:col-span-5">
            <Reveal>
              <figure className="relative">
                <div aria-hidden="true" className="absolute -left-3 -top-3 -z-10 h-full w-full border border-[var(--line-strong)]" />
                <div className="relative aspect-[4/5] overflow-hidden border border-[var(--line)] bg-[var(--panel)]">
                  {avatar ? (
                    <img src={avatar} alt={`${c.nickname} 大头像`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-8xl text-[var(--muted)]">
                      {c.nickname.slice(0, 1)}
                    </span>
                  )}
                  <span aria-hidden="true" className="absolute left-4 top-4 h-5 w-5 border-l border-t border-[var(--ink)] opacity-60" />
                  <span aria-hidden="true" className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-[var(--ink)] opacity-60" />
                </div>
                <figcaption className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                  <span>Portrait — {c.nickname}</span>
                  <span>No. {c.id.slice(0, 6).toUpperCase()}</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* 信息区 */}
          <div className="md:col-span-7">
            <Reveal delay={0.08}>
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">Companion · 陪玩档案</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-wide text-[var(--ink)] md:text-5xl">
                {c.nickname}
              </h1>
              <p className="mt-4 font-display text-lg italic leading-relaxed text-[var(--ink-soft)]">
                “{c.signature || c.shortIntro}”
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-6 flex flex-wrap gap-2">
                <Tag accent>{voice}</Tag>
                {services.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
                {games.map((g) => (
                  <Tag key={g}>{g}</Tag>
                ))}
                {c.extra.showTags &&
                  c.extra.tags.map((t) => (
                    <span key={t} className="text-[10px] tracking-[0.2em] text-[var(--muted)]">
                      #{t}
                    </span>
                  ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 border border-[var(--line)] p-6">
                <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">详细简介</p>
                <p className="mt-4 text-sm leading-loose tracking-wide text-[var(--ink-soft)]">
                  {c.detail || c.shortIntro || '（暂无详细简介）'}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-8 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
                {[
                  { k: '段位', v: c.rank || '—' },
                  { k: '特长', v: c.specialty || '—' },
                  { k: '价格', v: c.price || '—' },
                  {
                    k: '接单时段',
                    v: c.extra.showHours && c.extra.hours ? c.extra.hours : '—',
                  },
                ].map((row) => (
                  <div key={row.k} className="bg-[var(--bg)] p-4">
                    <dt className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">{row.k}</dt>
                    <dd className="tnum mt-2 text-sm tracking-wider text-[var(--ink)]">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {c.extra.showAge && (
              <Reveal delay={0.26}>
                <p className="mt-5 text-xs tracking-[0.25em] text-[var(--muted)]">
                  年龄 {c.extra.age || '—'}
                  {c.extra.showSocial &&
                    c.extra.social
                      .filter((s) => !s.hidden)
                      .map((s) => (
                        <span key={s.platform} className="ml-4">
                          {s.platform}：{s.account}
                        </span>
                      ))}
                </p>
              </Reveal>
            )}
          </div>
        </div>

        <div className="mt-16">
          <Divider label="Records · 战绩与评价" />
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <Reveal>
              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
                  历史战绩
                </p>
                {records.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">暂无战绩记录</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {records.map((r) => (
                      <li key={r.id} className="border-l-2 border-[var(--line-strong)] pl-4">
                        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{r.content}</p>
                        <p className="tnum mt-1 text-[10px] tracking-[0.25em] text-[var(--muted)]">{r.date}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">
                  用户评价
                </p>
                {reviews.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">暂无评价</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {reviews.map((r) => (
                      <li key={r.id} className="border-l-2 border-[var(--accent)] pl-4">
                        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{r.content}</p>
                        <p className="tnum mt-1 text-[10px] tracking-[0.25em] text-[var(--muted)]">{r.date}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
