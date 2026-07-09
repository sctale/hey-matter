import type { BridgeData } from "@hey-matter/common";
import { Service } from "../../core/ioc/service.js";
import type { Bridge } from "./bridge.js";

export abstract class BridgeFactory extends Service {
  abstract create(initialData: BridgeData): Promise<Bridge>;
}
