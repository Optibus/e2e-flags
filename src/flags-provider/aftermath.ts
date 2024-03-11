import axios from "axios";
import dotenv from "dotenv";
import { set } from "../utils/my-dash";
import { FlagsReturnValue, IFlagsProvider } from "./interface";

dotenv.config();

const aftermathFeaturesURL = process.env.AFTERMATH_FEATURES_URL as string;

if (!aftermathFeaturesURL) {
  throw new Error("AFTERMATH_FEATURES_URL is not set");
}

/**
 * a utility function to get the right value of a flag whether is a boolean or custom
 * @param type
 * @param fields
 */
const fixType = (type: unknown) => {
  if (type === "true") {
    return true;
  }
  return type;
};

export class AftermathFlagsProvider implements IFlagsProvider {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getFlags() {
    try {
      const res = await axios.get<any[]>(aftermathFeaturesURL, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      const flags = res.data;

      const filterFlags = (flag: any) => {
        return flag.stage?.number > 0 && flag.stage?.number <= 5;
      };

      return flags.filter(filterFlags).reduce((result, current) => {
        const key = current.path as string;
        const value = fixType(current.value);
        // "features.gradual.momo.enabled", true
        set(result, key, value);
        return result;
      }, {} as FlagsReturnValue);
    } catch (e) {
      console.error(e);
      return {};
    }
  }
}
