import type { EntityOption } from "@hey-matter/common";

/** 获取 HA 全量实体列表（含 friendly_name），供 filter 配置自动补全使用 */
export async function fetchEntities(): Promise<EntityOption[]> {
  const res = await fetch(`api/matter/entities?_s=${Date.now()}`);
  if (!res.ok) {
    throw new Error(`加载实体失败：${res.statusText}`);
  }
  const json = await res.json();
  return json as EntityOption[];
}
