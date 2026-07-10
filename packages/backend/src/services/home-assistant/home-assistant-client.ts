import type { Logger } from "@matter/general";
import {
  type Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
  getConfig,
} from "home-assistant-js-websocket";
import type { LoggerService } from "../../core/app/logger.js";
import { Service } from "../../core/ioc/service.js";

export interface HomeAssistantClientProps {
  readonly url: string;
  readonly accessToken: string;
  readonly refreshInterval: number;
}

export class HomeAssistantClient extends Service {
  static Options = Symbol.for("HomeAssistantClientProps");

  private _connection!: Connection;
  private readonly log: Logger;

  get connection(): Connection {
    return this._connection;
  }

  constructor(
    logger: LoggerService,
    private readonly options: HomeAssistantClientProps,
  ) {
    super("HomeAssistantClient");
    this.log = logger.get(this);
  }

  protected override async initialize() {
    this._connection = await this.createConnection(this.options);
  }

  override async dispose() {
    this.connection?.close();
  }

  private async createConnection(
    props: HomeAssistantClientProps,
    attempt = 0,
  ): Promise<Connection> {
    try {
      const connection = await createConnection({
        auth: createLongLivedTokenAuth(
          props.url.replace(/\/$/, ""),
          props.accessToken,
        ),
      });
      await this.waitForHomeAssistantToBeUpAndRunning(connection);
      return connection;
    } catch (reason: unknown) {
      return this.handleInitializationError(reason, props, attempt);
    }
  }

  private async handleInitializationError(
    reason: unknown,
    props: HomeAssistantClientProps,
    attempt: number,
  ): Promise<Connection> {
    if (reason === ERR_CANNOT_CONNECT) {
      if (attempt >= 12) {
        throw new Error(
          "连接 Home Assistant 失败，已达到最大重试次数。请检查 HA 地址和网络。",
        );
      }
      // 指数退避：初始 5 秒，最大 60 秒
      const delay = Math.min(5000 * Math.pow(2, attempt), 60000);
      this.log.error(
        `无法连接到 Home Assistant（${props.url}），将在 ${delay / 1000} 秒后第 ${attempt + 1} 次重试...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.createConnection(props, attempt + 1);
    }
    if (reason === ERR_INVALID_AUTH) {
      throw new Error(
        "Authentication failed while connecting to home assistant",
      );
    }
    throw new Error(`Unable to connect to home assistant: ${reason}`);
  }

  private async waitForHomeAssistantToBeUpAndRunning(
    connection: Connection,
  ): Promise<void> {
    this.log.info(
      "Waiting for Home Assistant to be up and running - the application will be available once a connection to Home Assistant could be established.",
    );

    const getState = async () => {
      const s = await getConfig(connection).then((config) => config.state);
      this.log.debug(
        `Got an update from Home Assistant. System state is '${s}'.`,
      );
      return s;
    };
    let state: string | undefined;
    while (state !== "RUNNING") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      state = await getState();
    }
    this.log.info("Home assistant reported to be up and running");
  }
}
