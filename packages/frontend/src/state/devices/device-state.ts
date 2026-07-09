import type { EndpointData } from "@hey-matter/common";
import type { AsyncState } from "../utils/async.ts";

export interface DeviceState {
  byBridge: { [bridge: string]: AsyncState<EndpointData> | undefined };
}
