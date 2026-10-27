/** 素材资源库 —— 全站图片统一上传 / 预览 / 改名 / 删除 / 复制链接 */
import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { useStore } from '../../lib/store';
import { uid, nowISO, fileToCompressedDataUrl } from '../../lib/utils';
import {
  CopyButton,
  Field,
  PageHeader,
  SectionCard,
  TextInput,
} from './controls';

export function AssetsPage() {
  const { db, update } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState('未分类');
  const [filter, setFilter] = useState('');
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(null);

  const list = db.assets.filter((a) => !filter || a.name.includes(filter) || a.category.includes(filter));
  const categories = Array.from(new Set(db.assets.map((a) => a.category)));

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const url = await fileToCompressedDataUrl(file, 1600);
        update((d) => {
          d.assets.unshift({
            id: uid(),
            name: file.name.replace(/\.[^.]+$/, ''),
            url,
            category,
            createdAt: nowISO(),
          });
        }, { module: '素材库', action: '上传素材', detail: `上传素材「${file.name}」（${category}）` });
      } catch {
        alert(`文件 ${file.name} 读取失败`);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <PageHeader
        title="素材资源库"
        subtitle="全站图片统一管理：塔罗牌素材、卡项图片、陪玩头像、徽章光效、首页视觉图均可在此上传与复用。"
        actions={
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="focus-ring btn-accent flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-xs tracking-[0.3em]"
          >
            <Upload size={13} /> 上传素材
          </button>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Field label="上传分类" className="!mb-0">
          <TextInput value={category} onChange={(e) => setCategory(e.target.value)} className="!w-40" />
        </Field>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filter === ''}
            onClick={() => setFilter('')}
            className={
              'focus-ring rounded-[3px] border px-3 py-1.5 text-[11px] tracking-wider ' +
              (filter === ''
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--line)] text-[var(--muted)]')
            }
          >
            全部（{db.assets.length}）
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={
                'focus-ring rounded-[3px] border px-3 py-1.5 text-[11px] tracking-wider ' +
                (filter === c
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--muted)]')
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title={`素材列表 · ${list.length}`} desc="数据以 data URL 形式存储在本机浏览器中，建议大图控制体积">
        {list.length === 0 ? (
          <p className="py-8 text-center text-xs tracking-widest text-[var(--muted)]">暂无素材，点击右上角上传</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((a) => (
              <div key={a.id} className="group overflow-hidden rounded-[6px] border border-[var(--line)]">
                <div className="relative aspect-square overflow-hidden border-b border-[var(--line)] bg-[var(--bg)]">
                  <img src={a.url} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    aria-label={`查看大图 ${a.name}`}
                    onClick={() => setPreview({ name: a.name, url: a.url })}
                    className="focus-ring absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <input
                    aria-label={`素材名称 ${a.name}`}
                    value={a.name}
                    onChange={(e) =>
                      update((d) => {
                        const x = d.assets.find((y) => y.id === a.id);
                        if (x) x.name = e.target.value;
                      }, { module: '素材库', action: '改名', detail: `素材改名 #${a.id}` })
                    }
                    className="field-input !px-2 !py-1 text-xs"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] tracking-wider text-[var(--muted)]">{a.category}</span>
                    <div className="flex shrink-0 gap-1.5">
                      <CopyButton text={a.url} label={`复制 ${a.name} 链接`} />
                      <button
                        type="button"
                        aria-label={`删除素材 ${a.name}`}
                        onClick={() =>
                          update((d) => {
                            d.assets = d.assets.filter((x) => x.id !== a.id);
                          }, { module: '素材库', action: '删除素材', detail: `删除素材「${a.name}」` })
                        }
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {preview && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`预览 ${preview.name}`}
          onClick={() => setPreview(null)}
        >
          <div className="max-h-[86vh] max-w-3xl overflow-auto rounded-[6px] border border-[var(--line)] bg-[var(--bg)] p-3">
            <img src={preview.url} alt={preview.name} className="max-h-[78vh] w-auto object-contain" />
            <p className="mt-2 text-center text-xs tracking-wider text-[var(--muted)]">{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
