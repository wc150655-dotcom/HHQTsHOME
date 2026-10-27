/** 管理员权限系统 —— 超级管理员 / 子管理员、权限分配、冻结、改密 */
import { useState, type FormEvent } from 'react';
import { KeyRound, Lock, Plus, ShieldCheck, Trash2, Unlock } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getSession, verifyLogin } from '../../lib/auth';
import { Modal } from '../../components/ui';
import type { PermissionKey } from '../../lib/types';
import { ALL_PERMISSIONS, type AdminAccount } from '../../lib/types';
import { hashPassword, uid, nowISO, cx } from '../../lib/utils';
import {
  PageHeader,
  SectionCard,
  TextInput,
  Field,
  PrimaryButton,
  ToggleRow,
  ConfirmButton,
} from './controls';

const PERM_LABELS: Record<PermissionKey, string> = {
  site: '站点设置',
  opening: '开场文案',
  options: '选项库',
  team: '团队概况',
  cards: '卡项管理',
  companions: '陪玩管理',
  top: '头牌管理',
  tarot: '塔罗榜单',
  footer: '页脚台账',
  assets: '素材库',
  accounts: '账号权限',
  logs: '操作日志',
};

export function AccountsPage() {
  const { db, update } = useStore();
  const session = getSession();
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPerms, setNewPerms] = useState<PermissionKey[]>(['opening', 'cards', 'companions']);
  const [msg, setMsg] = useState('');

  /* 修改自己的密码（超级管理员本人） */
  const [selfPwOpen, setSelfPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw1, setNewPw1] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const changeSelfPassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    const me = db.accounts.find((a) => a.username === session?.username);
    if (!me) return;
    const ok = await verifyLogin(db.accounts, me.username, oldPw);
    if (!ok) {
      setPwMsg('当前密码不正确');
      return;
    }
    if (newPw1.length < 6) {
      setPwMsg('新密码至少 6 位');
      return;
    }
    if (newPw1 !== newPw2) {
      setPwMsg('两次输入的新密码不一致');
      return;
    }
    if (newPw1 === oldPw) {
      setPwMsg('新密码不能与当前密码相同');
      return;
    }
    const hash = await hashPassword(newPw1);
    update(
      (d) => {
        const a = d.accounts.find((x) => x.id === me.id);
        if (a) a.passwordHash = hash;
      },
      { module: '账号权限', action: '修改本人密码', detail: `账号「${me.username}」修改了自己的登录密码`, sensitive: true }
    );
    setPwMsg('密码已修改成功 ✓');
    setOldPw('');
    setNewPw1('');
    setNewPw2('');
    window.setTimeout(() => setSelfPwOpen(false), 700);
  };

  if (session?.role !== 'super') {
    return (
      <div>
        <PageHeader title="账号权限" />
        <SectionCard title="权限不足">
          <p className="text-sm text-[var(--muted)]">
            账号体系仅超级管理员可管理。如需开通子管理员，请联系超级管理员。
          </p>
        </SectionCard>
      </div>
    );
  }

  const togglePerm = (p: PermissionKey) =>
    setNewPerms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  const createSub = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || !newPass) {
      setMsg('请填写账号与密码');
      return;
    }
    if (db.accounts.some((a) => a.username === newUser.trim())) {
      setMsg('账号已存在');
      return;
    }
    const acc: AdminAccount = {
      id: uid(),
      username: newUser.trim(),
      passwordHash: await hashPassword(newPass),
      role: 'sub',
      permissions: newPerms,
      frozen: false,
      createdAt: nowISO(),
      lastLogin: '',
    };
    update((d) => {
      d.accounts.push(acc);
    }, { module: '账号权限', action: '创建子管理员', detail: `创建子管理员「${acc.username}」`, sensitive: true });
    setNewUser('');
    setNewPass('');
    setMsg('子管理员已创建');
  };

  const resetPassword = async (acc: AdminAccount) => {
    const pw = window.prompt(`为「${acc.username}」设置新密码（至少 6 位）：`);
    if (!pw) return;
    if (pw.length < 6) {
      setMsg('密码至少 6 位');
      return;
    }
    const hash = await hashPassword(pw);
    update((d) => {
      const a = d.accounts.find((x) => x.id === acc.id);
      if (a) a.passwordHash = hash;
    }, { module: '账号权限', action: '重置密码', detail: `重置账号「${acc.username}」密码`, sensitive: true });
    setMsg('密码已更新');
  };

  const fmtTime = (iso: string) =>
    iso
      ? new Intl.DateTimeFormat('zh-CN', {
          timeZone: 'Asia/Shanghai',
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(iso))
      : '从未登录';

  return (
    <div>
      <PageHeader
        title="管理员权限系统"
        subtitle="超级管理员（全部权限）+ 多名子管理员（模块级权限分配）、账号冻结、改密与登录管控。"
      />

      <SectionCard title="创建子管理员" desc="可单独授权的权限：站点设置、开场文案、卡项、陪玩、头牌、塔罗榜单、打赏台账、素材库等">
        <form onSubmit={createSub} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              placeholder="账号"
              autoComplete="off"
            />
            <TextInput
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="初始密码（至少 6 位）"
              autoComplete="new-password"
            />
          </div>
          <div>
            <p className="field-label">模块权限</p>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((p) => {
                const on = newPerms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() => togglePerm(p)}
                    className={cx(
                      'focus-ring rounded-[3px] border px-3 py-1.5 text-xs tracking-wider transition-colors',
                      on
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--line)] text-[var(--muted)]'
                    )}
                  >
                    {PERM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="focus-ring btn-accent flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-xs tracking-[0.3em]">
            <Plus size={13} /> 创建子管理员
          </button>
        </form>
        {msg && (
          <p role="status" className="mt-3 text-xs tracking-wider text-[var(--accent)]">
            {msg}
          </p>
        )}
      </SectionCard>

      <SectionCard
        title={`账号列表 · ${db.accounts.length}`}
        desc="点自己账号行的「修改我的密码」即可修改超级管理员登录密码（需验证当前密码）；对其他账号可重置密码、冻结、删除。"
      >
        <div className="space-y-3">
          {db.accounts.map((a) => (
            <div key={a.id} className="rounded-[6px] border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--ink)]">
                  {a.username.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm tracking-wider text-[var(--ink)]">
                    {a.username}
                    {a.role === 'super' ? (
                      <span className="flex items-center gap-1 rounded-[2px] border border-[var(--accent)] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-[var(--accent)]">
                        <ShieldCheck size={10} /> 超级管理员
                      </span>
                    ) : (
                      <span className="rounded-[2px] border border-[var(--line)] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-[var(--muted)]">
                        子管理员
                      </span>
                    )}
                    {a.frozen && (
                      <span className="rounded-[2px] border border-red-400/60 px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-red-400">
                        已冻结
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] tracking-wider text-[var(--muted)]">
                    创建 {fmtTime(a.createdAt)} · 最近登录 {fmtTime(a.lastLogin)}
                  </p>
                  {a.role === 'sub' && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.permissions.map((p) => (
                        <span key={p} className="rounded-[2px] border border-[var(--line)] px-1.5 py-0.5 text-[9px] tracking-wider text-[var(--muted)]">
                          {PERM_LABELS[p]}
                        </span>
                      ))}
                      {a.permissions.length === 0 && (
                        <span className="text-[10px] text-[var(--muted)]">无模块权限（仅可登录查看）</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {a.username === session.username && (
                    <button
                      type="button"
                      onClick={() => {
                        setPwMsg('');
                        setSelfPwOpen(true);
                      }}
                      className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--accent)] px-3 py-1.5 text-[11px] tracking-wider text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      <KeyRound size={12} /> 修改我的密码
                    </button>
                  )}
                  {a.username !== session.username && (
                    <>
                      <button
                        type="button"
                        aria-label={a.frozen ? `解冻 ${a.username}` : `冻结 ${a.username}`}
                        onClick={() =>
                          update((d) => {
                            const x = d.accounts.find((y) => y.id === a.id);
                            if (x) x.frozen = !x.frozen;
                          }, { module: '账号权限', action: a.frozen ? '解冻账号' : '冻结账号', detail: `${a.frozen ? '解冻' : '冻结'}账号「${a.username}」`, sensitive: true })
                        }
                        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-[11px] tracking-wider text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {a.frozen ? <Unlock size={12} /> : <Lock size={12} />}
                        {a.frozen ? '解冻' : '冻结'}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPassword(a)}
                        className="focus-ring flex items-center gap-1.5 rounded-[4px] border border-[var(--line)] px-3 py-1.5 text-[11px] tracking-wider text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        <KeyRound size={12} /> 改密
                      </button>
                      <ConfirmButton
                        danger
                        confirmText="确认删除该账号？"
                        onConfirm={() =>
                          update((d) => {
                            d.accounts = d.accounts.filter((x) => x.id !== a.id);
                          }, { module: '账号权限', action: '删除账号', detail: `删除账号「${a.username}」`, sensitive: true })
                        }
                      >
                        <span className="flex items-center gap-1.5">
                          <Trash2 size={12} /> 删除
                        </span>
                      </ConfirmButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 修改自己的密码（超级管理员本人） */}
      <Modal open={selfPwOpen} onClose={() => setSelfPwOpen(false)} title="修改我的登录密码" width="max-w-sm">
        <form onSubmit={changeSelfPassword} className="space-y-4">
          <Field label="当前密码">
            <TextInput
              type="password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="新密码（至少 6 位）">
            <TextInput
              type="password"
              value={newPw1}
              onChange={(e) => setNewPw1(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="确认新密码">
            <TextInput
              type="password"
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Field>
          {pwMsg && (
            <p
              role="status"
              className={
                'text-xs tracking-wider ' +
                (pwMsg.includes('成功') ? 'text-[var(--accent)]' : 'text-red-400')
              }
            >
              {pwMsg}
            </p>
          )}
          <PrimaryButton type="submit" className="w-full">
            确认修改
          </PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}
