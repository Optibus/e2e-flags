import { IStorage } from "storage-provider/interface";

export class LocalStorage implements IStorage {
  private cache: Record<string, unknown> = {};

  get(key: string) {
    return Promise.resolve(this.cache[key]);
  }

  set(key: string, value: unknown) {
    this.cache[key] = value;
    return Promise.resolve(null);
  }
}
