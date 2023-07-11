import { IFlagsProvider } from "flags-provider/interface";
import { IStorage, FlagRedisKey } from "storage-provider/interface";

export const cronTask = async (
  flagsProviderInstance: IFlagsProvider,
  storageProviderInstance: IStorage,
  flagRedisKey: string = FlagRedisKey
) => {
  const flagsDict = await flagsProviderInstance.getFlags();
  const flagsString = JSON.stringify(flagsDict) as string;
  await storageProviderInstance.set(flagRedisKey, flagsString);
  return flagsProviderInstance.disconnect?.();
};
