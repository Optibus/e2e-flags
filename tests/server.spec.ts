import * as http from "http";
import { Express } from "express";
import { AirtableFlagsProvider } from "flags-provider/airtable";
import { cronTask } from "services/cron/cron-task";
import { startServer } from "services/server/main";
import { IStorage } from "storage-provider/interface";
import { LocalStorage } from "storage-provider/local";
import { RedisStorage } from "storage-provider/redis";

import request from "supertest";
// import { FakeFlagsProvider } from "./mocks/flags-provider";

const FakeFlagsProvider = AirtableFlagsProvider;

const curl = (app: Express, url: string) => {
  return new Promise((resolve, reject) => {
    return request(app)
      .get(url)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res.body);
      });
  });
};

const flagValues = {
  features: {
    gradual: {
      timeplan: {
        enabled: true,
      },
    },
  },
};
describe("api tests", () => {
  let server: http.Server,
    app: Express,
    externalStorage: IStorage,
    storage2: IStorage,
    flagsProvider: FakeFlagsProvider,
    flagRedisKey: string;
  beforeEach(() => {
    externalStorage = new RedisStorage();
    storage2 = new LocalStorage();
    flagsProvider = new FakeFlagsProvider(
      "patdlUvTQOG12JRCJ.65dab8017b1a209aff8234fa0449d277b12aeed1ee40b2496a400967d6380ea9"
    );
    flagRedisKey = String(Math.random() * 1000 + 3000);
    const port = Math.floor(Math.random() * 1000 + 3000);
    ({ server, app } = startServer(
      externalStorage,
      storage2,
      flagsProvider,
      port,
      flagRedisKey
    ));
  });
  afterEach(async () => {
    try {
      await externalStorage.disconnect?.();
    } catch (e) {}
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        return resolve(void 0);
      });
    });
  });
  describe("/get-flags", () => {
    test("should call fake provider get flags", async () => {
      // flagsProvider.setData(flagValues);
      const result = await curl(app, "/v2/get-flags");
      expect(flagsProvider.numberOfCalls).toBe(1);
      expect(result).toMatchObject(flagValues);
    }, 60000);

    test("should call fake provider NOT get flags", async () => {
      flagsProvider.setData(flagValues);
      await cronTask(flagsProvider, externalStorage, flagRedisKey);
      // the flags provider was called once
      expect(flagsProvider.numberOfCalls).toBe(1);

      let result = await curl(app, "/get-flags");
      expect(result).toMatchObject(flagValues);
      // the flags provider was not called
      expect(flagsProvider.numberOfCalls).toBe(1);
      expect(result).toMatchObject(flagValues);

      // check that we still get the same value as before
      // even the external storage is disconnected
      await externalStorage.disconnect?.();
      result = await curl(app, "/get-flags");
      expect(result).toMatchObject(flagValues);
      expect(flagsProvider.numberOfCalls).toBe(1);
      expect(result).toMatchObject(flagValues);
    }, 60000);
  });
  describe("/init and /hash", () => {
    test("send hash with no hash", async () => {
      flagsProvider.setData(flagValues);
      await cronTask(flagsProvider, externalStorage, flagRedisKey);
      const result = await curl(app, "/hash");
      expect(flagsProvider.numberOfCalls).toBe(1);
      expect(result).toMatchObject(flagValues);
    });
    test("sanity", async () => {
      flagsProvider.setData(flagValues);
      await cronTask(flagsProvider, externalStorage, flagRedisKey);
      let result = await curl(app, "/init");
      // @ts-ignore
      let hash = result?.hash as string;
      console.log(hash);
      result = await curl(app, `/hash?hash=${hash}`);
      expect(result).toMatchObject(flagValues);

      await externalStorage.disconnect?.();
      result = await curl(app, `/hash?hash=${hash}`);
      expect(result).toMatchObject(flagValues);

      storage2.get = () => {
        throw new Error("for testing");
      };
      result = await curl(app, `/hash?hash=${hash}`);
      expect(result).toMatchObject(flagValues);
    });
  });
});
