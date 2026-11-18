/**
 * 路由配置
 * 使用 React Router v6 + 懒加载 + 哈希模式
 * 哈希模式：URL 形如 #/map/L1，无需服务器配置
 */

import { lazy, Suspense, type JSX } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './paths';

// 懒加载页面组件
const Home = lazy(() => import('@/pages/Home'));
const Map = lazy(() => import('@/pages/Map'));
const Learn = lazy(() => import('@/pages/Learn'));
const WrongBook = lazy(() => import('@/pages/WrongBook'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// 加载中组件
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #fff5d6, #e8f5e0)',
        fontFamily: '"PingFang SC", sans-serif',
        fontSize: 24,
        color: '#2d8b57',
      }}
    >
      正在加载冒险地图…
    </div>
  );
}

// 懒加载包装器
function LazyWrapper({ children }: { children: JSX.Element }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

/**
 * 哈希模式路由应用
 * URL 形如：https://example.com/#/map/L1
 */
function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <LazyWrapper>
              <Home />
            </LazyWrapper>
          }
        />
        <Route
          path={ROUTES.MAP}
          element={
            <LazyWrapper>
              <Map />
            </LazyWrapper>
          }
        />
        <Route
          path="/map/:level"
          element={
            <LazyWrapper>
              <Map />
            </LazyWrapper>
          }
        />
        <Route
          path="/learn/:char"
          element={
            <LazyWrapper>
              <Learn />
            </LazyWrapper>
          }
        />
        <Route
          path={ROUTES.WRONG}
          element={
            <LazyWrapper>
              <WrongBook />
            </LazyWrapper>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <LazyWrapper>
              <Dashboard />
            </LazyWrapper>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;