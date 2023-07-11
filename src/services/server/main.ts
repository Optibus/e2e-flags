import express from "express";
import { IFlagsProvider } from "flags-provider/interface";
import gracefulShutdown from "http-graceful-shutdown";
import { FlagRedisKey, IStorage } from "storage-provider/interface";
import { StorageRedundancy } from "storage-provider/storage-redundancy";
import { logger } from "utils/logger";
import { objectHash } from "utils/object-hash";
import { getFlagsApi } from "./get-flags";

declare global {
  namespace Express {
    interface Request {
      flagsProvider: IFlagsProvider;
    }
  }
}
export const startServer = (
  externalStorage: IStorage,
  localStorage: IStorage,
  flagsProvider: IFlagsProvider,
  port: number,
  flagRedisKey: string = FlagRedisKey
) => {
  const storageRedundancy = new StorageRedundancy(
    externalStorage,
    localStorage
  );

  const host = process.env.HOST ?? "localhost";
  const app = express();

  app.use(async (req, res, next) => {
    logger.log(`got a call to ${req.originalUrl}`);
    res.on("finish", () => {
      logger.log("Request finished");
    });
    next();
  });

  app.get("/get-flags", async (req, res) => {
    try {
      const flagObj = await getFlagsApi(
        storageRedundancy,
        flagsProvider,
        flagRedisKey
      );
      res.send(flagObj);
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.get("/init", async (req, res) => {
    try {
      const flagObj = await getFlagsApi(storageRedundancy, flagsProvider);
      const hash = objectHash.toHash(flagObj);
      await storageRedundancy.set(hash, flagObj);
      res.send({ hash });
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.get("/hash", async (req, res) => {
    try {
      const hash = req.query.hash as string;
      let flagObj;
      if (hash) {
        try {
          flagObj = await storageRedundancy.get(hash);
        } catch (e) {
          logger.error(e);
        }
      } else {
        logger.error("no hash was sent, reverting to get flags from api");
      }
      if (!flagObj) {
        flagObj = await getFlagsApi(
          storageRedundancy,
          flagsProvider,
          flagRedisKey
        );
      }
      res.send(flagObj);
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  const server = app.listen(port, host, () => {
    logger.log(`[ ready ] http://${host}:${port}`);
  });

  gracefulShutdown(server, {
    onShutdown: (signal) => {
      logger.log("shutting down", signal);
      return Promise.resolve();
    },
  });
  return { server, app };
};
