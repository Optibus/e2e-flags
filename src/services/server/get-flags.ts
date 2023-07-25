import { IFlagsProvider } from "flags-provider/interface";
import { IStorage, FlagRedisKey } from "storage-provider/interface";
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
