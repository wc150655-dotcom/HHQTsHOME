/** 通用工具函数 */

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const cx = (...xs: Array<string | false | null | undefined>): string =>
  xs.filter(Boolean).join(' ');

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

export const nowISO = (): string => new Date().toISOString();

/** 北京时间格式化字符串 */
export function beijingTimeStr(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
}

/** 敏感金额打码 */
export function maskAmount(v: string): string {
  const s = String(v || '').trim();
  if (!s) return '—';
  return '¥ ****';
}

/** 昵称匿名化 */
export function maskName(n: string): string {
  const s = String(n || '').trim();
  if (!s) return '匿名老板';
  return s.slice(0, 1) + '***';
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('读取文件失败'));
    fr.readAsDataURL(file);
  });
}

/** 图片压缩后转 data URL（控制 localStorage 体积；非图片 / SVG 原样返回） */
export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 1400,
  quality = 0.85
): Promise<string> {
  if (!file.type.startsWith('image/') || file.type.includes('svg')) {
    return fileToDataUrl(file);
  }
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return fileToDataUrl(file);
  }
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1 && file.size < 300 * 1024) {
    bitmap.close();
    return fileToDataUrl(file);
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return fileToDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(outType, quality);
}

export function downloadJson(obj: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 当前月份 YYYY-MM */
export function monthKey(d: Date = new Date()): string {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
  }).format(d);
  return s;
}

/** 安全外链：仅放行 http / https / mailto，防止 javascript: 等协议注入（XSS） */
export function safeUrl(u: string | undefined | null): string | undefined {
  if (!u) return undefined;
  const t = u.trim();
  if (/^(https?:|mailto:)/i.test(t)) return t;
  return undefined;
}

/** 轻量密码散列（本地环境防明文存储） */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
async function sha256Hex(text: string): Promise<string | null> {
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return bytesToHex(new Uint8Array(buf));
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

/** PBKDF2-SHA256 + 随机盐（120,000 次迭代）；非安全上下文回退为 djb2（仅混淆） */
export async function hashPassword(pw: string, saltHex?: string): Promise<string> {
  try {
    if (crypto?.subtle) {
      const salt = saltHex
        ? hexToBytes(saltHex)
        : crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('hhqt::' + pw),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
        key,
        256
      );
      return `pbkdf2$${(saltHex ?? bytesToHex(salt))}$${bytesToHex(new Uint8Array(bits))}`;
    }
  } catch {
    /* fallthrough */
  }
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0;
  return 'djb2:' + h.toString(16);
}

/** 校验密码：兼容 pbkdf2 新格式 / 旧版无盐 SHA-256 / 初始化明文标记 / djb2 回退 */
export async function verifyPassword(stored: string, pw: string): Promise<boolean> {
  if (stored.startsWith('default:')) return stored.slice(8) === pw;
  if (stored.startsWith('pbkdf2$')) {
    const parts = stored.split('$');
    if (parts.length !== 3) return false;
    return (await hashPassword(pw, parts[1])) === stored;
  }
  if (stored.startsWith('djb2:')) {
    return (await hashPassword(pw)) === stored;
  }
  const legacy = await sha256Hex('hhqt::' + pw);
  return legacy !== null && legacy === stored;
}

/** 是否需要升级到 PBKDF2 新格式 */
export function needsHashUpgrade(stored: string): boolean {
  return !stored.startsWith('pbkdf2$');
}
