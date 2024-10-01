import * as console from "console";
import * as process from "process";
import { createClient } from "redis";
import { logger } from "../utils/logger";
import { isObject } from "../utils/my-dash";
import { IStorage } from "./interface";

export class RedisStorage implements IStorage {
  private client: ReturnType<typeof createClient>;

  private SECONDS_IN_DAY = 86400;

  getUrl() {
    const host = process.env.REDIS_SERVICE_SERVICE_HOST;
    if (!host) {
      return;
    }
    const port = process.env.REDIS_SERVICE_SERVICE_PORT || "6379";
    return { url: `redis://${host}:${port}` };
  }

  constructor() {
    this.client = createClient(this.getUrl());
    this.client.on("error", (err) => console.log("Redis Client Error", err));
    this.client.connect();
  }

  set(key: string, value: unknown) {
    let valueToSet = value;
    if (isObject(value)) {
      valueToSet = JSON.stringify(value);
    }
    // @ts-ignore
    return this.client.set(key, valueToSet, { EX: this.SECONDS_IN_DAY });
  }

  disconnect() {
    return this.client.disconnect();
  }

  async get(key: string) {
    // the cache value is not expected to change frequently,
    // and it's important to return an answer even if there is a problem with redis.
    if (!this.client.isReady) {
      throw new Error("Redis not ready");
    }
    try {
      const str = await this.client.get(key);
      if (str) {
        return JSON.parse(str);
      }
    } catch (e) {
      logger.error(e);
      throw new Error("error getting value from cache");
    }
    throw new Error("no value");
  }
}
