import express from "express";
import { IFlagsProvider } from "flags-provider/interface";
import gracefulShutdown from "http-graceful-shutdown";
import randToken from "rand-token";
import { FlagRedisKey, IStorage } from "storage-provider/interface";
import { StorageRedundancy } from "storage-provider/storage-redundancy";
import { Logger, logger } from "utils/logger";
import { objectHash } from "utils/object-hash";
import { getFlagsApi, getFlagsApiV2, isRegistered } from "./get-flags";

declare global {
  namespace Express {
    interface Request {
      flagsProvider: IFlagsProvider;
      logger: Logger;
      requestId: string;
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

  app.use(express.json());

  app.use(async (req, res, next) => {
    const requestId = randToken.generate(16);
    req.requestId = requestId;
    req.logger = new Logger({ requestId });
    req.logger.log(`got a call to ${req.originalUrl}`);
    res.on("finish", () => {
      req.logger.log("Request finished");
    });
    next();
  });

  app.get("/get-flags", async (req, res) => {
    try {
      const flagObj = await getFlagsApi(
        req.logger,
        storageRedundancy,
        flagsProvider,
        flagRedisKey
      );
      res.send(flagObj);
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.get("/v2/get-flags", async (req, res) => {
    try {
      const flagObj = await getFlagsApiV2(
        req.logger,
        storageRedundancy,
        flagsProvider
      );
      res.send(flagObj);
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.post(
    "/is-registered",
    express.json({ type: "application/json" }),
    async (req, res) => {
      try {
        const { list } = req.body;
        const nonRegisteredList = await isRegistered(flagsProvider, list);
        if (!nonRegisteredList.length) {
          res.status(200).end();
        } else {
          res.status(500).send({ nonRegisteredList });
        }
      } catch (error) {
        res.status(500).send({ error });
      }
    }
  );

  app.get("/v2/init", async (req, res) => {
    try {
      const branch = req.query.branch as unknown as string;
      let flagObj;
      if (["hotfix", "rc"].includes(branch)) {
        flagObj = await getFlagsApi(
          req.logger,
          storageRedundancy,
          flagsProvider
        );
      } else {
        flagObj = await getFlagsApiV2(
          req.logger,
          storageRedundancy,
          flagsProvider
        );
      }
      const hash = objectHash.toHash(flagObj);
      await storageRedundancy.set(hash, flagObj);
      res.send({ hash });
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.get("/init", async (req, res) => {
    try {
      const flagObj = await getFlagsApi(
        req.logger,
        storageRedundancy,
        flagsProvider
      );
      const hash = objectHash.toHash(flagObj);
      await storageRedundancy.set(hash, flagObj);
      res.send({ hash });
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  app.get("/v2/hash", async (req, res) => {
    try {
      const hash = req.query.hash as string;
      let flagObj;
      if (hash && req.query.hash !== "undefined") {
        try {
          flagObj = await storageRedundancy.get(hash);
          console.log("USING CACHE");
        } catch (e) {
          // @ts-ignore
          req.logger.error(e);
        }
      } else {
        req.logger.error("no hash was sent, reverting to get flags from api");
      }
      if (!flagObj) {
        flagObj = await getFlagsApiV2(
          req.logger,
          storageRedundancy,
          flagsProvider
        );
      }
      res.send(flagObj);
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
          // @ts-ignore
          req.logger.error(e);
        }
      } else {
        req.logger.error("no hash was sent, reverting to get flags from api");
      }
      if (!flagObj) {
        flagObj = await getFlagsApi(
          req.logger,
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
      logger.log(`shutting down, signal ${signal}`);
      return Promise.resolve();
    },
  });
  return { server, app };
};
