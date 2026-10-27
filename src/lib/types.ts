/** 全站数据类型定义 —— 前端零写死，所有内容由后台数据库驱动 */

export type ID = string;

/* ---------------- 站点全局设置 ---------------- */
export interface SiteSettings {
  title: string;
  subtitle: string;
  slogan: string;
  intro: string;
  logoUrl: string;
  heroUrl: string;
  faviconUrl: string;
  openHour: string; // 北京时间营业开始
  closeHour: string; // 北京时间营业结束
  themeMode: 'light' | 'dark' | 'auto';
  accent: string;
  siteVersion: string; // 站点版本号（前台左下角展示，后台可改）
  effects: {
    dotCursor: boolean; // 圆点自定义光标
    titleReveal: boolean; // 开场标题渐变浮现
    parallax: boolean; // 鼠标 / 陀螺仪晃动动捕
    tarotFlip: boolean; // 塔罗翻面动画
    cardGlow: boolean; // 卡片悬浮发光浮起
    quoteFx: boolean; // 左下角逐字 + 随机模糊消隐
  };
  music: {
    autoplay: boolean;
    random: boolean;
    volume: number; // 0-1
    clockLinked: boolean; // 与左侧半圆钟表联动
  };
  sensitive: {
    globalMask: boolean; // 全站敏感字段统一打码
  };
}

/* ---------------- 开场页 ---------------- */
export interface QuoteStyle {
  fontSize: number;
  color: string;
  letterSpacing: number; // em
  lineHeight: number;
  padTop: number;
  padRight: number;
  padBottom: number;
  padLeft: number;
  charInterval: number; // 逐字出现间隔 ms
  blurMin: number; // 随机模糊下限 px
  blurMax: number; // 随机模糊上限 px
  fadeMin: number; // 随机消隐目标不透明度下限 0-1
  fadeMax: number; // 随机消隐目标不透明度上限 0-1
}
export interface OpeningQuote {
  id: ID;
  text: string;
  enabled: boolean;
  style: QuoteStyle;
}
export interface OpeningConfig {
  titleImageUrl: string; // 自定义「恨海情天」标题图（空 = 使用排版文字）
  quotes: OpeningQuote[];
}

/* ---------------- 公共选项库 ---------------- */
export interface OptionItem {
  id: ID;
  label: string;
  enabled: boolean;
  order: number;
}
export interface OptionLibraries {
  voices: OptionItem[]; // 音色库
  games: OptionItem[]; // 游戏库
  services: OptionItem[]; // 服务类型库
  avatarPresets: string[]; // 三张默认头像直链
}

/* ---------------- 团队概况 ---------------- */
export interface ContactRow {
  id: ID;
  role: string;
  name: string;
  contact: string;
  note: string;
}
export interface TeamOverview {
  memberCount: number;
  serviceGames: string[];
  leadership: ContactRow[]; // 团长/副团/管理/应聘管理/公关
  reception: ContactRow[]; // 六大直属接待
  applyUrl: string;
  orderUrl: string;
}

/* ---------------- 卡项 ---------------- */
export interface CrownCard {
  id: ID;
  name: string;
  imageUrl: string;
  perks: string[];
  enabled: boolean;
  order: number;
}
export interface PackageCard {
  id: ID;
  name: string;
  duration: string;
  price: string;
  services: string[];
  imageUrl: string;
  consultUrl: string;
  enabled: boolean;
  order: number;
}
export interface VipTier {
  label: string;
  price: string;
}
export interface VipCard {
  id: ID;
  name: string;
  benefits: string[];
  tiers: VipTier[];
  badgeUrl: string;
  consultUrl: string;
  enabled: boolean;
  order: number;
}
export interface CardCollection {
  crown: CrownCard[];
  packages: PackageCard[];
  vip: VipCard[];
}

/* ---------------- 陪玩 ---------------- */
export interface RecordItem {
  id: ID;
  kind: 'record' | 'review'; // 战绩 / 评价
  content: string;
  date: string;
}
export interface SocialAccount {
  platform: string;
  account: string;
  hidden: boolean;
}
export interface Companion {
  id: ID;
  nickname: string;
  avatarMode: 'random' | 'custom';
  avatarUrl: string; // custom 模式使用；random 模式留空自动分配默认头像
  voice: string; // 音色（选项库）
  games: string[]; // 可接游戏
  services: string[]; // 服务类型
  shortIntro: string; // 首页简短简介
  signature: string; // 一句话个性签名
  detail: string; // 详情页完整简介
  rank: string; // 段位
  specialty: string; // 特长
  price: string; // 价格 / 其它信息
  status: 'active' | 'left'; // left=退团，前端隐藏
  extra: {
    showAge: boolean;
    age: string;
    showHours: boolean;
    hours: string; // 接单时间段
    showTags: boolean;
    tags: string[];
    showSocial: boolean;
    social: SocialAccount[];
  };
  records: RecordItem[];
}

/* ---------------- 本月头牌 ---------------- */
export interface TopCompanion {
  id: ID;
  rank: number;
  companionId: string;
  name: string;
  avatarUrl: string;
  tags: string[];
  stats: { label: string; value: string }[];
  badge: string;
  glow: string; // 装饰光效 css 颜色
  enabled: boolean;
}

/* ---------------- 老板消费前三 · 塔罗 ---------------- */
export interface MinorCard {
  id: ID;
  imageUrl: string;
  title: string;
  meaning: string;
}
export interface TarotSeat {
  id: ID;
  rank: 1 | 2 | 3; // 1=日牌 2=月牌 3=星牌
  configured: boolean;
  bossName: string;
  anonymous: boolean; // 昵称匿名化
  amount: string; // 敏感字段
  maskAmount: boolean; // 金额打码加密
  level: string; // 消费等级
  title: string; // 专属称号
  badge: string; // 专属徽章
  glow: string; // 装饰光效
  majorName: string; // 大阿尔卡纳牌名
  majorUrl: string; // 大阿尔卡纳牌图
  majorMeaning: string; // 主牌释义
  minors: MinorCard[]; // 三张附属小牌
}

/* ---------------- 页脚 / 感谢名单 / 打赏台账 ---------------- */
export interface ThanksEntry {
  id: ID;
  name: string;
  note: string;
}
export interface LedgerEntry {
  id: ID;
  period: string; // 期数说明
  income: string; // 打赏总收入
  donated: string; // 捐款金额
  date: string;
  proofUrl: string; // 凭证图片
}
export interface FooterConfig {
  devText: string;
  devNote: string;
  thanks: ThanksEntry[];
  donationQr: string;
  donationNote: string;
  ledger: LedgerEntry[];
}

/* ---------------- 音乐 ---------------- */
export interface MusicTrack {
  id: ID;
  name: string;
  url: string; // 外链地址（优先级最高）
  blobKey?: string; // 上传的本地音频文件（存于浏览器 IndexedDB）
}

/* ---------------- 账号 / 日志 / 素材 ---------------- */
export type PermissionKey =
  | 'site'
  | 'opening'
  | 'options'
  | 'team'
  | 'cards'
  | 'companions'
  | 'top'
  | 'tarot'
  | 'footer'
  | 'assets'
  | 'accounts'
  | 'logs';
export const ALL_PERMISSIONS: PermissionKey[] = [
  'site',
  'opening',
  'options',
  'team',
  'cards',
  'companions',
  'top',
  'tarot',
  'footer',
  'assets',
  'accounts',
  'logs',
];
export interface AdminAccount {
  id: ID;
  username: string;
  passwordHash: string;
  role: 'super' | 'sub';
  permissions: PermissionKey[];
  frozen: boolean;
  createdAt: string;
  lastLogin: string;
}
export interface LogEntry {
  id: ID;
  time: string;
  user: string;
  module: string;
  action: string;
  detail: string;
  sensitive: boolean;
}
export interface AssetItem {
  id: ID;
  name: string;
  url: string;
  category: string;
  createdAt: string;
}

/* ---------------- 数据库根 ---------------- */
export interface DB {
  version: number;
  settings: SiteSettings;
  opening: OpeningConfig;
  options: OptionLibraries;
  team: TeamOverview;
  cards: CardCollection;
  companions: Companion[];
  top: TopCompanion[];
  tarot: TarotSeat[];
  footer: FooterConfig;
  tracks: MusicTrack[];
  assets: AssetItem[];
  accounts: AdminAccount[];
  logs: LogEntry[];
  monthKey: string; // 头牌月度重置标记（YYYY-MM）
}
