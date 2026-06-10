/**
 * API 请求层基础配置
 * 基于 axios 封装，支持请求/响应拦截器
 */

// 由于当前项目不依赖外部 API，这里提供基础模板
// 如需接入后端 API，安装 axios: yarn add axios

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
}

const defaultConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
};

/**
 * 创建请求实例的工厂函数
 * 当需要接入后端 API 时，安装 axios 并取消注释以下代码
 */
export function createRequest(config: ApiConfig = defaultConfig) {
  // 示例代码（需要安装 axios）:
  // import axios from 'axios';
  // const request = axios.create(config);
  // request.interceptors.request.use(...);
  // request.interceptors.response.use(...);
  // return request;

  console.warn('API layer not configured. Install axios and implement createRequest.');
  return null;
}

export default createRequest;
