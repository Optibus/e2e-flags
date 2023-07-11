import { IFlagsProvider } from "flags-provider/interface";
import { IStorage, FlagRedisKey } from "storage-provider/interface";
import { logger } from "utils/logger";

export const getFlagsApi = async (
  storage: IStorage,
  flagProvider: IFlagsProvider,
  flagRedisKey: string = FlagRedisKey
) => {
  try {
    return await storage.get(flagRedisKey);
  } catch (e) {
    logger.error(e);
    return flagProvider.getFlags();
  }
};
