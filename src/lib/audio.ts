/**
 * 背景音乐管理器 ——
 * · 歌单来自后台（上传的音频 URL / 文件）
 * · 无真实音频时自动使用内置 Web Audio 程序合成环境音（保证开箱即用）
 * · 播放状态通过订阅广播给：右上角唱片按钮、左侧半圆钟表
 */
import type { MusicTrack } from './types';
import { getBlobUrl } from './blobStore';

export interface MusicState {
  playing: boolean;
  track: MusicTrack | null;
}

type Listener = (s: MusicState) => void;

const CHORD = [220.0, 277.18, 329.63, 415.3]; // A3 C#4 E4 G#4 —— 安静的夜航和弦

class AudioManager {
  private el: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[] = [];
  private tracks: MusicTrack[] = [];
  private volume = 0.5;
  private randomOrder = true;
  private idx = 0;

  playing = false;
  current: MusicTrack | null = null;
  private previewingId: string | null = null;
  private listeners = new Set<Listener>();

  /* ---------- 配置（由 MusicSystem 组件同步后台数据） ---------- */
  configure(tracks: MusicTrack[], volume: number, randomOrder: boolean): void {
    this.tracks = tracks;
    this.volume = volume;
    this.randomOrder = randomOrder;
    this.el && (this.el.volume = volume);
    if (this.current && !tracks.some((t) => t.id === this.current!.id)) {
      this.stopAll();
      this.current = null;
      this.emit();
    }
  }

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    cb(this.snapshot());
    return () => this.listeners.delete(cb);
  }

  private snapshot(): MusicState {
    return { playing: this.playing, track: this.current };
  }
  private emit(): void {
    const s = this.snapshot();
    this.listeners.forEach((cb) => cb(s));
  }

  /* ---------- 控制 ---------- */
  toggle(): void {
    this.playing ? this.pause() : this.play();
  }

  play(): void {
    if (this.playing) return;
    if (this.tracks.length === 0) return;
    if (!this.current) this.pick(false);
    const t = this.current;
    if (!t) return;
    this.playing = true;
    if (t.url || t.blobKey) {
      void this.resolveTrackUrl(t).then((url) => {
        if (url) this.playUrlObject(url);
        else this.startProcedural();
        this.emit();
      });
    } else {
      this.startProcedural();
      this.emit();
    }
  }

  pause(): void {
    if (!this.playing) return;
    this.stopAll();
    this.playing = false;
    this.emit();
  }

  /** 随机 / 顺序切换下一首 */
  next(): void {
    if (this.tracks.length === 0) return;
    const wasPlaying = this.playing;
    this.stopAll();
    this.pick(true);
    const t = this.current;
    if (!t) {
      this.emit();
      return;
    }
    if (!wasPlaying) {
      this.playing = false;
      this.emit();
      return;
    }
    this.playing = true;
    if (t.url || t.blobKey) {
      void this.resolveTrackUrl(t).then((url) => {
        if (url) this.playUrlObject(url);
        else this.startProcedural();
        this.emit();
      });
    } else {
      this.startProcedural();
      this.emit();
    }
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.el) this.el.volume = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.1);
    }
  }

  /** 后台试听：不影响正式歌单与播放状态（试听会暂停主播放） */
  preview(track: MusicTrack): void {
    if (this.previewingId === track.id) {
      this.stopAll();
      this.previewingId = null;
      return;
    }
    if (this.playing) {
      this.playing = false;
      this.emit();
    }
    this.stopAll();
    this.previewingId = track.id;
    if (!track.url && !track.blobKey) {
      this.startProcedural();
      return;
    }
    void this.resolveTrackUrl(track).then((url) => {
      if (!url) {
        this.previewingId = null;
        return;
      }
      try {
        const a = new Audio(url);
        a.volume = this.volume;
        a.onended = () => {
          this.previewingId = null;
        };
        a.play().catch(() => {
          this.previewingId = null;
        });
        this.el = a;
      } catch {
        this.previewingId = null;
      }
    });
  }

  /** 当前是否正在试听某曲目 */
  isPreviewing(trackId: string): boolean {
    return this.previewingId === trackId;
  }

  /** 释放某本地音频的 object URL（删除曲目时调用，防止内存泄漏） */
  invalidate(blobKey: string): void {
    const u = this.urlCache.get(blobKey);
    if (u) {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* noop */
      }
      this.urlCache.delete(blobKey);
    }
  }

  /* ---------- 内部 ---------- */
  private urlCache = new Map<string, string>();

  /** 解析曲目可播放地址：外链优先，其次 IndexedDB 本地音频，都没有则用内置环境音 */
  private async resolveTrackUrl(t: MusicTrack): Promise<string | null> {
    if (t.url) return t.url;
    if (t.blobKey) {
      const cached = this.urlCache.get(t.blobKey);
      if (cached) return cached;
      try {
        const u = await getBlobUrl(t.blobKey);
        if (u) this.urlCache.set(t.blobKey, u);
        return u;
      } catch {
        return null;
      }
    }
    return null;
  }

  private pick(forceNext: boolean): void {
    if (this.tracks.length === 0) {
      this.current = null;
      return;
    }
    if (this.randomOrder) {
      const pool = this.tracks.filter((t) => t.id !== this.current?.id);
      const src = pool.length > 0 ? pool : this.tracks;
      this.current = src[Math.floor(Math.random() * src.length)] ?? null;
    } else if (forceNext) {
      this.idx = (this.idx + 1) % this.tracks.length;
      this.current = this.tracks[this.idx];
    } else {
      this.idx = this.idx % this.tracks.length;
      this.current = this.tracks[this.idx];
    }
  }

  private playUrlObject(url: string): void {
    try {
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.loop = false;
      audio.onended = () => {
        if (this.playing) this.next();
      };
      audio.play().catch(() => {
        /* 自动播放被拦截时静默降级 */
      });
      this.el = audio;
    } catch {
      this.startProcedural();
    }
  }

  private stopAll(): void {
    if (this.el) {
      this.el.pause();
      this.el.src = '';
      this.el = null;
    }
    this.stopProcedural();
  }

  /* 程序合成环境音：安静的持续和弦 + 缓慢呼吸 */
  private startProcedural(): void {
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) this.ctx = new Ctor();
      void this.ctx.resume();
      const ctx = this.ctx;
      if (!this.master) {
        this.master = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 900;
        this.master.connect(lp);
        lp.connect(ctx.destination);
      }
      this.master.gain.setTargetAtTime(this.volume * 0.4, ctx.currentTime, 0.8);
      CHORD.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 4;
        const g = ctx.createGain();
        g.gain.value = 0.0;
        g.gain.setTargetAtTime(0.12, ctx.currentTime, 1.2);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.017;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        osc.connect(g);
        g.connect(this.master!);
        osc.start();
        lfo.start();
        this.oscNodes.push({ osc, gain: g, lfo });
      });
    } catch {
      /* AudioContext 不可用时保持静默 */
    }
  }

  private stopProcedural(): void {
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    }
    this.oscNodes.forEach(({ osc, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
      } catch {
        /* noop */
      }
    });
    this.oscNodes = [];
  }
}

export const audio = new AudioManager();
