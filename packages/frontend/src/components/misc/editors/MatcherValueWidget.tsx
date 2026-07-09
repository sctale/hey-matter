import type { EntityOption } from "@hey-matter/common";
import Autocomplete from "@mui/material/Autocomplete";
import type { SxProps, Theme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import type { WidgetProps } from "@rjsf/utils";
import { useMemo } from "react";

/** formContext 上下文：实体候选列表 + 当前表单数据（用于反查 sibling type） */
interface MatcherFormContext {
  entities?: EntityOption[];
  formData?: {
    filter?: {
      include?: Array<{ type?: string; value?: string }>;
      exclude?: Array<{ type?: string; value?: string }>;
    };
  };
}

/**
 * rjsf 自定义 widget：bridge filter 的 matcher value 字段。
 * 通过 formContext 反查 sibling type，按 type 动态提供候选：
 *  - domain / platform / label / area / entity_category：提供去重后的候选值列表
 *  - pattern（或未选 type）：提供全量实体，option 显示 friendly_name，选中填 entity_id
 * freeSolo 开启，允许手动输入通配 pattern（如 light.*）。
 */
export const MatcherValueWidget = (props: WidgetProps) => {
  const {
    value,
    onChange,
    id,
    formContext,
    required,
    disabled,
    readonly,
    label,
  } = props;

  const ctx = formContext as MatcherFormContext | undefined;
  const entities = ctx?.entities ?? [];
  const formData = ctx?.formData;

  // 解析 id（如 root_filter_include_0_value）反查 sibling type
  const match = id?.match(/filter_(include|exclude)_(\d+)_value$/);
  const arrayKey = match?.[1] as "include" | "exclude" | undefined;
  const index = match?.[2] ? Number(match[2]) : undefined;
  const matcherType =
    arrayKey && index !== undefined
      ? formData?.filter?.[arrayKey]?.[index]?.type
      : undefined;

  // 按 type 计算候选
  const options = useMemo(() => {
    if (!entities.length) return [] as unknown[];
    switch (matcherType) {
      case "domain":
        return [...new Set(entities.map((e) => e.domain))];
      case "platform":
        return [
          ...new Set(entities.map((e) => e.platform).filter(Boolean)),
        ] as string[];
      case "label":
        return [...new Set(entities.flatMap((e) => e.labels ?? []))];
      case "area":
        return [
          ...new Set(entities.map((e) => e.area_id).filter(Boolean)),
        ] as string[];
      case "entity_category":
        return [
          ...new Set(entities.map((e) => e.entity_category).filter(Boolean)),
        ] as string[];
      default:
        return entities; // 全量实体（pattern 或未选 type）
    }
  }, [entities, matcherType]);

  // pattern 或未选 type：选中填 entity_id；其他类型：选中填 value 本身
  const isPatternLike = !matcherType || matcherType === "pattern";

  const getOptionLabel = (option: unknown): string => {
    if (option == null) return "";
    if (typeof option === "string") return option;
    if (isPatternLike) {
      const e = option as EntityOption;
      return e.friendly_name
        ? `${e.friendly_name}（${e.entity_id}）`
        : e.entity_id;
    }
    return String(option);
  };

  const isOptionEqualToValue = (option: unknown, val: unknown): boolean => {
    if (val == null || val === "") return false;
    if (isPatternLike) {
      return (option as EntityOption).entity_id === val;
    }
    return String(option) === val;
  };

  const handleChange = (_: unknown, newValue: unknown) => {
    if (newValue == null) {
      onChange("");
      return;
    }
    if (typeof newValue === "string") {
      onChange(newValue);
      return;
    }
    if (isPatternLike) {
      onChange((newValue as EntityOption).entity_id);
    } else {
      onChange(String(newValue));
    }
  };

  const handleInputChange = (_: unknown, newInput: string, reason: string) => {
    // freeSolo 手动输入时同步到 rjsf
    if (reason === "input") onChange(newInput);
  };

  const textFieldSx: SxProps<Theme> = { width: "100%" };

  return (
    <Autocomplete
      freeSolo
      size="small"
      fullWidth
      options={options}
      value={value ?? ""}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      loading={entities.length === 0}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          disabled={disabled || readonly}
          size="small"
          sx={textFieldSx}
        />
      )}
    />
  );
};
