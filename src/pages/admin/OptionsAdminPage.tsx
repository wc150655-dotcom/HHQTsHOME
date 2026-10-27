/** 公共基础选项库 —— 音色 / 游戏 / 服务类型 / 默认头像，一处修改全站同步 */
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { OptionItem } from '../../lib/types';
import { uid } from '../../lib/utils';
import {
  ConfirmButton,
  Field,
  ImagePicker,
  PageHeader,
  SectionCard,
  TextInput,
  ToggleRow,
} from './controls';

function OptionListEditor({
  title,
  items,
  onChange,
  onLog,
  placeholder,
}: {
  title: string;
  items: OptionItem[];
  onChange: (v: OptionItem[]) => void;
  onLog: (action: string, detail: string) => void;
  placeholder: string;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  const patch = (id: string, fn: (o: OptionItem) => OptionItem) =>
    onChange(items.map((o) => (o.id === id ? { ...fn(o) } : o)));
  const move = (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((o) => o.id === id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    const next = items.map((o) =>
      o.id === a.id ? { ...o, order: b.order } : o.id === b.id ? { ...o, order: a.order } : o
    );
    onChange(next);
    onLog('排序', `${title} 排序调整`);
  };

  return (
    <div>
      <p className="mb-3 text-xs tracking-[0.2em] text-[var(--ink-soft)]">{title}</p>
      <div className="space-y-2">
        {sorted.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="上移"
                onClick={() => move(it.id, -1)}
                className="focus-ring text-[var(--muted)] hover:text-[var(--accent)]"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                aria-label="下移"
                onClick={() => move(it.id, 1)}
                className="focus-ring text-[var(--muted)] hover:text-[var(--accent)]"
              >
                <ArrowDown size={13} />
              </button>
            </div>
            <TextInput
              value={it.label}
              placeholder={placeholder}
              onChange={(e) =>
                patch(it.id, (o) => {
                  o.label = e.target.value;
                  return o;
                })
              }
              onBlur={() => onLog('改名', `${title} 名称修改`)}
            />
            <button
              type="button"
              aria-pressed={it.enabled}
              aria-label={`${it.enabled ? '隐藏' : '显示'} ${it.label}`}
              onClick={() => patch(it.id, (o) => ((o.enabled = !o.enabled), o))}
              className={
                'focus-ring w-20 shrink-0 rounded-[4px] border px-2 py-2 text-[10px] tracking-[0.15em] transition-colors ' +
                (it.enabled
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--muted)]')
              }
            >
              {it.enabled ? '显示中' : '已隐藏'}
            </button>
            <button
              type="button"
              aria-label={`删除 ${it.label}`}
              onClick={() => {
                onChange(items.filter((o) => o.id !== it.id));
                onLog('删除', `${title} 删除「${it.label}」`);
              }}
              className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          onChange([...items, { id: uid(), label: '', enabled: true, order: items.length + 1 }]);
          onLog('新增', `${title} 新增一项`);
        }}
        className="focus-ring mt-3 flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Plus size={13} /> 新增
      </button>
    </div>
  );
}

export function OptionsAdminPage() {
  const { db, update } = useStore();

  const log = (action: string, detail: string) =>
    update(() => undefined, { module: '选项库', action, detail });

  const setList = (key: 'voices' | 'games' | 'services', list: OptionItem[]) =>
    update(
      (d) => {
        d.options[key] = list;
      },
      { module: '选项库', action: '更新', detail: `选项库更新` }
    );

  return (
    <div>
      <PageHeader
        title="公共基础选项库"
        subtitle="音色 / 游戏 / 服务类型 / 默认头像 —— 一处修改，陪玩录入、前端筛选、标签展示全站自动同步。"
      />

      <SectionCard title="音色库" desc="陪玩录入与前端筛选自动同步">
        <OptionListEditor
          title="音色"
          items={db.options.voices}
          onChange={(v) => setList('voices', v)}
          onLog={log}
          placeholder="如：少女音"
        />
      </SectionCard>

      <SectionCard title="游戏库" desc="服务游戏列表，新增游戏后即可在陪玩录入与筛选中选择">
        <OptionListEditor
          title="游戏"
          items={db.options.games}
          onChange={(v) => setList('games', v)}
          onLog={log}
          placeholder="如：无畏契约"
        />
      </SectionCard>

      <SectionCard title="服务类型库" desc="娱乐 / 技术 / 娱技等标签">
        <OptionListEditor
          title="服务类型"
          items={db.options.services}
          onChange={(v) => setList('services', v)}
          onLog={log}
          placeholder="如：娱乐"
        />
      </SectionCard>

      <SectionCard title="默认头像（三图随机）" desc="陪玩头像为 random 模式时，自动从以下图片直链中随机分配">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {db.options.avatarPresets.map((url, i) => (
            <div key={i}>
              <Field label={`默认头像 ${i + 1}`}>
                <ImagePicker
                  value={url}
                  onChange={(v) =>
                    update((d) => {
                      d.options.avatarPresets[i] = v;
                    }, { module: '选项库', action: '更新头像', detail: `更新默认头像 ${i + 1}` })
                  }
                  label={`默认头像 ${i + 1}`}
                />
              </Field>
              <ConfirmButton
                danger
                className="mt-2"
                onConfirm={() =>
                  update((d) => {
                    d.options.avatarPresets.splice(i, 1);
                  }, { module: '选项库', action: '删除头像', detail: `删除默认头像 ${i + 1}` })
                }
              >
                删除该头像
              </ConfirmButton>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            update((d) => {
              d.options.avatarPresets.push('');
            }, { module: '选项库', action: '新增头像', detail: '新增默认头像位' })
          }
          className="focus-ring mt-4 flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Plus size={13} /> 新增头像位
        </button>
      </SectionCard>
    </div>
  );
}
