import type { BridgeConfig } from "@home-assistant-matter-hub/common";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { BridgeStatusHint } from "../../components/bridge/BridgeStatusHint.tsx";
import { BridgeStatusIcon } from "../../components/bridge/BridgeStatusIcon.tsx";
import { EndpointList } from "../../components/endpoints/EndpointList.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { useBridge, useUpdateBridge, useUsedPorts } from "../../hooks/data/bridges.ts";
import { useDevices } from "../../hooks/data/devices.ts";
import { useTimer } from "../../hooks/timer.ts";
import { navigation } from "../../routes.tsx";
import { loadDevices } from "../../state/devices/device-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";
import { BridgeMoreMenu } from "./BridgeMoreMenu.tsx";

const MemoizedBridgeDetails = memo(BridgeDetails);
const MemoizedEndpointList = memo(EndpointList);

export const BridgeDetailsPage = () => {
  const notifications = useNotifications();
  const dispatch = useAppDispatch();

  const { bridgeId } = useParams() as { bridgeId: string };

  const timerCallback = useCallback(() => {
    dispatch(loadDevices(bridgeId));
  }, [dispatch, bridgeId]);
  const { remaining: timer, refreshNow: refreshDevices } = useTimer(
    10,
    timerCallback,
  );

  const {
    content: bridge,
    isLoading: bridgeLoading,
    error: bridgeError,
  } = useBridge(bridgeId);
  const { content: devices, error: devicesError } = useDevices(bridgeId);

  // Drawer 编辑器相关状态与逻辑（复用 EditBridgePage 的配置构造与更新流程）
  const usedPorts = useUsedPorts();
  const updateBridge = useUpdateBridge();
  const [editOpen, setEditOpen] = useState(false);

  const bridgeConfig = useMemo<BridgeConfig | undefined>(() => {
    if (!bridge) {
      return undefined;
    }
    return {
      name: bridge.name,
      port: bridge.port,
      countryCode: bridge.countryCode,
      filter: bridge.filter,
      featureFlags: bridge.featureFlags,
    };
  }, [bridge]);

  const handleSave = useCallback(
    async (config: BridgeConfig) => {
      await updateBridge({ ...config, id: bridgeId })
        .then(() =>
          notifications.show({
            message: "Update completed",
            severity: "success",
          }),
        )
        .then(() => setEditOpen(false))
        .catch((err: Error) =>
          notifications.show({ message: err.message, severity: "error" }),
        );
    },
    [updateBridge, bridgeId, notifications],
  );

  useEffect(() => {
    if (bridgeError) {
      notifications.show({
        message: bridgeError.message ?? "Failed to load Bridge details",
        severity: "error",
      });
    }
  }, [bridgeError, notifications]);

  useEffect(() => {
    if (devicesError?.message) {
      notifications.show({ message: devicesError.message, severity: "error" });
    }
  }, [devicesError, notifications]);

  if (!bridge && bridgeLoading) {
    return "Loading";
  }

  if (!bridge) {
    return "Not found";
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs
        items={[
          { name: "Bridges", to: navigation.bridges },
          { name: bridge.name, to: navigation.bridge(bridgeId) },
        ]}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">
          {bridge.name} <BridgeStatusIcon status={bridge.status} />
        </Typography>
        <Box display="flex" alignItems="center">
          {/* 显式 Edit 按钮，打开 Drawer 编辑器，避免跳转离开详情页 */}
          <Tooltip title="Edit bridge configuration">
            <IconButton onClick={() => setEditOpen(true)} aria-label="Edit">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <BridgeMoreMenu bridge={bridgeId} onEdit={() => setEditOpen(true)} />
        </Box>
      </Box>

      <BridgeStatusHint status={bridge.status} reason={bridge.statusReason} />

      <MemoizedBridgeDetails bridge={bridge} />

      {devices && (
        <Stack spacing={2}>
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              {timer != null && (
                <Tooltip title="New devices and changes on labels are discovered every 10 seconds.">
                  <Typography variant="body2" color="textSecondary">
                    Refreshing states in {timer - 1} seconds...
                  </Typography>
                </Tooltip>
              )}
              {/* 手动刷新按钮，立即触发并重置倒计时 */}
              <Tooltip title="Refresh now">
                <IconButton
                  onClick={refreshDevices}
                  aria-label="Refresh devices"
                  size="small"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <MemoizedEndpointList endpoint={devices} />
        </Stack>
      )}

      {/* Drawer 侧边抽屉：内嵌配置编辑器，保持详情上下文可见 */}
      <Drawer
        anchor="right"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 480, md: 560 },
            p: 2,
            overflowY: "auto",
          },
        }}
      >
        {bridgeConfig && usedPorts ? (
          <BridgeConfigEditor
            bridgeId={bridgeId}
            bridge={bridgeConfig}
            usedPorts={usedPorts}
            onSave={handleSave}
            onCancel={() => setEditOpen(false)}
          />
        ) : (
          <Typography>Loading</Typography>
        )}
      </Drawer>
    </Stack>
  );
};
