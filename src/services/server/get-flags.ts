import { IFlagsProvider } from "flags-provider/interface";
import { get, isObject } from "lodash";
import {
  IStorage,
  FlagRedisKey,
  FlagRedisKeyV2,
} from "storage-provider/interface";
import { Logger } from "utils/logger";

export const getFlagsApi = async (
  logger: Logger,
  storage: IStorage,
  flagProvider: IFlagsProvider,
  flagRedisKey: string = FlagRedisKey
) => {
  try {
    return await storage.get(flagRedisKey);
  } catch (e) {
    // @ts-ignore
    logger.error(e);
    return flagProvider.getFlags();
  }
};

export const flagsV2 = (flagProvider: IFlagsProvider) => {
  return flagProvider.getFlags({
    deprecated: false,
    active: true,
    beforeDeployment: true,
  });
};

export const isRegistered = async (
  flagProvider: IFlagsProvider,
  list: string[]
) => {
  const currentFlags = await flagsV2(flagProvider);
  return list.filter((key) => {
    const value = get(currentFlags, key);
    return !value || isObject(value);
  });
};

export const getFlagsApiV2 = async (
  logger: Logger,
  storage: IStorage,
  flagProvider: IFlagsProvider,
  flagRedisKey: string = FlagRedisKeyV2
) => {
  try {
    return await storage.get(flagRedisKey);
  } catch (e) {
    // @ts-ignore
    logger.error(e);
    return flagsV2(flagProvider);
  }
};
