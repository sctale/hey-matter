import type { BridgeConfig } from "@hey-matter/common";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridge,
  useUpdateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";

export const EditBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { bridgeId } = useParams() as { bridgeId: string };
  const { content: bridge, isLoading } = useBridge(bridgeId);
  const usedPorts = useUsedPorts();
  const updateBridge = useUpdateBridge();

  const bridgeConfig = useMemo<BridgeConfig | undefined>(() => {
    if (isLoading || !bridge) {
      return undefined;
    }
    // 防御性处理：后端可能返回 null，规整为符合 schema 的默认值
    const filter = bridge.filter ?? { include: [], exclude: [] };
    const featureFlags = bridge.featureFlags ?? {};
    return {
      name: bridge.name,
      port: bridge.port,
      countryCode: bridge.countryCode,
      filter: {
        include: filter.include ?? [],
        exclude: filter.exclude ?? [],
      },
      featureFlags,
    };
  }, [isLoading, bridge]);

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await updateBridge({ ...config, id: bridgeId })
      .then(() =>
        notifications.show({
          message: "更新完成",
          severity: "success",
        }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (isLoading || !usedPorts) {
    return "加载中";
  }
  if (!bridge || !bridgeConfig) {
    return "未找到";
  }

  return (
    <Stack spacing={4}>
      {/* 返回按钮：回到上一页 */}
      <IconButton
        onClick={() => navigate(-1)}
        aria-label="返回"
        sx={{ alignSelf: "flex-start", p: 0 }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Breadcrumbs
        items={[
          { name: "Bridge 列表", to: navigation.bridges },
          { name: bridge.name, to: navigation.bridge(bridgeId) },
          { name: "编辑", to: navigation.editBridge(bridgeId) },
        ]}
      />

      <BridgeConfigEditor
        bridgeId={bridgeId}
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Stack>
  );
};
