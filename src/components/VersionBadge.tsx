/** 左下角版本号 —— 内容由后台「站点设置 → 站点版本号」修改，空则不显示 */
import { useStore } from '../lib/store';

export function VersionBadge() {
  const { db } = useStore();
  const v = db.settings.siteVersion;
  if (!v) return null;
  return (
    <div
      aria-label={`站点版本 ${v}`}
      className="pointer-events-none fixed bottom-2.5 left-3 z-[70] flex select-none items-center gap-2 text-[10px] tracking-[0.25em] text-[var(--muted)] opacity-70"
    >
      <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-[var(--accent)]" />
      {v} · HENHAI QINGTIAN
    </div>
  );
}
