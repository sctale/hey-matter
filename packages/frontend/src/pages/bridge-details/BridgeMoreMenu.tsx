import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVert from "@mui/icons-material/MoreVert";
import ResetIcon from "@mui/icons-material/RotateLeft";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { useNavigate } from "react-router";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { useDeleteBridge, useResetBridge } from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";

export interface BridgeMoreMenuProps {
  bridge: string;
  /** 若提供则"Edit"项调用此回调（用于父组件打开 Drawer），否则保持原路由跳转行为 */
  onEdit?: () => void;
}

export const BridgeMoreMenu = ({ bridge, onEdit }: BridgeMoreMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const notification = useNotifications();

  const factoryReset = useResetBridge();
  const deleteBridge = useDeleteBridge();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleClose();
    if (onEdit) {
      onEdit();
    } else {
      navigate(navigation.editBridge(bridge));
    }
  };

  const handleFactoryReset = async () => {
    handleClose();
    await factoryReset(bridge)
      .then(() =>
        notification.show({
          message: "Bridge Reset successfully",
          severity: "success",
        }),
      )
      .catch((reason) =>
        notification.show({
          message: `Failed to reset bridge: ${reason.toString()}`,
          severity: "error",
        }),
      );
  };
  const handleDelete = async () => {
    handleClose();
    await deleteBridge(bridge)
      .then(() =>
        notification.show({
          message: "Bridge deleted successfully",
          severity: "success",
        }),
      )
      .then(() => navigate(navigation.bridges))
      .catch((reason) =>
        notification.show({
          message: `Failed to delete bridge: ${reason.toString()}`,
          severity: "error",
        }),
      );
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreVert />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleFactoryReset}>
          <ListItemIcon>
            <ResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Factory Reset</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
