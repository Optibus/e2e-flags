import { logger } from "utils/logger";
import { runJob } from "./cron-with-secret";

const oneMinute = 60000;

const cronInterval =
  Number(process.env.CRON_INTERVAL || "0") * oneMinute || oneMinute;

logger.log(`interval will be ${cronInterval / oneMinute} minutes`);

runJob(false);
setInterval(() => {
  runJob(false);
}, cronInterval);
