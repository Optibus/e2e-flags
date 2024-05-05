import { IStorage } from "./interface";

export class StorageRedundancy implements IStorage {
  private externalStorage: IStorage;

  private internalStorage: IStorage;

  constructor(externalStorage: IStorage, internalStorage: IStorage) {
    this.externalStorage = externalStorage;
    this.internalStorage = internalStorage;
  }

  async get(key: string) {
    return this.externalStorage.get(key);
  }

  async set(key: string, value: unknown): Promise<string | null> {
    return this.externalStorage.set(key, value);
  }
}
