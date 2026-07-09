/**
 * 实体候选项（用于前端 filter 配置时的自动补全）
 * 由后端 GET /api/matter/entities 返回，来自 HA 全量 registry
 */
export interface EntityOption {
  /** 实体 ID，如 "light.living_room" */
  entity_id: string;
  /** 友好名称，如 "客厅灯"（来自 HA attributes.friendly_name） */
  friendly_name?: string;
  /** 域，entity_id 第一段，如 "light" */
  domain: string;
  /** 平台，来自 entity registry */
  platform?: string;
  /** 实体类别，如 config/diagnostic */
  entity_category?: string;
  /** 标签列表 */
  labels: string[];
  /** 区域 ID */
  area_id?: string;
  /** 是否被禁用 */
  disabled_by?: string;
  /** 是否被隐藏 */
  hidden_by?: string;
}
