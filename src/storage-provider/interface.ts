export interface IStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<string | null>;
  disconnect?: () => Promise<void>;
}

export const FlagRedisKey = "allFlags";
