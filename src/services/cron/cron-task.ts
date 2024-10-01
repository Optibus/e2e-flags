import { IFlagsProvider } from "flags-provider/interface";
import { flagsV2 } from "services/server/get-flags";
import {
  IStorage,
  FlagRedisKey,
  FlagRedisKeyV2,
} from "storage-provider/interface";

export const cronTask = async (
  flagsProviderInstance: IFlagsProvider,
  storageProviderInstance: IStorage,
  flagRedisKey: string = FlagRedisKey
) => {
  const flagsDict = await flagsProviderInstance.getFlags({
    deprecated: false,
    active: true,
    beforeDeployment: false,
  });
  const flagsString = JSON.stringify(flagsDict) as string;
  await storageProviderInstance.set(flagRedisKey, flagsString);
  return flagsProviderInstance.disconnect?.();
};

export const cronTaskV2 = async (
  flagsProviderInstance: IFlagsProvider,
  storageProviderInstance: IStorage,
  flagRedisKey: string = FlagRedisKeyV2
) => {
  const flagsDict = await flagsV2(flagsProviderInstance);
  const flagsString = JSON.stringify(flagsDict) as string;
  await storageProviderInstance.set(flagRedisKey, flagsString);
  return flagsProviderInstance.disconnect?.();
};
