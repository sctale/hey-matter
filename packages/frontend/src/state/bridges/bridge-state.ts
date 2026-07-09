import type { BridgeDataWithMetadata } from "@hey-matter/common";
import type { AsyncState } from "../utils/async.ts";

export interface BridgeState {
  items: AsyncState<BridgeDataWithMetadata[]>;
}
