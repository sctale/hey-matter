import type { BridgeConfig } from "@hey-matter/common";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridges,
  useCreateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";

const defaultConfig: Omit<BridgeConfig, "port"> = {
  name: "",
  featureFlags: {},
  filter: {
    include: [],
    exclude: [],
  },
};

function nextFreePort(usedPorts: Record<number, string>) {
  let port = 5540;
  while (usedPorts[port]) {
    port++;
  }
  return port;
}

export const CreateBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const showReuseBridgeHint = !!useBridges().content?.length;
  const usedPorts = useUsedPorts();
  const bridgeConfig: BridgeConfig | undefined = useMemo(() => {
    if (usedPorts) {
      return { ...defaultConfig, port: nextFreePort(usedPorts) };
    }
    return undefined;
  }, [usedPorts]);

  const createBridge = useCreateBridge();

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await createBridge({ ...config })
      .then(() =>
        notifications.show({ message: "Bridge 已保存", severity: "success" }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (!bridgeConfig || !usedPorts) {
    return "加载中";
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
          { name: "新建", to: navigation.createBridge },
        ]}
      />

      {showReuseBridgeHint && (
        <Alert severity="info" variant="outlined">
          <Typography>
            您知道吗？同一个 Bridge 可以连接到多个语音助手。{" "}
            <Link href={navigation.faq.multiFabric} target="_blank">
              了解更多。
            </Link>
          </Typography>
        </Alert>
      )}

      <BridgeConfigEditor
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Stack>
  );
};
