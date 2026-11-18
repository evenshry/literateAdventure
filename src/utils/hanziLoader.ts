import type { CharDataLoaderFn } from 'hanzi-writer';

/**
 * 笔顺数据加载器
 * 优先读取构建时复制到 public/hanzi-data 的本地数据（离线可用），
 * 本地缺失时回退到 hanzi-writer 官方 CDN。
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/';

function fetchJson(url: string, char: string): Promise<unknown> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`char data not found: ${char} (${res.status})`);
    return res.json();
  });
}

export const charDataLoader: CharDataLoaderFn = (char, onLoad, onError) => {
  const localUrl = `${import.meta.env.BASE_URL}hanzi-data/${encodeURIComponent(char)}.json`;

  fetchJson(localUrl, char)
    .catch(() => fetchJson(`${CDN_BASE}${encodeURIComponent(char)}.json`, char))
    .then((data) => onLoad(data as Parameters<typeof onLoad>[0]))
    .catch((err: unknown) => onError(err));
};
