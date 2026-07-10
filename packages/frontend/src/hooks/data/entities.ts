import type { EntityOption } from "@hey-matter/common";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEntities } from "../../api/entities.ts";

interface UseEntitiesState {
  data: EntityOption[];
  isLoading: boolean;
  error: Error | null;
  ready: boolean;
  reason?: string;
  retry: () => void;
}

/**
 * 获取 HA 全量实体列表（只读候选数据），供 filter 配置自动补全使用。
 * 轻量实现：useEffect + useState，不入 Redux store。
 * 加载逻辑抽为可复用的 load 函数（useCallback），retry() 调用它重新加载。
 */
export function useEntities(): UseEntitiesState {
  const [data, setData] = useState<EntityOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [retryToken, setRetryToken] = useState(0);

  // 用自增 token 跟踪最新一次加载，避免旧请求覆盖新状态（卸载或 retry 后失效）
  const loadIdRef = useRef(0);

  // 可复用的加载逻辑，传入 AbortSignal 以支持取消
  const load = useCallback((signal: AbortSignal) => {
    const id = ++loadIdRef.current;
    setIsLoading(true);
    // retry 时清除 error 重新加载
    setError(null);
    fetchEntities(signal)
      .then((result) => {
        if (id !== loadIdRef.current) return;
        setData(result.entities);
        setReady(result.ready);
        setReason(result.reason);
        setError(null);
      })
      .catch((err) => {
        if (id !== loadIdRef.current) return;
        // 失败时保留 error 状态
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (id !== loadIdRef.current) return;
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => {
      // 卸载时取消在途请求并递增 token 使旧回调失效
      loadIdRef.current++;
      controller.abort();
    };
    // retryToken 变化时重新创建 AbortController 并加载
  }, [load, retryToken]);

  const retry = useCallback(() => {
    // 触发 useEffect 重新执行，从而创建新的 AbortController
    setRetryToken((token) => token + 1);
  }, []);

  return { data, isLoading, error, ready, reason, retry };
}
