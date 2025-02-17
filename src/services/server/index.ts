import { AftermathFlagsProvider } from "../../flags-provider/aftermath";
import { LocalStorage } from "../../storage-provider/local";
import { RedisStorage } from "../../storage-provider/redis";
import { logger } from "../../utils/logger";
import { startServer } from "./main";

const redisStorage = new RedisStorage();
const localStorage = new LocalStorage();

const aftermathSecret = process.env.AFTERMATH_SECRET;

if (!aftermathSecret) {
  throw new Error("AFTERMATH_SECRET is not set");
}

const aftermathFlagsProvider = new AftermathFlagsProvider(aftermathSecret);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
startServer(redisStorage, localStorage, aftermathFlagsProvider, port);

process.on("SIGTERM", () => {
  logger.log("SIGTERM");
});

process.on("SIGINT", () => {
  logger.log("SIGINT");
});
