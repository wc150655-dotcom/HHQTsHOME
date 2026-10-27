/** 主页 —— 顶部导航 / 概况 / 卡项 / 陪玩入口 / 本月头牌 / 老板榜单 / 页脚 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { Navbar } from '../components/Navbar';
import { TeamOverview } from '../components/TeamOverview';
import { CardSection } from '../components/CardSection';
import { TopCompanionPanel } from '../components/TopCompanionPanel';
import { TopSpenderPanel } from '../components/TopSpenderPanel';
import { Footer } from '../components/Footer';
import { CompanionCard } from '../components/CompanionCard';
import { SectionHeader, Reveal, EmptyState } from '../components/ui';

/** 希腊铭文跑马灯 —— 明暗节奏的第一道重音 */
function MythMarquee() {
  const words = ['ΑΦΡΟΔΙΤΗ', 'ΑΠΟΛΛΩΝ', 'ΣΕΛΗΝΗ', 'ΜΟΙΡΑΙ', 'ΑΣΤΡΑΙΑ', '恨海情天', 'PURE LE', 'ΘΕΟΙ ΕΛΛΗΝΩΝ'];
  const row = words.map((w, i) => (
    <span key={i} className="flex shrink-0 items-center">
      <span className="font-display text-sm italic tracking-[0.4em] text-[var(--ink)]">{w}</span>
      <span aria-hidden="true" className="mx-8 h-1.5 w-1.5 rotate-45 bg-[var(--accent)]" />
    </span>
  ));
  return (
    <div className="ink-block greek-divider-wrap overflow-hidden border-y border-[var(--line)] py-5" aria-hidden="true">
      <div className="flex w-max marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}

export function HomePage() {
  const { db } = useStore();
  const active = db.companions.filter((c) => c.status === 'active').slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main className="relative z-10">
        <TeamOverview />

        {/* 希腊铭文跑马灯（墨色带） */}
        <MythMarquee />

        <CardSection />

        {/* 陪玩展示入口 */}
        <section
          id="companions"
          aria-label="陪玩展示"
          className="relative mx-auto max-w-[1400px] px-4 py-24 md:px-8 lg:px-16"
        >
          <SectionHeader
            no="03"
            title="陪玩展示"
            subtitle="按音色 / 游戏 / 服务类型组合筛选，找到与你最合拍的声音。"
            right={
              <Link
                to="/companions"
                className="focus-ring group inline-flex items-center gap-3 rounded-[4px] border border-[var(--line-strong)] px-6 py-3 text-xs tracking-[0.4em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                查看全部陪玩
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
          <div className="mt-12">
            {active.length === 0 ? (
              <EmptyState text="陪玩列表为空" sub="后台录入陪玩资料后将在前端展示" />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {active.map((c, i) => (
                  <Reveal key={c.id} delay={0.06 * i}>
                    <CompanionCard c={c} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <div aria-hidden="true" className="mx-auto h-px max-w-[1400px] bg-[var(--line)]" />

        {/* 本月头牌 —— 墨色全幅区块（明暗对比的视觉重音） */}
        <div className="ink-block relative">
          <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-25" />
          <TopCompanionPanel />
        </div>
        <TopSpenderPanel />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
