import { type BridgeConfig, bridgeConfigSchema } from "@hey-matter/common";
import { LibraryBooks, TextFields } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { useCallback, useMemo, useState } from "react";
import { useEntities } from "../../hooks/data/entities.ts";
import { navigation } from "../../routes.tsx";
import { FormEditor } from "../misc/editors/FormEditor";
import { JsonEditor } from "../misc/editors/JsonEditor";
import { MatcherValueWidget } from "../misc/editors/MatcherValueWidget.tsx";
import type { ValidationError } from "../misc/editors/validation-error.ts";

enum BridgeEditorMode {
  JSON_EDITOR = "JSON_EDITOR",
  FIELDS_EDITOR = "FIELDS_EDITOR",
}

export interface BridgeConfigEditorProps {
  bridgeId?: string;
  bridge: BridgeConfig;
  usedPorts: Record<number, string>;
  onSave: (config: BridgeConfig) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export const BridgeConfigEditor = (props: BridgeConfigEditorProps) => {
  const [editorMode, setEditorMode] = useState<BridgeEditorMode>(
    BridgeEditorMode.FIELDS_EDITOR,
  );
  const toggleEditor = () => {
    setEditorMode(
      editorMode === BridgeEditorMode.FIELDS_EDITOR
        ? BridgeEditorMode.JSON_EDITOR
        : BridgeEditorMode.FIELDS_EDITOR,
    );
  };

  const [config, setConfig] = useState<object | undefined>(props.bridge);
  const [isValid, setIsValid] = useState<boolean>(true);

  // 实体候选数据（用于 filter matcher value 自动补全）
  const { data: entities } = useEntities();

  // 指定 filter include/exclude 数组中每一项的 value 字段使用自定义 widget
  const uiSchema = useMemo(
    () => ({
      filter: {
        include: {
          items: {
            value: { "ui:widget": "matcherValue" },
          },
        },
        exclude: {
          items: {
            value: { "ui:widget": "matcherValue" },
          },
        },
      },
    }),
    [],
  );

  // 注册自定义 widget
  const widgets = useMemo(() => ({ matcherValue: MatcherValueWidget }), []);

  // 传给 widget 的上下文：实体列表 + 当前 formData（widget 据此反查 sibling type）
  const formContext = useMemo(
    () => ({ entities, formData: config }),
    [entities, config],
  );

  const validatePort = useCallback(
    (value: object | undefined): ValidationError[] => {
      const config = value as Partial<BridgeConfig> | undefined;
      if (!config?.port) {
        return [];
      }
      const usedBy = props.usedPorts[config.port];
      if (usedBy !== undefined && usedBy !== props.bridgeId) {
        return [
          {
            instancePath: "/port",
            message: `端口已被 ID 为 ${usedBy} 的 Bridge 占用`,
          },
        ];
      }
      return [];
    },
    [props.bridgeId, props.usedPorts],
  );

  const onChange = (data: object | undefined, isValid: boolean) => {
    setConfig(data);
    setIsValid(isValid);
  };

  const saveAction = async () => {
    if (!isValid) {
      return;
    }
    await props.onSave(config as BridgeConfig);
  };

  return (
    <>
      <Alert severity="warning" variant="outlined">
        请查阅{" "}
        <Link href={navigation.faq.bridgeConfig} target="_blank">
          文档
        </Link>{" "}
        以了解正确的 Bridge 配置方式。{" "}
        <strong>特别是使用标签（labels）时，请务必阅读"Labels"章节。</strong>
      </Alert>

      <Stack spacing={2}>
        <Box display="flex" justifyContent={"flex-end"}>
          <Button
            onClick={() => toggleEditor()}
            title={
              editorMode === BridgeEditorMode.FIELDS_EDITOR
                ? "JSON 编辑器"
                : "表单编辑器"
            }
          >
            {editorMode === BridgeEditorMode.FIELDS_EDITOR ? (
              <TextFields />
            ) : (
              <LibraryBooks />
            )}
          </Button>
        </Box>

        {editorMode === BridgeEditorMode.FIELDS_EDITOR && (
          <FormEditor
            value={config ?? {}}
            onChange={onChange}
            schema={bridgeConfigSchema}
            customValidate={validatePort}
            uiSchema={uiSchema}
            widgets={widgets}
            formContext={formContext}
          />
        )}

        {editorMode === BridgeEditorMode.JSON_EDITOR && (
          <JsonEditor
            value={config ?? {}}
            onChange={onChange}
            schema={bridgeConfigSchema}
            customValidate={validatePort}
          />
        )}

        <Grid container>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={props.onCancel}
            >
              取消
            </Button>
          </Grid>
          <Grid
            size={{ xs: 0, sm: 4, md: 6 }}
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              disabled={!isValid}
              onClick={saveAction}
            >
              保存
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
