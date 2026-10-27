/** 本月头牌专区 —— 第一名突出显示，含专属徽章与光效 */
import { useStore } from '../lib/store';
import { SectionHeader, Reveal, EmptyState, Badge, Tag } from './ui';
import { companionAvatar } from './CompanionCard';
import { laurelAsset } from '../lib/assets';
import { cx } from '../lib/utils';

export function TopCompanionPanel() {
  const { db } = useStore();
  const list = db.top.filter((t) => t.enabled).sort((a, b) => a.rank - b.rank);
  const first = list[0];
  const rest = list.slice(1);

  const avatarOf = (t: (typeof list)[number]) => {
    const linked = db.companions.find((c) => c.id === t.companionId);
    if (t.avatarUrl) return t.avatarUrl;
    if (linked) return companionAvatar(linked, db.options.avatarPresets);
    return db.options.avatarPresets[0] ?? '';
  };

  return (
    <section id="top" aria-label="本月头牌专区" className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8 lg:px-16">
      <SectionHeader
        no="04"
        title="本月头牌"
        subtitle="当月表现最好的陪玩 —— 头牌专属徽章与光效，荣耀可查。"
        right={
          <span className="hidden items-center gap-2 md:flex">
            <img src={laurelAsset} alt="" aria-hidden="true" className="h-4 w-auto opacity-80" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              ΔΑΦΝΗ · Monthly ranking
            </span>
          </span>
        }
      />

      {list.length === 0 ? (
        <div className="mt-12">
          <EmptyState text="本月头牌尚未公布" sub="后台配置后将在前端展示" />
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* 第一名：突出显示 */}
          {first && (
            <Reveal className="lg:col-span-7">
              <article
                aria-label={`本月头牌第一名 ${first.name}`}
                className="glass relative overflow-hidden p-8 md:p-10"
                style={first.glow ? { boxShadow: `0 30px 90px -40px ${first.glow}, 0 0 0 1px var(--accent-soft)` } : undefined}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-2xl"
                  style={{ background: first.glow || 'transparent' }}
                />
                <div className="flex items-start gap-3">
                  <span className="tnum font-display text-7xl italic leading-none text-[var(--line-strong)] md:text-8xl">
                    01
                  </span>
                  {first.badge && (
                    <Badge glow={first.glow}>{first.badge}</Badge>
                  )}
                </div>
                <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[4px] border border-[var(--line)] md:h-40 md:w-40">
                    <img src={avatarOf(first)} alt={`${first.name} 头像`} className="h-full w-full object-cover" loading="lazy" />
                    <span aria-hidden="true" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-3xl tracking-wider text-[var(--ink)] md:text-4xl">
                      {first.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {first.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {first.stats.map((st) => (
                        <div key={st.label} className="border-l border-[var(--line)] pl-4">
                          <p className="tnum font-display text-xl text-[var(--ink)] md:text-2xl">{st.value}</p>
                          <p className="mt-1 text-[10px] tracking-[0.3em] text-[var(--muted)]">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          )}

          {/* 第二、三名 */}
          <div className="space-y-6 lg:col-span-5">
            {rest.map((t, i) => (
              <Reveal key={t.id} delay={0.08 * (i + 1)}>
                <article
                  aria-label={`本月头牌第${t.rank}名 ${t.name}`}
                  className="glass card-glow flex items-center gap-5 p-5"
                >
                  <span className="tnum font-display text-4xl italic leading-none text-[var(--line-strong)]">
                    0{t.rank}
                  </span>
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border border-[var(--line)] md:h-20 md:w-20">
                    <img src={avatarOf(t)} alt={`${t.name} 头像`} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg tracking-wider text-[var(--ink)]">
                        {t.name}
                      </h3>
                      {t.badge && (
                        <span
                          className="shrink-0 rounded-[2px] border border-[var(--accent)] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-[var(--accent)]"
                          style={t.glow ? { boxShadow: `0 0 16px -6px ${t.glow}` } : undefined}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {t.tags.slice(0, 3).map((tg) => (
                        <Tag key={tg}>{tg}</Tag>
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
                      {t.stats.map((st) => (
                        <span key={st.label} className="text-[11px] tracking-wider text-[var(--muted)]">
                          {st.label} <span className="tnum text-[var(--ink-soft)]">{st.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
