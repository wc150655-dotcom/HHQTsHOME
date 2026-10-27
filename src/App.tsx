/** 路由与应用外壳 —— 老板端 + 超级管理员后台（/admin） */
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { ThemeManager } from './components/ThemeManager';
import { MusicSystem } from './components/MusicSystem';
import { Cursor } from './components/Cursor';
import { HalfClock } from './components/HalfClock';
import { VersionBadge } from './components/VersionBadge';
import { OpeningPage } from './components/OpeningPage';
import { HomePage } from './pages/HomePage';
import { CompanionsPage } from './pages/CompanionsPage';
import { CompanionDetailPage } from './pages/CompanionDetailPage';
import { AdminApp } from './pages/admin/AdminApp';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** 老板端全局背景层：半圆钟表 + 圆点光标 + 音乐系统 + 左下角版本号 */
function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HalfClock />
      <Cursor />
      <MusicSystem />
      <VersionBadge />
      {children}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ThemeManager />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ClientShell><OpeningPage /></ClientShell>} />
          <Route path="/home" element={<ClientShell><HomePage /></ClientShell>} />
          <Route path="/companions" element={<ClientShell><CompanionsPage /></ClientShell>} />
          <Route path="/companions/:id" element={<ClientShell><CompanionDetailPage /></ClientShell>} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
