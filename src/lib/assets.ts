/**
 * 全站默认素材 —— 希腊众神神话 × 解构主义黑白灰线稿（data URI 内联）。
 * 视觉语言：黑绘陶器（black-figure）剪影 + 月桂 / 希腊回纹 / 星座连线 / 日月星诸神。
 * 后台素材库可全部替换。
 */

const svg = (s: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(s);

/* 纸张 / 墨色 / 青铜金 */
const PAPER = '#F2EFE9';
const INK = '#1D1D1F';
const MID = '#8A8A8A';
const BRONZE = '#8F6A2B';

/* ---------------- 希腊回纹（meander）分隔条 ---------------- */
const meanderPattern = (stroke: string) =>
  `<defs><pattern id="gk" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 11 V3 H6 V11 H12 V3 H18 V11 H24" fill="none" stroke="${stroke}" stroke-width="1.2"/></pattern></defs><rect width="1200" height="14" fill="url(#gk)"/>`;

export const greekKeyLight = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 14">${meanderPattern('#A9A9AF')}</svg>`
);
export const greekKeyDark = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 14">${meanderPattern('#4A4748')}</svg>`
);

/* ---------------- 月桂枝（laurel） ---------------- */
const laurelLeaves = (() => {
  const pts: [number, number][] = [
    [10, 30], [26, 24], [42, 20], [58, 18], [74, 14], [90, 10],
    [106, 12], [122, 16], [138, 20], [154, 22], [170, 26], [186, 30],
  ];
  const leaf = (x: number, y: number, ang: number) =>
    `<path d="M0 0 Q 6 -3.2 11 0.4 Q 6 4.4 0 0" fill="none" stroke="${INK}" stroke-width="1" transform="translate(${x} ${y}) rotate(${ang})"/>`;
  return pts.map(([x, y], i) => leaf(x, y, i % 2 === 0 ? -16 : 20)).join('');
})();
export const laurelAsset = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56">
<path d="M10 30 C 30 18 60 16 90 14 C 120 12 150 20 186 30" fill="none" stroke="${INK}" stroke-width="1.1"/>
${laurelLeaves}
<circle cx="10" cy="30" r="2.4" fill="${BRONZE}"/>
<circle cx="186" cy="30" r="2.4" fill="${INK}"/>
</svg>`);

/* ---------------- 星座连线装饰（透明底） ---------------- */
export const constellationAsset = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
<g stroke="${MID}" stroke-width="0.9" opacity="0.85">
<path d="M70 310 L128 232 L188 168 L252 116 L318 148"/>
<path d="M188 168 L288 232 L228 268 L168 288 L70 310"/>
<path d="M128 232 L70 210 M318 148 L348 96 M288 232 L352 240"/>
</g>
<g fill="${INK}">
<circle cx="70" cy="310" r="4"/><circle cx="128" cy="232" r="3.2"/><circle cx="188" cy="168" r="4.4"/>
<circle cx="252" cy="116" r="3"/><circle cx="318" cy="148" r="4"/><circle cx="288" cy="232" r="3"/>
<circle cx="228" cy="268" r="2.6"/><circle cx="168" cy="288" r="2.8"/><circle cx="70" cy="210" r="2.6"/>
<circle cx="348" cy="96" r="2.6"/><circle cx="352" cy="240" r="2.2"/>
</g>
<circle cx="252" cy="116" r="7" fill="none" stroke="${BRONZE}" stroke-width="1"/>
<path d="M112 52 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" stroke="${INK}" stroke-width="0.9"/>
<path d="M40 120 q 10 -14 20 0 q 10 14 20 0" stroke="${MID}" stroke-width="1"/>
</svg>`);

/* ---------------- Logo（希腊印章） ---------------- */
export const logoAsset = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<circle cx="48" cy="48" r="45" fill="none" stroke="${INK}" stroke-width="1.6"/>
<circle cx="48" cy="48" r="40" fill="none" stroke="${INK}" stroke-width="0.6" stroke-dasharray="2 3"/>
<g stroke="${MID}" stroke-width="0.7">
${Array.from({ length: 12 })
  .map((_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = 48 + Math.cos(a) * 40;
    const y1 = 48 + Math.sin(a) * 40;
    const x2 = 48 + Math.cos(a) * 44;
    const y2 = 48 + Math.sin(a) * 44;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  })
  .join('')}
</g>
<text x="48" y="37" text-anchor="middle" font-size="16" font-family="serif" fill="${INK}">恨海情天</text>
<line x1="28" y1="46" x2="68" y2="46" stroke="${INK}" stroke-width="0.8"/>
<text x="48" y="60" text-anchor="middle" font-size="8.5" letter-spacing="3" font-family="serif" fill="${MID}">纯LE · ΜΟΙΡΑΙ</text>
<circle cx="48" cy="10" r="1.6" fill="${INK}"/>
<circle cx="48" cy="86" r="1.6" fill="${INK}"/>
<circle cx="10" cy="48" r="1.6" fill="${INK}"/>
<circle cx="86" cy="48" r="1.6" fill="${INK}"/>
<circle cx="76" cy="24" r="2" fill="${BRONZE}"/>
</svg>`);

/* ---------------- 首页主视觉（黑绘陶器 · 维纳斯自海中升起） ---------------- */
const zig = (x0: number, x1: number, y1: number, y2: number, step: number, stroke: string, sw = 1) => {
  const pts: string[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    pts.push(`L ${Math.min(x + step, x1).toFixed(1)} ${i % 2 === 0 ? y2 : y1}`);
    x += step;
    i++;
  }
  return `<path d="M ${x0} ${y1} ${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
};

const fourStar = (x: number, y: number, r: number, stroke: string, sw = 1) =>
  `<path d="M${x - r} ${y} L${x + r} ${y} M${x} ${y - r} L${x} ${y + r}" stroke="${stroke}" stroke-width="${sw}"/>`;

export const heroAsset = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
<rect width="1200" height="900" fill="${PAPER}"/>
<defs><pattern id="gk" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 11 V3 H6 V11 H12 V3 H18 V11 H24" fill="none" stroke="${INK}" stroke-width="1.1"/></pattern></defs>
<rect width="1200" height="14" fill="url(#gk)"/>
<rect y="886" width="1200" height="14" fill="url(#gk)"/>
<!-- 淡点阵 -->
<g fill="${MID}" opacity="0.22">
${Array.from({ length: 8 })
  .map((_, r) =>
    Array.from({ length: 14 })
      .map((_, c) => `<circle cx="${90 + c * 78}" cy="${200 + r * 96}" r="1.3"/>`)
      .join('')
  )
  .join('')}
</g>
<!-- 轨道曲线 -->
<ellipse cx="880" cy="520" rx="250" ry="88" fill="none" stroke="${INK}" stroke-width="1" transform="rotate(-16 880 520)"/>
<ellipse cx="880" cy="520" rx="250" ry="88" fill="none" stroke="${MID}" stroke-width="0.7" stroke-dasharray="3 8" transform="rotate(66 880 520)"/>
<line x1="880" y1="300" x2="880" y2="380" stroke="${INK}" stroke-width="0.9"/>
<line x1="880" y1="660" x2="880" y2="740" stroke="${INK}" stroke-width="0.9"/>
<circle cx="880" cy="290" r="3" fill="${INK}"/><circle cx="880" cy="750" r="3" fill="${INK}"/>
<!-- 太阳（赫利俄斯） -->
<g>
<circle cx="1096" cy="224" r="34" fill="none" stroke="${INK}" stroke-width="1.3"/>
<circle cx="1096" cy="224" r="20" fill="none" stroke="${MID}" stroke-width="0.8"/>
${Array.from({ length: 14 })
  .map((_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return `<line x1="${(1096 + Math.cos(a) * 42).toFixed(1)}" y1="${(224 + Math.sin(a) * 42).toFixed(1)}" x2="${(1096 + Math.cos(a) * 54).toFixed(1)}" y2="${(224 + Math.sin(a) * 54).toFixed(1)}" stroke="${INK}" stroke-width="1"/>`;
  })
  .join('')}
<circle cx="1096" cy="224" r="5" fill="${BRONZE}"/>
</g>
<!-- 新月（塞勒涅） -->
<path d="M 1066 636 A 42 42 0 1 0 1066 722 A 34 34 0 1 1 1066 636" fill="none" stroke="${INK}" stroke-width="1.3"/>
<circle cx="1094" cy="652" r="4" fill="${BRONZE}"/>
${fourStar(1132, 700, 6, MID)}
<!-- 双耳瓶（黑绘剪影） -->
<g>
<rect x="294" y="198" width="72" height="14" fill="${INK}"/>
<path d="M 302 212 H 358 V 252 C 394 258 416 274 422 302 C 428 332 428 362 418 390 C 406 426 378 450 330 460 C 282 450 254 426 242 390 C 232 362 232 332 238 302 C 244 274 266 258 302 252 Z" fill="${INK}"/>
<path d="M302 264 C 274 256 260 272 266 302 M358 264 C 386 256 400 272 394 302" fill="none" stroke="${INK}" stroke-width="7"/>
${zig(258, 404, 306, 298, 12, PAPER, 1.2)}
${zig(258, 404, 326, 318, 12, PAPER, 1.2)}
<line x1="262" y1="342" x2="400" y2="342" stroke="${PAPER}" stroke-width="1.2"/>
<circle cx="330" cy="372" r="4" fill="${PAPER}"/>
<circle cx="330" cy="410" r="3" fill="${PAPER}"/>
<path d="M 306 424 q 24 -16 48 0 q -24 16 -48 0" fill="none" stroke="${PAPER}" stroke-width="1.1"/>
</g>
<!-- 扇形贝壳（阿佛洛狄忒诞生） -->
<g>
<path d="M 840 626 C 700 626 686 530 722 478 C 752 436 796 424 840 424 C 884 424 928 436 958 478 C 994 530 980 626 840 626 Z" fill="none" stroke="${INK}" stroke-width="1.4"/>
${Array.from({ length: 9 })
  .map((_, i) => {
    const t = i / 8;
    const x = 692 + 296 * t;
    const y = 522 - 98 * Math.sin(Math.PI * t);
    return `<line x1="840" y1="622" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="0.9" opacity="0.85"/>`;
  })
  .join('')}
<rect x="826" y="620" width="28" height="10" fill="none" stroke="${INK}" stroke-width="1"/>
<circle cx="840" cy="640" r="4" fill="${BRONZE}"/>
<circle cx="760" cy="520" r="2.4" fill="${MID}"/><circle cx="920" cy="520" r="2.4" fill="${MID}"/>
</g>
<!-- 里拉琴（阿波罗） -->
<g fill="none" stroke="${INK}">
<path d="M 962 332 C 950 402 950 472 972 514" stroke-width="1.2"/>
<path d="M 1038 332 C 1050 402 1050 472 1028 514" stroke-width="1.2"/>
<line x1="958" y1="336" x2="1042" y2="336" stroke-width="1.4"/>
<path d="M 972 514 Q 1000 528 1028 514" stroke-width="1.2"/>
${[970, 982, 994, 1006, 1018].map((x) => `<line x1="${x}" y1="340" x2="1000" y2="510" stroke-width="0.7" opacity="0.8"/>`).join('')}
</g>
<path d="M 948 330 Q 956 322 966 324 Q 962 332 948 330 M 1052 330 Q 1044 322 1034 324 Q 1038 332 1052 330" fill="none" stroke="${MID}" stroke-width="0.9"/>
<circle cx="1000" cy="512" r="4" fill="${BRONZE}"/>
<!-- 石柱与断柱 -->
<g stroke="${INK}">
<rect x="1054" y="716" width="86" height="14" fill="none" stroke-width="1.1"/>
<rect x="1060" y="730" width="74" height="100" fill="none" stroke-width="1"/>
<line x1="1084" y1="730" x2="1084" y2="830" stroke-width="0.7" opacity="0.7"/>
<line x1="1108" y1="730" x2="1108" y2="830" stroke-width="0.7" opacity="0.7"/>
<rect x="1054" y="830" width="86" height="12" fill="none" stroke-width="1.1"/>
</g>
<g stroke="${INK}">
<ellipse cx="176" cy="800" rx="34" ry="12" fill="none" stroke-width="1"/>
<rect x="142" y="800" width="68" height="58" fill="none" stroke-width="1"/>
<line x1="164" y1="800" x2="164" y2="858" stroke-width="0.7" opacity="0.7"/>
<line x1="188" y1="800" x2="188" y2="858" stroke-width="0.7" opacity="0.7"/>
<ellipse cx="176" cy="858" rx="34" ry="10" fill="none" stroke-width="1"/>
</g>
<!-- 星点 -->
${fourStar(760, 272, 7, INK, 1.1)}
${fourStar(838, 176, 5, MID)}
${fourStar(700, 596, 5, MID)}
<circle cx="760" cy="272" r="1.8" fill="${BRONZE}"/>
<circle cx="612" cy="240" r="3" fill="${INK}"/><circle cx="640" cy="520" r="2.4" fill="${MID}"/>
<!-- 铭文 -->
<text x="60" y="70" font-size="30" font-family="serif" fill="${INK}">恨海情天</text>
<rect x="232" y="46" width="9" height="9" fill="${BRONZE}"/>
<text x="250" y="58" font-size="12" letter-spacing="3" fill="${MID}">ΑΦΡΟΔΙΤΗ</text>
<text x="60" y="100" font-size="13" letter-spacing="6" fill="${MID}">HENHAI QINGTIAN · PURE LE</text>
<text x="60" y="128" font-size="11" letter-spacing="2" fill="${MID}">爱自恨海中升起 — 情天之上，众神见证</text>
<text x="60" y="842" font-size="12" letter-spacing="4" fill="${MID}">PURE LE — EST. MMXXVI — BEIJING</text>
<text x="1132" y="300" font-size="12" letter-spacing="8" fill="${MID}" transform="rotate(90 1142 300)">ΑΦΡΟΔΙΤΗ · ΑΠΟΛΛΩΝ · ΜΟΙΡΑΙ</text>
<text x="1014" y="886" text-anchor="end" font-size="11" letter-spacing="5" fill="${MID}">ΘΕΟΙ ΕΛΛΗΝΩΝ</text>
<circle cx="880" cy="520" r="8" fill="${BRONZE}"/>
<circle cx="880" cy="520" r="3" fill="${PAPER}"/>
</svg>`);

/* ---------------- 三张默认头像（线稿 · 桂冠 / 新月 / 星钉） ---------------- */
const avatarBase = (inner: string) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
<circle cx="210" cy="210" r="207" fill="${PAPER}"/>
<circle cx="210" cy="210" r="207" fill="none" stroke="${INK}" stroke-width="1.4"/>
<circle cx="210" cy="210" r="194" fill="none" stroke="${MID}" stroke-width="0.7"/>
<g stroke="${MID}" stroke-width="0.6" opacity="0.8">
${Array.from({ length: 12 })
  .map((_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return `<line x1="${(210 + Math.cos(a) * 194).toFixed(1)}" y1="${(210 + Math.sin(a) * 194).toFixed(1)}" x2="${(210 + Math.cos(a) * 201).toFixed(1)}" y2="${(210 + Math.sin(a) * 201).toFixed(1)}"/>`;
  })
  .join('')}
</g>
<circle cx="210" cy="20" r="2.4" fill="${BRONZE}"/>
<circle cx="210" cy="400" r="2.4" fill="${BRONZE}"/>
${inner}
</svg>`);

const laurelWreath = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 })
    .map((_, i) => {
      const a = (-160 + i * 14) * (Math.PI / 180);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      return `<path d="M0 0 Q 6 -3.4 11 0.4 Q 6 4.6 0 0" fill="none" stroke="${INK}" stroke-width="1.1" transform="translate(${x} ${y}) rotate(${a * (180 / Math.PI) + 90})"/>`;
    })
    .join('');

export const avatarAssets = [
  avatarBase(`<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round">
<ellipse cx="210" cy="168" rx="50" ry="58"/>
<path d="M186 212 L184 246 M234 212 L236 246"/>
<path d="M146 306 C 156 262 264 262 274 306"/>
<path d="M196 152 C 200 160 210 162 214 156 M206 160 C 210 168 220 170 224 164"/>
</g>
${laurelWreath(210, 168, 62)}
<g fill="${BRONZE}"><circle cx="188" cy="182" r="3.2"/><circle cx="232" cy="182" r="3.2"/></g>
<path d="M150 340 q 12 -10 24 0 q -12 10 -24 0" fill="none" stroke="${MID}" stroke-width="1"/>`),
  avatarBase(`<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round">
<path d="M210 130 C 176 130 160 164 168 196 C 158 222 164 250 184 270 L 236 270 C 256 250 262 222 252 196 C 260 164 244 130 210 130 Z"/>
<path d="M168 202 C 140 212 118 238 116 270 M 252 202 C 280 212 302 238 304 270"/>
<path d="M196 198 C 200 212 216 214 222 202"/>
</g>
<path d="M 262 188 q 10 -12 20 0 q 4 10 -4 14 q -10 0 -16 -14" fill="none" stroke="${BRONZE}" stroke-width="1.3"/>
<path d="M 148 192 l 4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" fill="none" stroke="${MID}" stroke-width="1"/>
<g fill="${BRONZE}"><circle cx="194" cy="190" r="3.2"/><circle cx="228" cy="190" r="3.2"/></g>`),
  avatarBase(`<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round">
<path d="M210 122 C 186 122 178 148 188 170 C 180 196 186 224 198 248 L 222 248 C 234 224 240 196 232 170 C 242 148 234 122 210 122 Z"/>
<path d="M210 122 C 226 98 234 80 236 64 M 210 122 C 194 98 186 80 184 64"/>
<path d="M210 248 C 200 290 206 332 220 358 M 210 248 C 220 290 214 332 200 358"/>
<circle cx="210" cy="324" r="10"/>
<path d="M210 334 L 210 374"/>
</g>
${fourStar(196, 208, 6, BRONZE, 1.2)}
${fourStar(228, 236, 5, MID, 1)}
<path d="M 152 322 q 12 -8 24 0 q -12 10 -24 0" fill="none" stroke="${MID}" stroke-width="1"/>`),
];

/* ---------------- 卡项封面（希腊相框 + 诸神符号） ---------------- */
const cardFrame = (glyph: string) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
<rect x="4" y="4" width="592" height="392" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
<rect x="18" y="18" width="564" height="364" fill="none" stroke="${MID}" stroke-width="0.8"/>
<defs><pattern id="gk2" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 11 V3 H6 V11 H12 V3 H18 V11 H24" fill="none" stroke="${MID}" stroke-width="1"/></pattern></defs>
<rect x="18" y="18" width="564" height="12" fill="url(#gk2)" opacity="0.9"/>
<g fill="${INK}">
<circle cx="300" cy="62" r="2.4"/><circle cx="52" cy="200" r="2.4"/><circle cx="548" cy="200" r="2.4"/>
</g>
<text x="300" y="56" text-anchor="middle" font-size="13" letter-spacing="10" font-family="serif" fill="${MID}">HENHAI · ΘΕΟΙ</text>
${glyph}
</svg>`);

const sunGlyph = (cx: number, cy: number, r: number) => `
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.6"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.52}" fill="none" stroke="${MID}" stroke-width="0.9"/>
<g stroke="${INK}" stroke-width="1.1">
${Array.from({ length: 12 })
  .map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * (r + 12);
    const y1 = cy + Math.sin(a) * (r + 12);
    const x2 = cx + Math.cos(a) * (r + 30);
    const y2 = cy + Math.sin(a) * (r + 30);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  })
  .join('')}
</g>
<circle cx="${cx}" cy="${cy}" r="5" fill="${BRONZE}"/>`;

const moonGlyph = (cx: number, cy: number, r: number) => `
<path d="M ${cx + r * 0.45} ${cy - r} A ${r} ${r} 0 1 0 ${cx + r * 0.45} ${cy + r} A ${r * 0.82} ${r * 0.82} 0 1 1 ${cx + r * 0.45} ${cy - r}" fill="none" stroke="${INK}" stroke-width="1.6"/>
<g fill="${INK}"><circle cx="${cx - r * 1.1}" cy="${cy - r * 0.7}" r="3"/><circle cx="${cx - r * 1.5}" cy="${cy + r * 0.4}" r="2.2"/><circle cx="${cx - r * 0.8}" cy="${cy + r * 0.9}" r="2.6"/></g>
<circle cx="${cx + r * 0.62}" cy="${cy - r * 0.05}" r="5" fill="${BRONZE}"/>`;

const pleiadesGlyph = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 7 }).map((_, i) => {
    const a = -Math.PI / 2 + (i / 6) * Math.PI;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const lines = [0, 2, 4, 6, 1, 3, 5].map((i) => pts[i]);
  return `
<circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="${INK}" stroke-width="1.2"/>
<path d="${lines.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="${MID}" stroke-width="0.9" stroke-dasharray="3 5"/>
${pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === 3 ? 5 : 3.4}" fill="${i === 3 ? BRONZE : INK}"/>`).join('')}`;
};

const bowGlyph = (cx: number, cy: number, r: number) => `
<path d="M ${cx - r * 1.2} ${cy + r * 0.5} Q ${cx} ${cy - r * 1.3} ${cx + r * 1.2} ${cy + r * 0.5}" fill="none" stroke="${INK}" stroke-width="1.6"/>
<line x1="${cx - r * 1.2}" y1="${cy + r * 0.5}" x2="${cx + r * 1.2}" y2="${cy + r * 0.5}" stroke="${INK}" stroke-width="1.1"/>
<line x1="${cx}" y1="${cy + r * 0.5}" x2="${cx}" y2="${cy + r * 0.95}" stroke="${INK}" stroke-width="1.1"/>
<path d="M ${cx} ${cy + r * 0.95} l -7 -7 M ${cx} ${cy + r * 0.95} l 7 -7" stroke="${INK}" stroke-width="0.9"/>
<path d="M ${cx + r * 0.35} ${cy - r * 0.95} A ${r * 0.9} ${r * 0.9} 0 1 0 ${cx + r * 0.35} ${cy + r * 0.35} A ${r * 0.74} ${r * 0.74} 0 1 1 ${cx + r * 0.35} ${cy - r * 0.95}" fill="none" stroke="${MID}" stroke-width="1"/>`;

const hourglassGlyph = (cx: number, cy: number, r: number) => `
<path d="M ${cx - r * 0.9} ${cy - r * 1.1} H ${cx + r * 0.9} L ${cx} ${cy} L ${cx - r * 0.9} ${cy + r * 1.1} H ${cx + r * 0.9} L ${cx} ${cy} Z" fill="none" stroke="${INK}" stroke-width="1.6"/>
<line x1="${cx - r * 1.1}" y1="${cy - r * 1.1}" x2="${cx + r * 1.1}" y2="${cy - r * 1.1}" stroke="${INK}" stroke-width="1.2"/>
<line x1="${cx - r * 1.1}" y1="${cy + r * 1.1}" x2="${cx + r * 1.1}" y2="${cy + r * 1.1}" stroke="${INK}" stroke-width="1.2"/>
<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.35}" ry="${r * 0.5}" fill="none" stroke="${MID}" stroke-width="0.9" transform="rotate(-18 ${cx} ${cy})"/>
<g fill="${INK}"><circle cx="${cx - r * 0.2}" cy="${cy + r * 0.55}" r="2"/><circle cx="${cx}" cy="${cy + r * 0.75}" r="1.8"/><circle cx="${cx + r * 0.25}" cy="${cy + r * 0.5}" r="2"/><circle cx="${cx - r * 0.25}" cy="${cy + r * 0.95}" r="1.6"/></g>
<circle cx="${cx}" cy="${cy - r * 0.45}" r="4.5" fill="${BRONZE}"/>`;

const wavesSunGlyph = (cx: number, cy: number, r: number) => `
<circle cx="${cx}" cy="${cy - r * 0.55}" r="${r * 0.55}" fill="none" stroke="${INK}" stroke-width="1.5"/>
<g stroke="${INK}" stroke-width="1">
${Array.from({ length: 10 })
  .map((_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return `<line x1="${(cx + Math.cos(a) * (r * 0.72)).toFixed(1)}" y1="${(cy - r * 0.55 + Math.sin(a) * (r * 0.72)).toFixed(1)}" x2="${(cx + Math.cos(a) * (r * 0.9)).toFixed(1)}" y2="${(cy - r * 0.55 + Math.sin(a) * (r * 0.9)).toFixed(1)}"/>`;
  })
  .join('')}
</g>
<path d="M ${cx - r * 1.2} ${cy + r * 0.55} q ${r * 0.3} -18 ${r * 0.6} 0 q ${r * 0.3} -18 ${r * 0.6} 0 q ${r * 0.3} -18 ${r * 0.6} 0 q ${r * 0.3} -18 ${r * 0.6} 0" fill="none" stroke="${INK}" stroke-width="1.2"/>
<circle cx="${cx}" cy="${cy - r * 0.55}" r="4.5" fill="${BRONZE}"/>`;

const phasesGlyph = (cx: number, cy: number, r: number) => {
  const R = r * 0.52;
  const xs = [-1.5, -0.75, 0, 0.75, 1.5].map((k) => (cx + k * r).toFixed(1));
  const outline = (x: string) =>
    `<circle cx="${x}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
  const crescent = (x: string) =>
    `<path d="M ${(Number(x) + R * 0.45).toFixed(1)} ${cy - R} A ${R} ${R} 0 1 0 ${(Number(x) + R * 0.45).toFixed(1)} ${cy + R} A ${(R * 0.82).toFixed(1)} ${(R * 0.82).toFixed(1)} 0 1 1 ${(Number(x) + R * 0.45).toFixed(1)} ${cy - R}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
  const full = (x: string) =>
    `<circle cx="${x}" cy="${cy}" r="${R}" fill="${INK}"/>`;
  const gibbous = (x: string) =>
    `<circle cx="${x}" cy="${cy}" r="${R}" fill="${INK}"/><path d="M ${(Number(x) + R * 0.5).toFixed(1)} ${cy - R} A ${R} ${R} 0 1 0 ${(Number(x) + R * 0.5).toFixed(1)} ${cy + R} A ${(R * 0.92).toFixed(1)} ${(R * 0.92).toFixed(1)} 0 1 1 ${(Number(x) + R * 0.5).toFixed(1)} ${cy - R} Z" fill="${PAPER}"/>`;
  const half = (x: string) =>
    `<path d="M ${x} ${cy - R} A ${R} ${R} 0 0 1 ${x} ${cy + R} Z" fill="${INK}"/><circle cx="${x}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
  return [outline(xs[0]), crescent(xs[1]), full(xs[2]), gibbous(xs[3]), half(xs[4])].join('');
};

export const crownCardImages = [
  cardFrame(sunGlyph(300, 244, 76)), // 日冠 · 赫利俄斯
  cardFrame(pleiadesGlyph(300, 244, 84)), // 周冠 · 昴星团
  cardFrame(bowGlyph(300, 244, 74)), // 月冠 · 阿尔忒弥斯
  cardFrame(hourglassGlyph(300, 244, 70)), // 年冠 · 克洛诺斯
];

export const packageCardImages = [
  cardFrame(wavesSunGlyph(300, 244, 66)), // 包天 · 太阳升起
  cardFrame(moonGlyph(300, 244, 72)), // 包夜 · 塞勒涅
  cardFrame(pleiadesGlyph(300, 244, 78)), // 包周 · 七曜
  cardFrame(phasesGlyph(300, 244, 30)), // 包月 · 月相
  cardFrame(hourglassGlyph(300, 244, 66)), // 包年 · 时间之沙
];

/* ---------------- VIP 徽章（月桂环绕） ---------------- */
export const vipBadgeAsset = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260">
<circle cx="130" cy="130" r="112" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>
<circle cx="130" cy="130" r="98" fill="none" stroke="${MID}" stroke-width="0.8"/>
<path d="M 46 96 C 52 70 84 60 112 62 C 116 74 116 88 110 100 C 88 98 62 106 46 96 Z" fill="none" stroke="${INK}" stroke-width="1.2"/>
<path d="M 214 96 C 208 70 176 60 148 62 C 144 74 144 88 150 100 C 172 98 198 106 214 96 Z" fill="none" stroke="${INK}" stroke-width="1.2"/>
<path d="M 40 170 C 60 162 78 168 86 182 C 100 176 118 178 126 190 C 134 178 152 176 166 182 C 174 168 192 162 212 170 C 204 190 176 204 148 206 C 122 206 96 194 40 170 Z" fill="none" stroke="${INK}" stroke-width="1.2"/>
<text x="130" y="142" text-anchor="middle" font-size="34" font-family="serif" fill="${INK}">VIP</text>
<text x="130" y="166" text-anchor="middle" font-size="11" letter-spacing="6" fill="${MID}">恨海情天</text>
${fourStar(130, 24, 6, INK, 1)}
<circle cx="130" cy="228" r="4" fill="${BRONZE}"/>
</svg>`);

/* ---------------- 塔罗牌（480 × 800 竖版 · 希腊众神） ---------------- */
const tarotFrame = (inner: string, watermark: string) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 800">
<rect x="3" y="3" width="474" height="794" rx="22" fill="${PAPER}" stroke="${INK}" stroke-width="1.8"/>
<rect x="20" y="20" width="440" height="760" rx="14" fill="none" stroke="${INK}" stroke-width="1.2"/>
<rect x="30" y="30" width="420" height="740" rx="10" fill="none" stroke="${MID}" stroke-width="0.7"/>
<defs><pattern id="gkt" width="24" height="14" patternUnits="userSpaceOnUse"><path d="M0 11 V3 H6 V11 H12 V3 H18 V11 H24" fill="none" stroke="${MID}" stroke-width="1"/></pattern></defs>
<rect x="30" y="30" width="420" height="12" fill="url(#gkt)" opacity="0.85"/>
<rect x="30" y="758" width="420" height="12" fill="url(#gkt)" opacity="0.85"/>
<g fill="${INK}">
<circle cx="240" cy="64" r="2.6"/><circle cx="240" cy="736" r="2.6"/>
<circle cx="52" cy="400" r="2.6"/><circle cx="428" cy="400" r="2.6"/>
</g>
<text x="240" y="112" text-anchor="middle" font-size="17" letter-spacing="10" font-family="serif" fill="${MID}">${watermark}</text>
${inner}
<text x="240" y="742" text-anchor="middle" font-size="12" letter-spacing="8" font-family="serif" fill="${MID}">ΜΟΙΡΑΙ · LE</text>
</svg>`);

const bigSun = `
<circle cx="240" cy="360" r="118" fill="none" stroke="${INK}" stroke-width="1.8"/>
<circle cx="240" cy="360" r="86" fill="none" stroke="${MID}" stroke-width="0.9"/>
<g stroke="${INK}" stroke-width="1.2">
${Array.from({ length: 16 })
  .map((_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `<line x1="${(240 + Math.cos(a) * 134).toFixed(1)}" y1="${(360 + Math.sin(a) * 134).toFixed(1)}" x2="${(240 + Math.cos(a) * 164).toFixed(1)}" y2="${(360 + Math.sin(a) * 164).toFixed(1)}"/>`;
  })
  .join('')}
</g>
<circle cx="240" cy="360" r="9" fill="${BRONZE}"/>
<path d="M160 600 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="none" stroke="${INK}" stroke-width="1"/>
<g fill="${INK}"><circle cx="140" cy="560" r="3.4"/><circle cx="320" cy="580" r="2.6"/><circle cx="336" cy="240" r="3"/></g>`;

const bigMoon = `
<path d="M 292 240 A 130 130 0 1 0 292 480 A 106 106 0 1 1 292 240" fill="none" stroke="${INK}" stroke-width="1.8"/>
<circle cx="240" cy="330" r="7" fill="${BRONZE}"/>
<g fill="${INK}"><circle cx="150" cy="262" r="4"/><circle cx="186" cy="560" r="3"/><circle cx="320" cy="560" r="4.4"/><circle cx="150" cy="400" r="2.4"/></g>
<path d="M180 190 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4 Z" fill="none" stroke="${MID}" stroke-width="1"/>
<path d="M 146 560 Q 186 500 226 566" fill="none" stroke="${MID}" stroke-width="1" stroke-dasharray="3 6"/>
<path d="M 220 592 l 14 -7 M 232 590 l 7 4" stroke="${MID}" stroke-width="0.9"/>`;

const bigStar = `
<path d="M240 208 L254 348 L380 348 L262 430 L304 560 L240 482 L176 560 L218 430 L100 348 L226 348 Z" fill="none" stroke="${INK}" stroke-width="1.8"/>
<path d="M240 258 L248 344 L330 344 L254 400 L280 478 L240 422 L200 478 L226 400 L150 344 L232 344 Z" fill="none" stroke="${MID}" stroke-width="0.9"/>
<circle cx="240" cy="348" r="8" fill="${BRONZE}"/>
<circle cx="240" cy="348" r="52" fill="none" stroke="${MID}" stroke-width="0.8" stroke-dasharray="2 8"/>
<g fill="${INK}"><circle cx="166" cy="262" r="2.8"/><circle cx="300" cy="246" r="2.4"/><circle cx="330" cy="560" r="2.8"/><circle cx="152" cy="520" r="2.4"/></g>
<path d="M166 262 L240 348 L330 560 M300 246 L240 348 L152 520" stroke="${MID}" stroke-width="0.7" stroke-dasharray="2 6"/>`;

export const tarotBackImages = [
  tarotFrame(bigSun, 'ΗΛΙΟΣ · Ⅰ 日'),
  tarotFrame(bigMoon, 'ΣΕΛΗΝΗ · Ⅱ 月'),
  tarotFrame(bigStar, 'ΑΣΤΡΑΙΑ · Ⅲ 星'),
];

export const majorArcanaPlaceholder = tarotFrame(
  `<text x="240" y="226" text-anchor="middle" font-size="64" font-family="serif" fill="${INK}">Μοῖραι</text>
<path d="M 150 250 C 200 300 180 420 220 470 M 240 250 C 240 320 240 420 240 470 M 330 250 C 280 300 300 420 260 470" fill="none" stroke="${INK}" stroke-width="1.4"/>
<path d="M150 250 C 180 240 220 240 240 250 M 240 250 C 260 240 300 240 330 250" fill="none" stroke="${MID}" stroke-width="0.9"/>
${fourStar(150, 250, 7, INK, 1.1)}
${fourStar(330, 250, 7, INK, 1.1)}
<path d="M 196 470 l -12 -2 l 3 12 M 284 470 l 12 -2 l -3 12" stroke="${INK}" stroke-width="1"/>
<circle cx="240" cy="560" r="6" fill="${BRONZE}"/>
<text x="240" y="620" text-anchor="middle" font-size="13" letter-spacing="8" font-family="serif" fill="${MID}">命运三女神</text>
<text x="240" y="644" text-anchor="middle" font-size="12" letter-spacing="4" fill="${MID}">静候揭晓 · 未配置</text>`,
  'ΜΟΙΡΑΙ'
);

export const minorCardPlaceholders = [
  tarotFrame(sunGlyph(240, 400, 76), 'ΗΛΙΟΣ'),
  tarotFrame(moonGlyph(240, 400, 72), 'ΣΕΛΗΝΗ'),
  tarotFrame(pleiadesGlyph(240, 400, 70), 'ΑΣΤΡΑΙΑ'),
];

/* ---------------- 示例二维码（不可扫码，纯视觉占位） ---------------- */
export const qrPlaceholder = (() => {
  let seed = 20260416;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const n = 21;
  const cells: string[] = [];
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() < 0.44) cells.push(`<rect x="${x * 12}" y="${y * 12}" width="12" height="12"/>`);
    }
  const finder = (ox: number, oy: number) =>
    `<g fill="${INK}"><rect x="${ox}" y="${oy}" width="84" height="84"/><rect x="${ox + 12}" y="${oy + 12}" width="60" height="60" fill="${PAPER}"/><rect x="${ox + 24}" y="${oy + 24}" width="36" height="36"/></g>`;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 252">
<rect width="252" height="252" fill="${PAPER}"/>
<g fill="${INK}">${cells.join('')}</g>
${finder(0, 0)}${finder(168, 0)}${finder(0, 168)}
<circle cx="126" cy="126" r="10" fill="${BRONZE}"/>
</svg>`);
})();

/* ---------------- 空状态插画 ---------------- */
export const emptyArt = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
<circle cx="160" cy="100" r="62" fill="none" stroke="${MID}" stroke-width="1"/>
<circle cx="160" cy="100" r="62" fill="none" stroke="${MID}" stroke-width="0.6" stroke-dasharray="3 8" transform="rotate(40 160 100)"/>
<path d="M160 100 L 160 62 M160 100 L 187 116" stroke="${INK}" stroke-width="1.2"/>
<path d="M 160 100 L 160 38 M 160 100 L 187 116" stroke="${INK}" stroke-width="1.2"/>
<path d="M 118 62 Q 126 70 134 62" fill="none" stroke="${MID}" stroke-width="0.9"/>
<circle cx="160" cy="100" r="4" fill="${BRONZE}"/>
<text x="160" y="190" text-anchor="middle" font-size="13" letter-spacing="6" fill="${MID}">ΜΟΙΡΑΙ · EMPTY</text>
</svg>`);
