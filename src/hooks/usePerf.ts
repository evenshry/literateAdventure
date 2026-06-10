/**
 * 性能优化工具函数
 */

import { type DependencyList, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * 防抖 Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流 Hook
 * @param fn 需要节流的函数
 * @param delay 间隔时间（毫秒）
 * @param deps 依赖项
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
  deps: DependencyList
): T {
  const lastRun = useRef(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return fn(...args);
      }
    }) as T,
    [delay, ...deps]
  );
}

/**
 * 上一帧的值
 * @param value 当前值
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * 计算属性（带依赖的 useMemo 简化版）
 */
export function useComputed<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

/**
 * 仅在更新时执行的 useEffect
 * @param effect 副作用函数
 * @param deps 依赖项
 */
export function useUpdateEffect(effect: () => void | (() => void), deps: DependencyList): void {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// 需要引入 useState
import { useState } from 'react';
