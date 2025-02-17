import dotenv from "dotenv";
import { AftermathFlagsProvider } from "flags-provider/aftermath";
import { RedisStorage } from "storage-provider/redis";
import { logger } from "utils/logger";
import { cronTaskV2, cronTask } from "./cron-task";

dotenv.config();

const aftermathSecret = process.env.AFTERMATH_SECRET;

if (!aftermathSecret) {
  throw new Error("AFTERMATH_SECRET is not set");
}

const redis = new RedisStorage();

export const runTaskWithSecret = async (
  secrets: {
    aftermathSecret: string;
  },
  exitWhenDone: boolean = true
) => {
  logger.log("starting cron job");
  const flagProvider = new AftermathFlagsProvider(secrets.aftermathSecret);
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
    },
    exitWhenDone
  );
};
