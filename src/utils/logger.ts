import bunyan from "bunyan";
import defaults from "lodash/defaults";

export class Logger {
  private context: Record<string, unknown> = {};

  private bunyanLogger: ReturnType<typeof bunyan.createLogger>;

  constructor(obj: Record<string, unknown> = {}) {
    defaults(this.context, obj);
    this.bunyanLogger = bunyan.createLogger({
      name: "e2e-flags",
    });
  }

  addParams(obj: Record<string, unknown> = {}) {
    return defaults(this.context, obj);
  }

  log(msg: string) {
    this.bunyanLogger.info(this.context, msg);
  }

  error(msg: unknown) {
    this.bunyanLogger.error(this.context, msg);
  }
}

export const logger = new Logger();
