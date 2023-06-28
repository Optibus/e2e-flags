import { getDataFromSecret, secretPromise } from "../get-secret";
import { logger } from "../logger";
import { FlagRedisKey } from "../redis";
import { cronTask } from "./cron-task";
const mainFn = async () => {
  logger.log("starting task");
  const secrets = await getDataFromSecret(secretPromise);
  await cronTask(FlagRedisKey, secrets.AIRTABLE_TOKEN);
  logger.log("shutting down");
  process.exit(0);
};

mainFn();
