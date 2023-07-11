import { IFlagsProvider, FlagsReturnValue } from "flags-provider/interface";
interface Fake extends IFlagsProvider {
  setData: (data: FlagsReturnValue) => void;
}
export class FakeFlagsProvider implements Fake {
  seedData: FlagsReturnValue;

  numberOfCalls = 0;

  constructor(seeData?: FlagsReturnValue) {
    if (seeData) {
      this.seedData = seeData;
    }
  }

  getFlags() {
    this.numberOfCalls++;
    return Promise.resolve(this.seedData);
  }

  setData(data: FlagsReturnValue) {
    this.seedData = data;
  }
}
