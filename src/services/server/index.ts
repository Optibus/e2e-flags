import { AftermathAirtableFlagsProvider } from "../../flags-provider/aftermath-airtable";
import { LocalStorage } from "../../storage-provider/local";
import { RedisStorage } from "../../storage-provider/redis";
import { logger } from "../../utils/logger";
import { startServer } from "./main";

const redisStorage = new RedisStorage();
const localStorage = new LocalStorage();

const aftermathSecret = process.env.AFTERMATH_SECRET;
const airtableSecret = process.env.AIRTABLE_TOKEN;

if (!aftermathSecret) {
  throw new Error("AFTERMATH_SECRET is not set");
}

if (!airtableSecret) {
  throw new Error("AIRTABLE_TOKEN is not set");
}

const aftermathAirtableFlagsProvider = new AftermathAirtableFlagsProvider(
  aftermathSecret,
  airtableSecret
);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
startServer(redisStorage, localStorage, aftermathAirtableFlagsProvider, port);

process.on("SIGTERM", () => {
  logger.log("SIGTERM");
});

process.on("SIGINT", () => {
  logger.log("SIGINT");
});
