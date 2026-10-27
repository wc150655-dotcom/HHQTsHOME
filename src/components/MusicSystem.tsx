/** 音乐系统 —— 将后台音乐配置同步到 AudioManager，并处理进入页面自动播放 */
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { audio } from '../lib/audio';

export function MusicSystem() {
  const { db } = useStore();
  const tracks = db.tracks;
  const { music } = db.settings;

  useEffect(() => {
    audio.configure(tracks, music.volume, music.random);
  }, [tracks, music.volume, music.random]);

  useEffect(() => {
    audio.setVolume(music.volume);
  }, [music.volume]);

  /* 进入网站的第一次点击 / 按键 → 自动开始播放（浏览器自动播放策略要求用户手势） */
  useEffect(() => {
    const start = () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      if (music.autoplay && !audio.playing) audio.play();
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [music.autoplay]);

  return null;
}
