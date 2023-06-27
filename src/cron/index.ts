import { getDataFromSecret, secretPromise } from "../get-secret";
import { logger } from "../logger";
import { FlagRedisKey } from "../redis";
import { cronTask } from "./cron-task";
const mainFn = async () => {
  logger.log("starting cron job");
  const secrets = await getDataFromSecret(secretPromise);
  await cronTask(FlagRedisKey, secrets.AIRTABLE_TOKEN);
};
const oneMinute = 60000;

const cronInterval =
  Number(process.env.CRON_INTERVAL || "0") * oneMinute || oneMinute;

logger.log(`interval will be ${cronInterval / oneMinute} minutes`);

mainFn();
setInterval(mainFn, cronInterval);
