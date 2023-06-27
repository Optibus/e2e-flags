import { logger } from "../logger";
import { clientPromise, FlagRedisKey, getObj } from "../redis";

export const getFlagsApi = async () => {
  try {
    const client = await clientPromise;
    return await getObj(client, FlagRedisKey);
  } catch (e) {
    logger.error(e);
    return getObj(undefined, FlagRedisKey);
  }
};
