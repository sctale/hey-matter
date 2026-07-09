import type { EntityOption } from "@hey-matter/common";
import { useEffect, useState } from "react";
import { fetchEntities } from "../../api/entities.ts";

interface UseEntitiesState {
  data: EntityOption[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * 获取 HA 全量实体列表（只读候选数据），供 filter 配置自动补全使用。
 * 轻量实现：useEffect + useState，不入 Redux store。
 */
export function useEntities(): UseEntitiesState {
  const [data, setData] = useState<EntityOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchEntities()
      .then((entities) => {
        if (!cancelled) {
          setData(entities);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
