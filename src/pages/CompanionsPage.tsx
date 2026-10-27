/** 全部陪玩页 —— 组合筛选 + 网格展示 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  CompanionCard,
  CompanionFilter,
  CompanionEmpty,
  EMPTY_FILTER,
  filterCompanions,
  type FilterState,
} from '../components/CompanionCard';
import { SectionHeader, Reveal } from '../components/ui';

export function CompanionsPage() {
  const { db } = useStore();
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const active = useMemo(() => db.companions.filter((c) => c.status === 'active'), [db.companions]);
  const list = useMemo(() => filterCompanions(active, filter), [active, filter]);
  const count = active.length;

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 pt-28 md:px-8 lg:px-16">
        <Reveal>
          <Link
            to="/home"
            className="focus-ring inline-flex items-center gap-2 text-xs tracking-[0.3em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft size={14} />
            返回主页
          </Link>
        </Reveal>

        <div className="mt-8">
          <SectionHeader
            no="03"
            title="全部陪玩"
            subtitle={`在团陪玩 ${count} 位 · 支持音色 / 游戏 / 服务类型多条件组合筛选`}
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3" aria-label="筛选条件">
            <div className="glass sticky top-24 p-5">
              <CompanionFilter value={filter} onChange={setFilter} />
            </div>
          </aside>
          <div className="lg:col-span-8 xl:col-span-9">
            <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">
              Results · {list.length}
            </p>
            {list.length === 0 ? (
              <CompanionEmpty
                onClear={
                  filter.voices.length + filter.games.length + filter.services.length > 0
                    ? () => setFilter(EMPTY_FILTER)
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {list.map((c, i) => (
                  <Reveal key={c.id} delay={0.04 * (i % 4)}>
                    <CompanionCard c={c} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
