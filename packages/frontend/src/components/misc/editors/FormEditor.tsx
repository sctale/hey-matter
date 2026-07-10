import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { TranslatableString } from "@rjsf/utils";
import type {
  CustomValidator,
  FormValidation,
  RJSFValidationError,
  UiSchema,
  WidgetProps,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import type { JSONSchema7 } from "json-schema";
import { type ComponentType, useCallback, useMemo } from "react";
import type { ValidationError } from "./validation-error.ts";

const Form = withTheme(Theme);

/**
 * 深度规整 formData：根据 schema 把声明为 array 的字段的 null/undefined 值替换为 []，
 * 把声明为 object 的字段的 null 值替换为 {}（或 schema.default）。
 *
 * 背景：RJSF 6.x 的 mergeDefaultsWithFormData 对 null 的处理有缺陷——
 *   null && typeof null === 'object'  =>  false
 * 导致 null 值绕过默认值合并，被原样保留，最终在 ArrayField 中触发
 *   null.map(...)  =>  TypeError: t.map is not a function
 *
 * 在传入 RJSF Form 之前调用此函数，可彻底规避该崩溃链。
 */
function sanitizeFormData(
  formData: unknown,
  schema: JSONSchema7 | undefined,
): unknown {
  // formData 本身为 null/undefined：用 schema.default 兜底，否则按类型给空值
  if (formData == null) {
    if (schema?.default !== undefined) return schema.default;
    if (schema?.type === "array") return [];
    if (schema?.type === "object") return {};
    return formData;
  }
  // 基本类型直接返回
  if (typeof formData !== "object") return formData;
  // 数组：逐项递归规整（如有 items schema）
  if (Array.isArray(formData)) {
    const itemSchema =
      schema?.items && !Array.isArray(schema.items) && typeof schema.items === "object"
        ? (schema.items as JSONSchema7)
        : undefined;
    return itemSchema
      ? formData.map((item) => sanitizeFormData(item, itemSchema))
      : formData;
  }
  // 对象：遍历 schema.properties，逐字段规整
  const result: Record<string, unknown> = { ...(formData as Record<string, unknown>) };
  const props = schema?.properties;
  if (props && typeof props === "object") {
    for (const [key, subSchemaRaw] of Object.entries(props)) {
      if (!subSchemaRaw || typeof subSchemaRaw !== "object") continue;
      const subSchema = subSchemaRaw as JSONSchema7;
      const childValue = result[key];
      // schema 声明为 array 但值为 null/undefined → 填充 default 或 []
      if (subSchema.type === "array" && childValue == null) {
        result[key] = subSchema.default ?? [];
      }
      // schema 声明为 object 且值非 null → 递归规整
      else if (subSchema.type === "object" && childValue != null) {
        result[key] = sanitizeFormData(childValue, subSchema);
      }
      // schema 声明为 object 但值为 null → 填充 default 或 {}
      else if (subSchema.type === "object" && childValue == null) {
        result[key] = subSchema.default ?? {};
      }
    }
  }
  return result;
}

// RJSF 按钮文本中文化映射
const zhTranslations: Partial<Record<TranslatableString, string>> = {
  [TranslatableString.AddItemButton]: "添加",
  [TranslatableString.RemoveButton]: "删除",
  [TranslatableString.CopyButton]: "复制",
  [TranslatableString.MoveUpButton]: "上移",
  [TranslatableString.MoveDownButton]: "下移",
  [TranslatableString.AddButton]: "添加",
  [TranslatableString.ArrayItemTitle]: "项",
  [TranslatableString.EmptyArray]: "暂无项目，点击下方按钮添加。",
  [TranslatableString.MissingItems]: "缺少项目定义",
  [TranslatableString.YesLabel]: "是",
  [TranslatableString.NoLabel]: "否",
  [TranslatableString.CloseLabel]: "关闭",
  [TranslatableString.ErrorsLabel]: "错误",
  [TranslatableString.NewStringDefault]: "新值",
  [TranslatableString.ClearLabel]: "清除",
  [TranslatableString.PreviewLabel]: "预览",
  [TranslatableString.NowLabel]: "现在",
  [TranslatableString.AriaDateLabel]: "选择日期",
  [TranslatableString.OptionalObjectAdd]: "为可选字段添加数据",
  [TranslatableString.OptionalObjectRemove]: "移除可选字段数据",
  [TranslatableString.OptionalObjectEmptyMsg]: "可选字段无数据",
  [TranslatableString.Type]: "类型",
  [TranslatableString.Value]: "值",
};

const translateString = (
  str: TranslatableString,
  params?: readonly string[],
): string => {
  return zhTranslations[str] ?? params?.join(" ") ?? String(str);
};

export interface FormEditorProps {
  schema: JSONSchema7;
  uiSchema?: UiSchema;
  value: object;
  onChange: (value: object, isValid: boolean) => void;
  customValidate?: (value: object | undefined) => ValidationError[];
  /** 自定义 widget 注册表，键为 ui:widget 名称 */
  widgets?: Record<string, ComponentType<WidgetProps>>;
  /** 传递给 rjsf Form 的上下文，widget 可通过 props.formContext 读取 */
  formContext?: Record<string, unknown>;
}

export const FormEditor = (props: FormEditorProps) => {
  const onChange = (data: object, errors: RJSFValidationError[]) => {
    props.onChange(data, errors.length === 0);
  };

  const customValidate = props.customValidate;
  const customValidator: CustomValidator = useCallback(
    (formData, errors) => {
      const validationErrors = customValidate?.(formData) ?? [];
      validationErrors.forEach((error) => {
        if (!error.message) {
          return;
        }
        const path = error.instancePath.split("/");
        let nestedError: FormValidation = errors;
        for (const part of path) {
          if (part === "") continue;
          nestedError = nestedError[part] ?? nestedError;
        }
        nestedError.addError(error.message!);
      });
      return errors;
    },
    [customValidate],
  );

  // 在传入 RJSF 之前深度规整 formData，确保数组字段不为 null，规避 t.map 崩溃
  const sanitizedValue = useMemo(
    () => sanitizeFormData(props.value, props.schema) as object,
    [props.value, props.schema],
  );

  return (
    <Form
      schema={props.schema}
      uiSchema={props.uiSchema}
      validator={validator}
      formData={sanitizedValue}
      liveValidate="onChange"
      customValidate={customValidator}
      showErrorList={false}
      widgets={props.widgets}
      formContext={props.formContext}
      translateString={translateString}
      onChange={(data) => onChange(data.formData, data.errors)}
    />
  );
};
