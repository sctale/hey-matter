import type { EntityOption } from "@hey-matter/common";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { SxProps, Theme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { WidgetProps } from "@rjsf/utils";
import { useMemo } from "react";

/** formContext 上下文：实体候选列表 + 加载状态 + 当前表单数据（用于反查 sibling type） */
interface MatcherFormContext {
  entities?: EntityOption[];
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  ready?: boolean;
  reason?: string;
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
 *
 * 四态渲染：
 *  - isLoading：显示 CircularProgress + "加载中..."，Autocomplete loading=true
 *  - error：显示红色错误文本 + "重试"按钮，Autocomplete 禁用
 *  - ready 且无候选实体：显示灰色提示（不阻止 freeSolo 输入）
 *  - 有候选实体：正常渲染 Autocomplete
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
  const isLoading = ctx?.isLoading ?? false;
  const error = ctx?.error ?? null;
  const retry = ctx?.retry;
  const ready = ctx?.ready ?? false;
  const reason = ctx?.reason;
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

  // 错误态下禁用 Autocomplete
  const isDisabled = !!error || disabled || readonly;
  // ready 且无候选实体（用于显示提示，不阻止 freeSolo 输入）
  const isEmptyReady = ready && entities.length === 0;

  return (
    <Stack spacing={0.5} sx={{ width: "100%" }}>
      <Autocomplete
        freeSolo
        size="small"
        fullWidth
        options={error ? [] : options}
        value={value ?? ""}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        loading={isLoading}
        disabled={isDisabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            disabled={isDisabled}
            size="small"
            sx={textFieldSx}
          />
        )}
      />

      {/* 加载中：CircularProgress + "加载中..." 文本 */}
      {isLoading && !error && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={14} />
          <Typography variant="body2" color="text.secondary">
            加载中...
          </Typography>
        </Stack>
      )}

      {/* 错误态：红色错误文本 + "重试"按钮 */}
      {error && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="error">
            {error.message}
          </Typography>
          <Button size="small" onClick={() => retry?.()}>
            重试
          </Button>
        </Stack>
      )}

      {/* ready 且无候选实体：灰色提示（freeSolo 仍可手动输入）；有 reason 时优先展示 reason */}
      {!isLoading && !error && isEmptyReady && (
        <Typography variant="body2" color="text.secondary">
          {reason ?? "未找到实体，请检查 Home Assistant 实体配置"}
        </Typography>
      )}
    </Stack>
  );
};
