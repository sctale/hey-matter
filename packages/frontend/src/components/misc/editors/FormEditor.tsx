import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import type {
  CustomValidator,
  FormValidation,
  RJSFValidationError,
  TranslatableString,
  UiSchema,
  WidgetProps,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import type { JSONSchema7 } from "json-schema";
import { type ComponentType, useCallback } from "react";
import type { ValidationError } from "./validation-error.ts";

const Form = withTheme(Theme);

// RJSF 按钮文本中文化映射
const zhTranslations: Partial<Record<TranslatableString, string>> = {
  [TranslatableString.AddItemButton]: "添加",
  [TranslatableString.RemoveButton]: "删除",
  [TranslatableString.CopyButton]: "复制",
  [TranslatableString.MoveUpButton]: "上移",
  [TranslatableString.MoveDownButton]: "下移",
  [TranslatableString.ClearButton]: "清除",
  [TranslatableString.KeyLabel]: "键",
  [TranslatableString.AddButton]: "添加",
  [TranslatableString.AddPropertyButton]: "添加属性",
  [TranslatableString.UnsupportedField]: "不支持的字段类型",
  [TranslatableString.ErrorsYamlResults]: "校验失败：",
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

  return (
    <Form
      schema={props.schema}
      uiSchema={props.uiSchema}
      validator={validator}
      formData={props.value}
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
