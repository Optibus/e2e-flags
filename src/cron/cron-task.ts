import { getClient } from "../redis";
import { getFlags } from "./airtable";

export const cronTask = async (redisKey: string, apiKey: string) => {
  const redisClient = await getClient();
  const flagsDict = await getFlags(apiKey);
  const flagsString = JSON.stringify(flagsDict) as string;
  await redisClient.set(redisKey, flagsString);
  await redisClient.disconnect();
};
