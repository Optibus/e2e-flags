import { AirtableFlagsProvider } from "flags-provider/airtable";
import { RedisStorage } from "storage-provider/redis";
import { EnvSecrets, getDataFromSecret, secretPromise } from "utils/get-secret";
import { logger } from "utils/logger";
import { cronTask } from "./cron-task";

const redis = new RedisStorage();

export const runTaskWithSecret = async (
  secrets: EnvSecrets,
  exitWhenDone: boolean = true
) => {
  logger.log("starting cron job");
  const airtable = new AirtableFlagsProvider(secrets.AIRTABLE_TOKEN);
  await cronTask(airtable, redis);
  if (exitWhenDone) {
    logger.log("shutting down");
    process.exit(0);
  }
};

export const runJob = async (exitWhenDone: boolean = true) => {
  const secrets = await getDataFromSecret(secretPromise);
  return runTaskWithSecret(secrets, exitWhenDone);
};
