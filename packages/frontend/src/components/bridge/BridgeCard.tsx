import { type BridgeDataWithMetadata, BridgeStatus } from "@hey-matter/common";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import LanIcon from "@mui/icons-material/Lan";
import MemoryIcon from "@mui/icons-material/Memory";
import QrCode from "@mui/icons-material/QrCode";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { navigation } from "../../routes.tsx";
import { BridgeStatusIcon } from "./BridgeStatusIcon.tsx";

export interface BridgeCardProps {
  bridge: BridgeDataWithMetadata;
}

/** 状态 → 左侧色边颜色（复用 BridgeStatusIcon 的颜色语义） */
function statusToBorderColor(status: BridgeStatus) {
  switch (status) {
    case BridgeStatus.Starting:
      return "info.main";
    case BridgeStatus.Running:
      return "success.main";
    case BridgeStatus.Stopped:
      return "warning.main";
    case BridgeStatus.Failed:
      return "error.main";
  }
}

export const BridgeCard = ({ bridge }: BridgeCardProps) => {
  const borderColor = statusToBorderColor(bridge.status);
  const fabricCount = bridge.commissioning?.fabrics.length ?? 0;

  return (
    <Card
      variant="elevation"
      sx={{
        borderLeft: 4,
        borderLeftColor: borderColor,
        transition: "box-shadow 0.2s ease-in-out",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardActionArea component={RouterLink} to={navigation.bridge(bridge.id)}>
        <CardContent sx={{ display: "flex" }}>
          <Box display="flex" alignItems="center">
            <QrCode sx={{ height: "3em", width: "3em" }} />
          </Box>
          <Box
            pl={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            flexGrow={1}
          >
            <Typography>
              {bridge.name} <BridgeStatusIcon status={bridge.status} />
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Metric
                icon={<DeviceHubIcon fontSize="inherit" />}
                label="Fabrics"
                value={fabricCount}
              />
              <Metric
                icon={<MemoryIcon fontSize="inherit" />}
                label="Devices"
                value={bridge.deviceCount}
              />
              <Metric
                icon={<LanIcon fontSize="inherit" />}
                label="Port"
                value={bridge.port}
              />
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

/** 副信息项：图标 + 标签 + 值 */
const Metric = (props: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) => {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={(theme: Theme) => ({ color: theme.palette.text.secondary })}
    >
      {props.icon}
      <Typography variant="caption" component="span">
        {props.label}: {props.value}
      </Typography>
    </Stack>
  );
};
