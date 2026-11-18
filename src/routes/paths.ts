/**
 * 路由常量
 * 集中管理路径，避免硬编码字符串
 */
export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  MAP_LEVEL: (level: string) => `/map/${level}`,
  LEARN_CHAR: (char: string) => `/learn/${encodeURIComponent(char)}`,
  WRONG: '/wrong',
  DASHBOARD: '/dashboard',
} as const;
