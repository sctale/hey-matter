import type { JSONSchema7 } from "json-schema";
import { HomeAssistantMatcherType } from "../home-assistant-filter.js";

const homeAssistantMatcherSchema: JSONSchema7 = {
  type: "object",
  default: { type: "", value: "" },
  properties: {
    type: {
      title: "类型",
      type: "string",
      enum: Object.values(HomeAssistantMatcherType),
    },
    value: {
      title: "值",
      type: "string",
      minLength: 1,
    },
  },
  required: ["type", "value"],
  additionalProperties: false,
};

const homeAssistantFilterSchema: JSONSchema7 = {
  title: "包含或排除实体",
  type: "object",
  properties: {
    include: {
      title: "包含",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
    exclude: {
      title: "排除",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
  },
  required: ["include", "exclude"],
  additionalProperties: false,
};

const featureFlagSchema: JSONSchema7 = {
  title: "功能开关",
  type: "object",
  properties: {
    coverDoNotInvertPercentage: {
      title: "不反转盖帘百分比",
      description:
        "不反转盖帘的百分比以匹配 Home Assistant（不符合 Matter 标准）",
      type: "boolean",
      default: false,
    },

    includeHiddenEntities: {
      title: "包含隐藏实体",
      description: "包含在 Home Assistant 中标记为隐藏的实体",
      type: "boolean",
      default: false,
    },
  },
  additionalProperties: false,
};

export const bridgeConfigSchema: JSONSchema7 = {
  type: "object",
  title: "Bridge 配置",
  properties: {
    name: {
      title: "名称",
      type: "string",
      minLength: 1,
      maxLength: 32,
    },
    port: {
      title: "端口",
      type: "number",
      minimum: 1,
    },
    countryCode: {
      title: "国家代码",
      type: "string",
      description:
        "ISO 3166-1 alpha-2 国家代码，表示设备所在国家。仅在配对因缺少国家代码而失败时需要填写。",
      minLength: 2,
      maxLength: 3,
    },
    filter: homeAssistantFilterSchema,
    featureFlags: featureFlagSchema,
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
