import * as process from "process";
import { createClient } from "redis";
import { logger } from "./logger";

const getUrl = () => {
  const host = process.env.REDIS_SERVICE_SERVICE_HOST;
  if (!host) {
    return;
  }
  const port = process.env.REDIS_SERVICE_SERVICE_PORT || "6379";
  return { url: `redis://${host}:${port}` };
};
export type ClientType = Promise<ReturnType<typeof createClient>>;
export const getClient = async (): ClientType => {
  const client = createClient(getUrl());
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
};

const cache: Record<string, unknown> = {};

export const getObj = async (
  client: ReturnType<typeof createClient> | undefined,
  key: string
) => {
  // the cache value is not expected to change frequently,
  // and it's important to return an answer even if there is a problem with redis.
  if (!client || !client.isReady) {
    logger.log("using cache");
    return cache[key];
  }
  try {
    const str = await client.get(key);
    if (str) {
      const obj = JSON.parse(str);
      cache[key] = obj;
      return obj;
    }
  } catch (e) {
    logger.error(e);
    logger.log("getting value from cache");
    return cache[key];
  }
};

export const clientPromise = getClient();
export const FlagRedisKey = "allFlags";
