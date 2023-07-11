import { objectHash } from "utils/object-hash";

describe("object-hash", () => {
  test("reversibility", () => {
    const obj = {
      myObj: 1,
      bool: true,
      // data: new Date(),
    };
    debugger;
    const hash = objectHash.toHash(obj);
    console.log(hash);
    // const back = objectHash.fromHash(hash);
    expect(hash).toEqual("5fb1979f106b484768a37c44bef70596");
  });
});
