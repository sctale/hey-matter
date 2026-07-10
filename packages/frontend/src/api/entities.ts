import type { EntityOption } from "@hey-matter/common";

/** fetchEntities 返回值：兼容后端新响应格式 { ready, reason?, entities } */
export interface FetchEntitiesResult {
  entities: EntityOption[];
  ready: boolean;
  reason?: string;
}

/** 后端 /api/matter/entities 响应体结构 */
interface EntitiesResponse {
  ready: boolean;
  reason?: string;
  entities: EntityOption[];
}

/**
 * 获取 HA 全量实体列表（含 friendly_name），供 filter 配置自动补全使用。
 * 使用 AbortController 设置 15 秒超时，超时抛出 Error("请求超时，请重试")。
 * 兼容后端新响应格式 { ready, reason?, entities }，返回结构化对象而非裸数组。
 */
export async function fetchEntities(): Promise<FetchEntitiesResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`api/matter/entities?_s=${Date.now()}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`加载实体失败：${res.statusText}`);
    }
    const json = (await res.json()) as EntitiesResponse;
    return {
      entities: json.entities ?? [],
      ready: json.ready,
      reason: json.reason,
    };
  } catch (err) {
    // 超时（AbortController 触发）转换为友好提示
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("请求超时，请重试");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
