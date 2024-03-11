import { logger } from "../utils/logger";
import { IStorage } from "./interface";

export class StorageRedundancy implements IStorage {
  private externalStorage: IStorage;

  private internalStorage: IStorage;

  constructor(externalStorage: IStorage, internalStorage: IStorage) {
    this.externalStorage = externalStorage;
    this.internalStorage = internalStorage;
  }

  async get(key: string) {
    let returnValue;
    try {
      returnValue = await this.externalStorage.get(key);
      await this.internalStorage.set(key, returnValue);
    } catch (e) {
      logger.error(e);
      returnValue = await this.internalStorage.get(key);
    }
    if (returnValue !== null && returnValue !== undefined) {
      return returnValue;
    }
    throw new Error(`${key} not found internally and externally`);
  }

  async set(key: string, value: unknown): Promise<string | null> {
    await Promise.all([
      this.externalStorage.set(key, value),
      this.internalStorage.set(key, value),
    ]);
    return null;
  }
}
