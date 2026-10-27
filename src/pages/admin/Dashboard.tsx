/** 后台总览 —— 数据统计 / 快捷入口 / 数据导出导入与恢复默认 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Download,
  FileText,
  Image,
  Mic,
  RefreshCw,
  Sparkle,
  Sparkles,
  Trophy,
  Upload,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { buildDefaultDB } from '../../lib/defaultData';
import { getSession } from '../../lib/auth';
import { downloadJson } from '../../lib/utils';
import { PageHeader, SectionCard, ConfirmButton } from './controls';

export function Dashboard() {
  const { db, replace, update, addLog } = useStore();
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const me = getSession()?.username ?? 'admin';

  const stats = [
    { label: '在团陪玩', value: db.companions.filter((c) => c.status === 'active').length, icon: Mic, to: 'companions' },
    { label: '上架卡项', value: [...db.cards.crown, ...db.cards.packages, ...db.cards.vip].filter((c) => c.enabled).length, icon: CreditCard, to: 'cards' },
    { label: '头牌配置', value: db.top.filter((t) => t.enabled).length, icon: Trophy, to: 'top' },
    { label: '塔罗席位', value: db.tarot.filter((t) => t.configured).length, icon: Sparkle, to: 'tarot' },
    { label: '开场文案', value: db.opening.quotes.filter((q) => q.enabled).length, icon: Sparkles, to: 'opening' },
    { label: '素材数量', value: db.assets.length, icon: Image, to: 'assets' },
    { label: '台账期数', value: db.footer.ledger.length, icon: FileText, to: 'footer' },
    { label: '操作日志', value: db.logs.length, icon: RefreshCw, to: 'logs' },
  ];

  const doExport = () => {
    downloadJson(db, `恨海情天-数据备份-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const doImport = (file: File | undefined) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const next = JSON.parse(String(fr.result));
        replace(next);
        addLog({
          user: me,
          module: '系统',
          action: '导入数据',
          detail: `从备份文件 ${file.name} 导入全站数据`,
          sensitive: true,
        });
        setMsg('导入成功，全站数据已更新');
      } catch {
        setMsg('导入失败：文件格式不正确');
      }
    };
    fr.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <PageHeader
        title="总览"
        subtitle="全站内容 100% 由本后台驱动，前端零写死。所有修改实时生效并永久留痕。"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="glass card-glow focus-ring block p-5"
            >
              <div className="flex items-center justify-between">
                <span className="tnum font-display text-3xl text-[var(--ink)]">{s.value}</span>
                <Icon size={16} className="text-[var(--muted)]" />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                {s.label}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="快捷管理" desc="常用模块直达">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ['站点设置', 'site'],
              ['开场页文案库', 'opening'],
              ['团队概况', 'team'],
              ['陪玩管理', 'companions'],
              ['塔罗榜单', 'tarot'],
              ['账号权限', 'accounts'],
            ].map(([label, to]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="focus-ring flex items-center justify-between rounded-[4px] border border-[var(--line)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {label}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="数据管理" desc="备份 / 恢复 / 恢复出厂默认（危险操作请谨慎）">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={doExport}
              className="focus-ring flex items-center gap-2 rounded-[4px] border border-[var(--line)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Download size={14} /> 导出全站数据备份
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="focus-ring flex items-center gap-2 rounded-[4px] border border-[var(--line)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Upload size={14} /> 导入备份
            </button>
            <ConfirmButton
              danger
              confirmText="确认恢复默认数据？（不可撤销）"
              onConfirm={() => {
                const fresh = buildDefaultDB();
                fresh.accounts = db.accounts;
                fresh.logs = [
                  {
                    id: 'log-reset',
                    time: new Date().toISOString(),
                    user: me,
                    module: '系统',
                    action: '恢复默认',
                    detail: '全站数据已恢复为默认状态（保留账号与日志）',
                    sensitive: true,
                  },
                ];
                replace(fresh);
                setMsg('已恢复默认数据（账号与操作日志已保留）');
              }}
            >
              <span className="flex items-center gap-2">
                <RefreshCw size={14} /> 恢复默认数据
              </span>
            </ConfirmButton>
          </div>
          {msg && (
            <p role="status" className="mt-4 text-xs tracking-wider text-[var(--accent)]">
              {msg}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => doImport(e.target.files?.[0])}
          />
          <p className="mt-4 border-t border-dashed border-[var(--line)] pt-4 text-[11px] leading-relaxed text-[var(--muted)]">
            数据存储于本机浏览器 localStorage。多设备共享请定期「导出备份」并在另一台设备「导入」；后续接入服务端后可自动同步。
          </p>
        </SectionCard>
      </div>

      <SectionCard title="敏感数据保护说明" desc="Sensitive data policy">
        <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-[var(--ink-soft)]">
          <li>老板消费金额、昵称属于敏感数据，可在「塔罗榜单」与「站点设置」中独立开关打码 / 匿名。</li>
          <li>敏感操作日志（账号、榜单金额、数据导入等）永久留痕，禁止删除。</li>
          <li>全站敏感字段统一打码开关位于「站点设置 → 敏感信息」。</li>
        </ul>
      </SectionCard>
    </div>
  );
}
