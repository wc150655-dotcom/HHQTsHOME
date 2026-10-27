/** 站点设置 —— 基础信息 / 日夜间 / 全局动效开关 / 背景音乐系统 / 敏感信息 · 改动即自动保存 */
import { useEffect, useRef, useState } from 'react';
import { Loader2, Pause, Play, Plus, Save, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { MusicTrack, SiteSettings } from '../../lib/types';
import { audio } from '../../lib/audio';
import { putBlob, removeBlob } from '../../lib/blobStore';
import {
  Field,
  ImagePicker,
  PageHeader,
  PrimaryButton,
  SectionCard,
  TextArea,
  TextInput,
  ToggleRow,
} from './controls';

const ACCENT_PRESETS = ['#8F6A2B', '#9C3A3A', '#1F3A5F', '#3A5F3A', '#6B4C9A', '#131112'];

export function SiteSettingsPage() {
  const { db, update } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(() => structuredClone(db.settings));
  const [saved, setSaved] = useState(false);
  const audioFileRef = useRef<HTMLInputElement>(null);
  const [audioName, setAudioName] = useState('');
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const setFx = (k: keyof SiteSettings['effects'], v: boolean) =>
    setDraft((d) => ({ ...d, effects: { ...d.effects, [k]: v } }));
  const setMusic = <K extends keyof SiteSettings['music']>(k: K, v: SiteSettings['music'][K]) =>
    setDraft((d) => ({ ...d, music: { ...d.music, [k]: v } }));

  const save = (silent = false) => {
    update(
      (d) => {
        d.settings = draft;
      },
      silent
        ? undefined
        : { module: '站点设置', action: '更新配置', detail: '站点全局配置已更新' }
    );
    if (!silent) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    }
  };

  /* 改动即自动保存（防抖 900ms），无需手动点击 */
  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(db.settings)) return;
    const t = window.setTimeout(() => save(true), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  /* 上传本地音频：文件存入浏览器 IndexedDB（可容纳大文件），曲目元数据存数据库 */
  const addTrack = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) {
      alert('音频文件过大（超过 80MB）。建议压缩后上传，或使用外链地址。');
      if (audioFileRef.current) audioFileRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const blobKey = 'audio-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      await putBlob(blobKey, file);
      const track: MusicTrack = {
        id: 'tr-' + Date.now().toString(36),
        name: audioName || file.name.replace(/\.[^.]+$/, ''),
        url: '',
        blobKey,
      };
      update((d) => {
        d.tracks.push(track);
      }, { module: '站点设置', action: '上传音乐', detail: `上传背景音乐《${track.name}》（${(file.size / 1024 / 1024).toFixed(1)}MB）` });
      setAudioName('');
      if (audioFileRef.current) audioFileRef.current.value = '';
    } catch (e) {
      alert('上传失败：' + (e instanceof Error ? e.message : '浏览器存储不可用'));
    } finally {
      setUploading(false);
    }
  };

  const deleteTrack = (t: MusicTrack) => {
    if (audio.current?.id === t.id) audio.pause();
    if (t.blobKey) {
      audio.invalidate(t.blobKey);
      void removeBlob(t.blobKey).catch(() => undefined);
    }
    update((d) => {
      d.tracks = d.tracks.filter((x) => x.id !== t.id);
    }, { module: '站点设置', action: '删除音乐', detail: `删除背景音乐《${t.name}》` });
  };

  return (
    <div>
      <PageHeader
        title="站点设置"
        subtitle="全站总控：基础信息、日夜间模式、动效开关、背景音乐系统、敏感信息打码。"
        actions={
          <PrimaryButton onClick={save}>
            <span className="flex items-center gap-2">
              <Save size={13} />
              {saved ? '已保存 ✓' : '保存设置'}
            </span>
          </PrimaryButton>
        }
      />

      <SectionCard title="站点基础信息" desc="标题、简介、Logo、主视觉图与营业时间（北京时间）">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="网站标题">
            <TextInput value={draft.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="网站副标题（英文）">
            <TextInput value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </Field>
          <Field label="团标语" className="md:col-span-2">
            <TextInput value={draft.slogan} onChange={(e) => set('slogan', e.target.value)} />
          </Field>
          <Field label="团队简介（长文本）" className="md:col-span-2">
            <TextArea rows={4} value={draft.intro} onChange={(e) => set('intro', e.target.value)} />
          </Field>
          <Field label="站点版本号" hint="显示在前台左下角；留空则不显示">
            <TextInput
              value={draft.siteVersion}
              placeholder="如：v1.2.0"
              onChange={(e) => set('siteVersion', e.target.value)}
            />
          </Field>
          <Field label="营业开始（北京时间）">
            <TextInput type="time" value={draft.openHour} onChange={(e) => set('openHour', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="网站 Logo">
            <ImagePicker value={draft.logoUrl} onChange={(v) => set('logoUrl', v)} hint="建议正方形，透明或白底" />
          </Field>
          <Field label="首页主视觉图">
            <ImagePicker value={draft.heroUrl} onChange={(v) => set('heroUrl', v)} hint="建议 4:3 或 16:10 横图" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Favicon（浏览器标签图标）" hint="留空则使用默认图标">
            <ImagePicker value={draft.faviconUrl} onChange={(v) => set('faviconUrl', v)} label="Favicon" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="营业开始（北京时间）">
              <TextInput type="time" value={draft.openHour} onChange={(e) => set('openHour', e.target.value)} />
            </Field>
            <Field label="营业结束（北京时间）">
              <TextInput type="time" value={draft.closeHour} onChange={(e) => set('closeHour', e.target.value)} />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="日间 / 夜间模式" desc="后台默认主题；访客也可在导航栏自行切换（切换后以访客偏好优先）">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['light', '日间（纸感白）'],
              ['dark', '夜间（墨黑）'],
              ['auto', '跟随系统'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={draft.themeMode === v}
              onClick={() => set('themeMode', v)}
              className={
                'focus-ring rounded-[4px] border px-4 py-2 text-xs tracking-[0.25em] transition-colors ' +
                (draft.themeMode === v
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]')
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="强调色（10% 核心色）" hint="仅用于关键行动点，保持整体单色调性">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={draft.accent}
                onChange={(e) => set('accent', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-[4px] border border-[var(--line)] bg-transparent"
                aria-label="选择强调色"
              />
              <TextInput
                value={draft.accent}
                onChange={(e) => set('accent', e.target.value)}
                className="!w-32"
              />
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`使用颜色 ${c}`}
                  onClick={() => set('accent', c)}
                  className="focus-ring h-7 w-7 rounded-full border border-[var(--line)]"
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="全局动效设置" desc="每一项动效都可独立开关，立即在前台生效">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleRow label="圆点自定义光标" hint="光标变为圆点形状，大小适中" checked={draft.effects.dotCursor} onChange={(v) => setFx('dotCursor', v)} />
          <ToggleRow label="开场标题渐变浮现" hint="「恨海情天」标题逐字渐变浮现动画" checked={draft.effects.titleReveal} onChange={(v) => setFx('titleReveal', v)} />
          <ToggleRow label="UI 动捕晃动" hint="界面随鼠标 / 手机陀螺仪轻微晃动" checked={draft.effects.parallax} onChange={(v) => setFx('parallax', v)} />
          <ToggleRow label="塔罗牌翻面动画" hint="老板消费前三塔罗牌翻面过渡" checked={draft.effects.tarotFlip} onChange={(v) => setFx('tarotFlip', v)} />
          <ToggleRow label="卡片悬浮发光浮起" hint="卡项 / 陪玩卡片 hover 效果" checked={draft.effects.cardGlow} onChange={(v) => setFx('cardGlow', v)} />
          <ToggleRow label="左下角逐字 + 模糊消隐" hint="开场页左下角文案动画" checked={draft.effects.quoteFx} onChange={(v) => setFx('quoteFx', v)} />
        </div>
      </SectionCard>

      <SectionCard title="背景音乐系统" desc="歌单管理、自动播放与随机播放、与左侧半圆钟表联动">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleRow label="进入页面自动播放" hint="浏览器要求首次交互后开始播放" checked={draft.music.autoplay} onChange={(v) => setMusic('autoplay', v)} />
          <ToggleRow label="随机播放" hint="点击 / 双击唱片随机切歌" checked={draft.music.random} onChange={(v) => setMusic('random', v)} />
          <ToggleRow label="钟表联动" hint="音乐播放时左侧半圆钟表装饰缓慢旋转" checked={draft.music.clockLinked} onChange={(v) => setMusic('clockLinked', v)} />
          <Field label={`音量 ${Math.round(draft.music.volume * 100)}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(draft.music.volume * 100)}
              onChange={(e) => setMusic('volume', Number(e.target.value) / 100)}
              className="w-full accent-[var(--accent)]"
              aria-label="背景音乐音量"
            />
          </Field>
        </div>

        <div className="mt-6 border-t border-dashed border-[var(--line)] pt-5">
          <p className="text-xs tracking-[0.2em] text-[var(--ink-soft)]">歌单管理</p>
          <div className="mt-4 space-y-2">
            {db.tracks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-[4px] border border-[var(--line)] px-3 py-2.5">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                <span className="min-w-0 flex-1 truncate text-xs tracking-wider text-[var(--ink-soft)]">
                  {t.name}
                  {!t.url && !t.blobKey && (
                    <span className="ml-2 text-[10px] text-[var(--muted)]">（内置环境音）</span>
                  )}
                  {!t.url && t.blobKey && (
                    <span className="ml-2 text-[10px] text-[var(--muted)]">（本地文件）</span>
                  )}
                  {t.url && (
                    <span className="ml-2 text-[10px] text-[var(--muted)]">（外链）</span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={`试听 ${t.name}`}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)]"
                  onClick={() => audio.preview(t)}
                >
                  {audio.isPreviewing(t.id) ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  type="button"
                  aria-label={`删除 ${t.name}`}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                  onClick={() => deleteTrack(t)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TextInput
              value={audioName}
              onChange={(e) => setAudioName(e.target.value)}
              placeholder="曲目名称（可选）"
              className="!w-48"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => audioFileRef.current?.click()}
              className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-2 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {uploading ? '上传中…' : '上传音频（mp3 / m4a / ogg）'}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            本地音频保存在浏览器 IndexedDB（单文件可至 80MB），不会占用页面数据容量；换浏览器或换设备后需重新上传，也可以直接粘贴外链地址使用。
          </p>
          <input
            ref={audioFileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => addTrack(e.target.files?.[0])}
          />
        </div>
      </SectionCard>

      <SectionCard title="敏感信息 · 全局设置" desc="全站敏感字段统一打码；各模块可在塔罗榜单中单独覆盖">
        <ToggleRow
          label="全站敏感数据统一打码"
          hint="开启后：老板昵称匿名化、消费金额打码，所有敏感字段统一隐藏"
          checked={draft.sensitive.globalMask}
          onChange={(v) => setDraft((d) => ({ ...d, sensitive: { globalMask: v } }))}
        />
      </SectionCard>
    </div>
  );
}
