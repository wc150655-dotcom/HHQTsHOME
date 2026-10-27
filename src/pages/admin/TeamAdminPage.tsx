/** 团队概况管理 —— 人数 / 服务游戏 / 管理层 / 六大接待 / 应聘下单入口 */
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { ContactRow } from '../../lib/types';
import { uid } from '../../lib/utils';
import {
  Field,
  ListEditor,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
} from './controls';

function ContactRowsEditor({
  rows,
  onChange,
  withNote,
}: {
  rows: ContactRow[];
  onChange: (v: ContactRow[]) => void;
  withNote: boolean;
}) {
  const patch = (id: string, fn: (r: ContactRow) => ContactRow) =>
    onChange(rows.map((r) => (r.id === id ? { ...fn(r) } : r)));

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="grid gap-2 rounded-[6px] border border-[var(--line)] p-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
          <Field label="职位 / 角色">
            <TextInput
              value={r.role}
              onChange={(e) => patch(r.id, (x) => ({ ...x, role: e.target.value }))}
            />
          </Field>
          <Field label="昵称">
            <TextInput
              value={r.name}
              onChange={(e) => patch(r.id, (x) => ({ ...x, name: e.target.value }))}
            />
          </Field>
          <Field label="联系方式">
            <TextInput
              value={r.contact}
              onChange={(e) => patch(r.id, (x) => ({ ...x, contact: e.target.value }))}
            />
          </Field>
          <div className="flex items-end gap-2">
            <button
              type="button"
              aria-label={`删除 ${r.role}`}
              onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
          {withNote && (
            <Field label="备注" className="sm:col-span-4">
              <TextInput
                value={r.note}
                placeholder="如：添加备注来意"
                onChange={(e) => patch(r.id, (x) => ({ ...x, note: e.target.value }))}
              />
            </Field>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...rows, { id: uid(), role: '', name: '', contact: '', note: '' }])
        }
        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Plus size={13} /> 新增一行
      </button>
    </div>
  );
}

export function TeamAdminPage() {
  const { db, update } = useStore();
  const t = db.team;

  const commit = (fn: (draft: typeof db) => void, action: string, detail: string) =>
    update(fn, { module: '团队概况', action, detail });

  return (
    <div>
      <PageHeader
        title="团队概况管理"
        subtitle="前台「陪玩团概况」区域的全部内容：人数、服务游戏、管理层与六大直属接待。"
      />

      <SectionCard title="基本数据">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="陪玩团总人数">
            <TextInput
              type="number"
              value={t.memberCount}
              onChange={(e) =>
                e.target.value !== '' &&
                commit((d) => (d.team.memberCount = Number(e.target.value)), '更新人数', '修改陪玩团总人数')
              }
            />
          </Field>
          <Field label="团队简介长文本">
            <TextArea
              rows={3}
              value={db.settings.intro}
              onChange={(e) => commit((d) => (d.settings.intro = e.target.value), '更新简介', '修改团队简介')}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="服务游戏展示列表" hint="与选项库独立，可自由填写展示文案">
            <ListEditor
              items={t.serviceGames}
              onChange={(v) => commit((d) => (d.team.serviceGames = v), '更新游戏', '修改服务游戏展示列表')}
              placeholder="如：无畏契约"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="管理层人员" desc="团长 / 副团 / 管理 / 应聘管理 / 公关（客诉）">
        <ContactRowsEditor
          rows={t.leadership}
          withNote
          onChange={(v) => commit((d) => (d.team.leadership = v), '更新管理层', '修改管理层人员信息')}
        />
      </SectionCard>

      <SectionCard title="六大直属接待" desc="点单方式 · 直属接待①—⑥">
        <ContactRowsEditor
          rows={t.reception}
          withNote={false}
          onChange={(v) => commit((d) => (d.team.reception = v), '更新接待', '修改直属接待信息')}
        />
      </SectionCard>

      <SectionCard title="入口链接">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="下单入口链接" hint="留空则跳转至卡项分区">
            <TextInput
              value={t.orderUrl}
              placeholder="https://…"
              onChange={(e) => commit((d) => (d.team.orderUrl = e.target.value), '更新入口', '修改下单入口链接')}
            />
          </Field>
          <Field label="应聘入口链接" hint="留空则跳转至页脚">
            <TextInput
              value={t.applyUrl}
              placeholder="https://…"
              onChange={(e) => commit((d) => (d.team.applyUrl = e.target.value), '更新入口', '修改应聘入口链接')}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
