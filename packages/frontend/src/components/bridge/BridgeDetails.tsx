import {
  type BridgeDataWithMetadata,
  HomeAssistantMatcherType,
} from "@hey-matter/common";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";
import { useEntities } from "../../hooks/data/entities.ts";
import { navigation } from "../../routes.tsx";
import { FabricList } from "../fabric/FabricList.tsx";

export interface BridgeDetailsProps {
  readonly bridge: BridgeDataWithMetadata;
}

/**
 * 根据 matcher type 与 value 计算展示标签。
 * - pattern 类型且 value 是完整 entity_id（无 *）：反查 friendly_name 显示
 * - pattern 类型且 value 含通配 *：原样显示
 * - domain 类型：显示 "domain: xxx"
 * - 其他类型：显示 "type: value"
 */
function useFilterLabel(
  entityIdToName: Map<string, string>,
): (type: HomeAssistantMatcherType, value: string) => React.ReactNode {
  return (type, value) => {
    if (type === HomeAssistantMatcherType.Pattern) {
      if (value.includes("*")) {
        // 通配 pattern，无法反查，原样显示
        return (
          <span>
            <strong>{type}</strong>: {value}
          </span>
        );
      }
      // 完整 entity_id，反查 friendly_name
      const name = entityIdToName.get(value);
      return (
        <span>
          <strong>{type}</strong>: {name ?? value}
        </span>
      );
    }
    if (type === HomeAssistantMatcherType.Domain) {
      return (
        <span>
          <strong>domain</strong>: {value}
        </span>
      );
    }
    return (
      <span>
        <strong>{type}</strong>: {value}
      </span>
    );
  };
}

export const BridgeDetails = ({ bridge }: BridgeDetailsProps) => {
  const { data: entities } = useEntities();

  // entity_id → friendly_name 反查表
  const entityIdToName = useMemo(
    () =>
      new Map(
        entities.map((e) => [e.entity_id, e.friendly_name ?? e.entity_id]),
      ),
    [entities],
  );

  const getLabel = useFilterLabel(entityIdToName);

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2} divider={<Divider flexItem />}>
        {/* 基本信息与配对 */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Pairing bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <BasicInfo bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <CommissioningInfo bridge={bridge} />
          </Grid>
        </Grid>

        {/* 过滤器 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            过滤器
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {bridge.filter.include.map((filter, idx) => (
              <Chip
                key={`inc-${idx.toString()}`}
                size="small"
                icon={<AddIcon />}
                label={getLabel(filter.type, filter.value)}
                color="success"
              />
            ))}
            {bridge.filter.exclude.map((filter, idx) => (
              <Chip
                key={`exc-${idx.toString()}`}
                size="small"
                icon={<RemoveIcon />}
                label={getLabel(filter.type, filter.value)}
                color="error"
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const Pairing = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return "";
  }
  return (
    <Box display="flex" justifyContent="center">
      <Box position="relative" maxWidth="160px">
        {props.bridge.commissioning.isCommissioned && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{ transform: "translate(-50%, -50%) rotate(-45deg)" }}
          >
            <Alert color="success" variant="filled">
              <Typography
                variant="body2"
                component="a"
                sx={{
                  textDecoration: "underline",
                  textDecorationStyle: "dashed",
                  cursor: "help",
                  color: "inherit",
                }}
                href={navigation.faq.multiFabric}
                target="_blank"
              >
                已配对
              </Typography>
            </Alert>
          </Box>
        )}
        <Box
          style={{
            background: "white",
            padding: "9px",
            paddingBottom: "2.6px",
          }}
        >
          <QRCodeSVG
            value={props.bridge.commissioning.qrPairingCode}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const BasicInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  return (
    <Typography variant="subtitle2" component="div">
      <div>ID：{props.bridge.id}</div>
      <div>名称：{props.bridge.name}</div>
      <div>端口：{props.bridge.port}</div>
      <div>
        <div>Fabrics：</div>
        <div style={{ fontSize: "1.5em" }}>
          {props.bridge.commissioning?.fabrics && (
            <FabricList fabrics={props.bridge.commissioning.fabrics} />
          )}
        </div>
      </div>
    </Typography>
  );
};

const CommissioningInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return "";
  }
  return (
    <Typography variant="subtitle2" component="div">
      <div>配对码：{props.bridge.commissioning.passcode}</div>
      <div>鉴别码：{props.bridge.commissioning.discriminator}</div>
      <div>手动配对码：{props.bridge.commissioning.manualPairingCode}</div>
      <div>二维码配对码：{props.bridge.commissioning.qrPairingCode}</div>
    </Typography>
  );
};
