import { createHash } from "node:crypto";
import type { Logger } from "@matter/general";
import type {
  HomeAssistantDeviceRegistry,
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@hey-matter/common";
import { getStates } from "home-assistant-js-websocket";
import { fromPairs, keyBy, keys, uniq, values } from "lodash-es";
import type { LoggerService } from "../../core/app/logger.js";
import { Service } from "../../core/ioc/service.js";
import { getDeviceRegistry, getRegistry } from "./api/get-registry.js";
import type {
  HomeAssistantClient,
  HomeAssistantClientProps,
} from "./home-assistant-client.js";

export type HomeAssistantDevices = Record<string, HomeAssistantDeviceRegistry>;
export type HomeAssistantEntities = Record<string, HomeAssistantEntityRegistry>;
export type HomeAssistantStates = Record<string, HomeAssistantEntityState>;

export class HomeAssistantRegistry extends Service {
  private autoRefresh?: NodeJS.Timeout;
  private readonly log: Logger;

  private _devices: HomeAssistantDevices = {};
  get devices() {
    return this._devices;
  }

  private _entities: HomeAssistantEntities = {};
  get entities() {
    return this._entities;
  }

  private _states: HomeAssistantStates = {};
  get states() {
    return this._states;
  }

  constructor(
    logger: LoggerService,
    private readonly client: HomeAssistantClient,
    private readonly options: HomeAssistantClientProps,
  ) {
    super("HomeAssistantRegistry");
    this.log = logger.get(this);
  }

  protected override async initialize(): Promise<void> {
    await this.reload();
  }

  override async dispose(): Promise<void> {
    this.disableAutoRefresh();
  }

  enableAutoRefresh(onRefresh: () => void) {
    this.disableAutoRefresh();

    this.autoRefresh = setInterval(async () => {
      try {
        await this.reload();
      } catch (err) {
        // 自动刷新失败只记录日志，不抛出，避免中断后续刷新周期
        this.log.error("自动刷新 Home Assistant 注册表失败", err);
        return;
      }
      onRefresh();
    }, this.options.refreshInterval * 1000);
  }

  disableAutoRefresh() {
    if (this.autoRefresh != null) {
      clearInterval(this.autoRefresh);
    }
    this.autoRefresh = undefined;
  }

  private async reload() {
    const connection = this.client.connection;
    const entityRegistry = await getRegistry(connection);
    entityRegistry.forEach((e) => {
      e.device_id = e.device_id ?? mockDeviceId(e.entity_id);
    });
    const entities = keyBy(entityRegistry, "entity_id");
    const states: HomeAssistantStates = keyBy(
      await getStates(connection),
      "entity_id",
    );

    const entityIds = uniq(keys(entities).concat(keys(states)));
    const allEntities = keyBy(
      entityIds.map((id) => entities[id] ?? { entity_id: id, device_id: id }),
      "entity_id",
    );
    const deviceIds = values(allEntities).map(
      (e) => e.device_id ?? e.entity_id,
    );

    const realDevices = keyBy(await getDeviceRegistry(connection), "id");
    const missingDeviceIds = uniq(deviceIds.filter((d) => !realDevices[d]));
    const missingDevices: Record<string, HomeAssistantDeviceRegistry> =
      fromPairs(missingDeviceIds.map((d) => [d, { id: d }]));

    this._devices = { ...missingDevices, ...realDevices };
    this._entities = entities;
    this._states = states;
  }
}

function mockDeviceId(entityId: string) {
  const hash = createHash("sha256")
    .update(entityId)
    .digest("hex")
    .substring(0, 29);
  return `e__${hash}`;
}
