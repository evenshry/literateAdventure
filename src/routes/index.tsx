/**
 * 路由配置
 * 使用 React Router v6 + 懒加载
 */

import { lazy, Suspense, type JSX } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';

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

// 路由守卫（如需要登录验证）
function PrivateRoute({ children }: { children: JSX.Element }) {
  // 当前项目无需登录验证，直接返回
  // 如需添加验证逻辑：
  // const token = useUserStore((state) => state.token);
  // return token ? children : <Navigate to="/login" replace />;
  return children;
}

// 路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LazyWrapper>
        <Home />
      </LazyWrapper>
    ),
  },
  {
    path: '/map',
    element: (
      <LazyWrapper>
        <Map />
      </LazyWrapper>
    ),
  },
  {
    path: '/map/:level',
    element: (
      <LazyWrapper>
        <Map />
      </LazyWrapper>
    ),
  },
  {
    path: '/learn/:char',
    element: (
      <LazyWrapper>
        <Learn />
      </LazyWrapper>
    ),
  },
  {
    path: '/wrong',
    element: (
      <LazyWrapper>
        <WrongBook />
      </LazyWrapper>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <LazyWrapper>
        <Dashboard />
      </LazyWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

// 创建路由实例
export const router = createBrowserRouter(routes);

export default router;
