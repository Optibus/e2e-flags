import { IFlagsProvider } from "../src/flags-provider/interface";
import { StorageRedundancy } from "../src/storage-provider/storage-redundancy";
import { logger } from "../src/utils/logger";

export class StorageFlagsRedundancy {
  storageRedundancy: StorageRedundancy;

  flagsProvider: IFlagsProvider;

  constructor(
    storageRedundancy: StorageRedundancy,
    flagsProvider: IFlagsProvider
  ) {
    this.storageRedundancy = storageRedundancy;
    this.flagsProvider = flagsProvider;
  }

  async get(key: string) {
    try {
      return await this.storageRedundancy.get(key);
    } catch (error) {
      logger.error(error);
      return this.flagsProvider.getFlags();
    }
  }
}
