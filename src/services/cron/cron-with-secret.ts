import dotenv from "dotenv";
import { AftermathAirtableFlagsProvider } from "flags-provider/aftermath-airtable";
import { RedisStorage } from "storage-provider/redis";
import { logger } from "utils/logger";
import { cronTaskV2, cronTask } from "./cron-task";

dotenv.config();

const aftermathSecret = process.env.AFTERMATH_SECRET;
const airtableSecret = process.env.AIRTABLE_TOKEN;

if (!aftermathSecret) {
  throw new Error("AFTERMATH_SECRET is not set");
}

if (!airtableSecret) {
  throw new Error("AIRTABLE_TOKEN is not set");
}

const redis = new RedisStorage();

export const runTaskWithSecret = async (
  secrets: {
    aftermathSecret: string;
    airtableSecret: string;
  },
  exitWhenDone: boolean = true
) => {
  logger.log("starting cron job");
  const flagProvider = new AftermathAirtableFlagsProvider(
    secrets.aftermathSecret,
    secrets.airtableSecret
  );
  await cronTask(flagProvider, redis);
  await cronTaskV2(flagProvider, redis);
  if (exitWhenDone) {
    logger.log("shutting down");
    process.exit(0);
  }
};

export const runJob = async (exitWhenDone: boolean = true) => {
  return runTaskWithSecret(
    {
      aftermathSecret,
      airtableSecret,
    },
    exitWhenDone
  );
};
