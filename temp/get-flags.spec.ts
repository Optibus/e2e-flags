import { describe, expect, test } from "@jest/globals";
import { getFlagsApi } from "../src/services/server/get-flags";

describe("api", () => {
  test("call", async () => {
    let bigDict = await getFlagsApi();
    let keys = Object.keys(bigDict);
    expect(keys[0]).toBe("features");
    bigDict = await getFlagsApi();
    keys = Object.keys(bigDict);
    expect(keys[0]).toBe("features");
  });
});
