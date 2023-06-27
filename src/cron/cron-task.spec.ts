import { describe, expect, test } from "@jest/globals";
import { getDataFromSecret, secretPromise } from "../get-secret";
import { getClient, FlagRedisKey, getObj } from "../redis";
import { cronTask } from "./cron-task";

describe("cron-task", () => {
  test("set", async () => {
    const testKey = FlagRedisKey + "test";
    const secrets = await getDataFromSecret(secretPromise);
    await cronTask(testKey, secrets.AIRTABLE_TOKEN);
    const client = await getClient();
    const bigDict = await getObj(client, testKey);
    const keys = Object.keys(bigDict);
    expect(keys[0]).toBe("features");
  });
});
