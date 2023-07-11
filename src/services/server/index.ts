import { AirtableFlagsProvider } from "flags-provider/airtable";
import { LocalStorage } from "storage-provider/local";
import { RedisStorage } from "storage-provider/redis";
import { getDataFromSecret, secretPromise } from "utils/get-secret";
import { logger } from "utils/logger";
import { startServer } from "./main";
const redisStorage = new RedisStorage();
const localStorage = new LocalStorage();

getDataFromSecret(secretPromise).then((secrets) => {
  const airtable = new AirtableFlagsProvider(secrets.AIRTABLE_TOKEN);
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  startServer(redisStorage, localStorage, airtable, port);
});

process.on("SIGTERM", () => {
  logger.log("SIGTERM");
});

process.on("SIGINT", () => {
  logger.log("SIGINT");
});
