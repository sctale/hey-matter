import { Add } from "@mui/icons-material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { Link } from "react-router";
import { BridgeList } from "../../components/bridge/BridgeList";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { useBridges } from "../../hooks/data/bridges";
import { useTimer } from "../../hooks/timer.ts";
import { navigation } from "../../routes.tsx";
import { loadBridges } from "../../state/bridges/bridge-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";

// 列表页自动刷新间隔（秒），避免过于频繁请求后端
const BRIDGE_LIST_REFRESH_INTERVAL_SECONDS = 30;

export const BridgesPage = () => {
  const notifications = useNotifications();
  const dispatch = useAppDispatch();

  const { content: bridges, isLoading, error: bridgeError } = useBridges();

  // 定期自动刷新 bridges 列表，保证新增/删除/状态变化及时反映
  useTimer(BRIDGE_LIST_REFRESH_INTERVAL_SECONDS, () => dispatch(loadBridges()));

  useEffect(() => {
    if (bridgeError) {
      notifications.show({
        message: bridgeError.message ?? "无法加载 Bridge 列表",
        severity: "error",
      });
    }
  }, [bridgeError, notifications]);

  return (
    <>
      <Backdrop
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        {isLoading && <CircularProgress color="inherit" />}
      </Backdrop>

      <Stack spacing={4}>
        {bridges && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              paddingTop={{ xs: 1, sm: 0 }}
            >
              <Typography variant="body2" color="textSecondary">
                每 {BRIDGE_LIST_REFRESH_INTERVAL_SECONDS} 秒自动刷新
              </Typography>
              <Button
                component={Link}
                to={navigation.createBridge}
                endIcon={<Add />}
                variant="outlined"
              >
                创建新 Bridge
              </Button>
            </Box>

            <BridgeList bridges={bridges} />
          </>
        )}
      </Stack>
    </>
  );
};
