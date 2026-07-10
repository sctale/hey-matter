import {
  type CreateBridgeRequest,
  createBridgeRequestSchema,
  type EntityOption,
  type UpdateBridgeRequest,
  updateBridgeRequestSchema,
} from "@hey-matter/common";
import { Ajv } from "ajv";
import express from "express";
import type { BridgeService } from "../services/bridges/bridge-service.js";
import type { HomeAssistantRegistry } from "../services/home-assistant/home-assistant-registry.js";
import { endpointToJson } from "../utils/json/endpoint-to-json.js";

const ajv = new Ajv();

export function matterApi(
  bridgeService: BridgeService,
  registry: HomeAssistantRegistry,
): express.Router {
  const router = express.Router();
  router.get("/", (_, res) => {
    res.status(200).json({});
  });

  // 暴露 HA 全量实体列表（含 friendly_name），供前端 filter 配置自动补全使用
  // 当 registry 尚未加载到实体时，返回 ready:false 以便前端展示"正在连接 HA"的占位提示
  router.get("/entities", (_, res) => {
    const entities: EntityOption[] = Object.values(registry.entities).map(
      (e) => ({
        entity_id: e.entity_id,
        friendly_name: registry.states[e.entity_id]?.attributes?.friendly_name,
        domain: e.entity_id.split(".")[0],
        platform: e.platform,
        entity_category: e.entity_category as string | undefined,
        labels: e.labels ?? [],
        area_id: e.area_id,
        disabled_by: e.disabled_by as string | undefined,
        hidden_by: e.hidden_by as string | undefined,
      }),
    );
    // registry 没有 isLoaded/isReady 等就绪标志字段，用实体数量是否为 0 判断是否就绪
    if (Object.keys(registry.entities).length === 0) {
      res.status(200).json({
        ready: false,
        reason: "正在连接 Home Assistant，请稍候...",
        entities: [],
      });
    } else {
      res.status(200).json({ ready: true, entities });
    }
  });

  router.get("/bridges", async (_, res) => {
    res.status(200).json(bridgeService.bridges.map((b) => b.data));
  });

  router.post("/bridges", async (req, res) => {
    const body = req.body as CreateBridgeRequest;
    const isValid = ajv.validate(createBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else {
      const bridge = await bridgeService.create(body);
      res.status(200).json(bridge.data);
    }
  });

  router.get("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.get(bridgeId);
    if (bridge) {
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.put("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const body = req.body as UpdateBridgeRequest;
    const isValid = ajv.validate(updateBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else if (bridgeId !== body.id) {
      res.status(400).send("Path variable `bridgeId` does not match `body.id`");
    } else {
      const bridge = await bridgeService.update(body);
      if (!bridge) {
        res.status(404).send("Not Found");
      } else {
        res.status(200).json(bridge.data);
      }
    }
  });

  router.delete("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    await bridgeService.delete(bridgeId);
    res.status(204).send();
  });

  router.get("/bridges/:bridgeId/actions/factory-reset", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      await bridge.factoryReset();
      await bridge.start();
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.get("/bridges/:bridgeId/devices", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      res.status(200).json(endpointToJson(bridge.server));
    } else {
      res.status(404).send("Not Found");
    }
  });

  return router;
}
