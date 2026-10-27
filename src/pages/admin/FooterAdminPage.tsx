/** 页脚、感谢名单、打赏 & 捐款台账系统 */
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { uid } from '../../lib/utils';
import {
  Field,
  ImagePicker,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
} from './controls';

export function FooterAdminPage() {
  const { db, update } = useStore();
  const f = db.footer;

  const commit = (fn: (draft: typeof db) => void, action: string, detail: string) =>
    update(fn, { module: '页脚台账', action, detail });

  return (
    <div>
      <PageHeader
        title="页脚 · 感谢名单 · 打赏台账"
        subtitle="开发团队信息、档案袋感谢名单、打赏二维码与 50% 捐赠承诺、公开捐款台账。"
      />

      <SectionCard title="页脚信息">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="开发团队信息">
            <TextInput value={f.devText} onChange={(e) => commit((d) => (d.footer.devText = e.target.value), '更新', '修改开发团队信息')} />
          </Field>
          <Field label="页脚说明文字">
            <TextInput value={f.devNote} onChange={(e) => commit((d) => (d.footer.devNote = e.target.value), '更新', '修改页脚说明')} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="感谢名单（档案袋弹窗）" desc="协助开发、提供灵感的人员名单与贡献备注">
        <div className="space-y-2">
          {f.thanks.map((t) => (
            <div key={t.id} className="flex flex-wrap gap-2">
              <TextInput
                value={t.name}
                placeholder="姓名 / 昵称"
                className="!w-44"
                onChange={(e) =>
                  commit(
                    (d) => {
                      const x = d.footer.thanks.find((y) => y.id === t.id);
                      if (x) x.name = e.target.value;
                    },
                    '更新名单',
                    '修改感谢名单姓名'
                  )
                }
              />
              <TextInput
                value={t.note}
                placeholder="贡献备注"
                className="!flex-1"
                onChange={(e) =>
                  commit(
                    (d) => {
                      const x = d.footer.thanks.find((y) => y.id === t.id);
                      if (x) x.note = e.target.value;
                    },
                    '更新名单',
                    '修改感谢名单备注'
                  )
                }
              />
              <button
                type="button"
                aria-label="删除名单成员"
                onClick={() => commit((d) => (d.footer.thanks = d.footer.thanks.filter((x) => x.id !== t.id)), '删除', '删除感谢名单成员')}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--line)] text-[var(--muted)] hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              commit((d) => d.footer.thanks.push({ id: uid(), name: '', note: '' }), '新增', '新增感谢名单成员')
            }
            className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={13} /> 新增成员
          </button>
        </div>
      </SectionCard>

      <SectionCard title="打赏系统" desc="二维码 + 固定弹窗文案（自动说明 50% 收入捐赠贫困 / 疾病女童）">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="打赏二维码">
            <ImagePicker value={f.donationQr} onChange={(v) => commit((d) => (d.footer.donationQr = v), '更新二维码', '更新打赏二维码')} label="打赏二维码" />
          </Field>
          <Field label="弹窗文案">
            <TextArea
              rows={5}
              value={f.donationNote}
              onChange={(e) => commit((d) => (d.footer.donationNote = e.target.value), '更新文案', '修改打赏弹窗文案')}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="捐款记录台账（公开可查）" desc="每期打赏总收入、捐款金额、时间与凭证图片">
        <div className="space-y-3">
          {f.ledger.length === 0 && (
            <p className="text-xs text-[var(--muted)]">暂无台账记录，前端将显示空占位。</p>
          )}
          {f.ledger.map((l) => (
            <div key={l.id} className="rounded-[6px] border border-[var(--line)] p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="期数说明">
                  <TextInput
                    value={l.period}
                    placeholder="如：2026年10月"
                    onChange={(e) =>
                      commit(
                        (d) => {
                          const x = d.footer.ledger.find((y) => y.id === l.id);
                          if (x) x.period = e.target.value;
                        },
                        '更新台账',
                        '修改台账期数'
                      )
                    }
                  />
                </Field>
                <Field label="打赏总收入">
                  <TextInput
                    value={l.income}
                    onChange={(e) =>
                      commit(
                        (d) => {
                          const x = d.footer.ledger.find((y) => y.id === l.id);
                          if (x) x.income = e.target.value;
                        },
                        '更新台账',
                        '修改打赏收入'
                      )
                    }
                  />
                </Field>
                <Field label="捐款金额">
                  <TextInput
                    value={l.donated}
                    onChange={(e) =>
                      commit(
                        (d) => {
                          const x = d.footer.ledger.find((y) => y.id === l.id);
                          if (x) x.donated = e.target.value;
                        },
                        '更新台账',
                        '修改捐款金额'
                      )
                    }
                  />
                </Field>
                <Field label="捐款时间">
                  <TextInput
                    value={l.date}
                    placeholder="2026-10-01"
                    onChange={(e) =>
                      commit(
                        (d) => {
                          const x = d.footer.ledger.find((y) => y.id === l.id);
                          if (x) x.date = e.target.value;
                        },
                        '更新台账',
                        '修改捐款时间'
                      )
                    }
                  />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div className="max-w-xs flex-1">
                  <Field label="凭证图片">
                    <ImagePicker
                      value={l.proofUrl}
                      onChange={(v) =>
                        commit(
                          (d) => {
                            const x = d.footer.ledger.find((y) => y.id === l.id);
                            if (x) x.proofUrl = v;
                          },
                          '更新凭证',
                          '更新捐款凭证图片'
                        )
                      }
                      label="捐款凭证"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  aria-label="删除该期台账"
                  onClick={() =>
                    commit((d) => (d.footer.ledger = d.footer.ledger.filter((x) => x.id !== l.id)), '删除台账', `删除台账「${l.period}」`)
                  }
                  className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] hover:border-red-400 hover:text-red-400"
                >
                  <Trash2 size={12} /> 删除该期
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              commit(
                (d) => d.footer.ledger.push({ id: uid(), period: '', income: '', donated: '', date: '', proofUrl: '' }),
                '新增台账',
                '新增一期台账'
              )
            }
            className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-dashed border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.25em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={13} /> 新增一期台账
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
