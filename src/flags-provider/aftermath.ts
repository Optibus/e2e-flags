import axios from "axios";
import dotenv from "dotenv";
import { set } from "../utils/my-dash";
import { FlagsQuery, FlagsReturnValue, IFlagsProvider } from "./interface";

dotenv.config();

const aftermathFeaturesURL = process.env.AFTERMATH_FEATURES_URL as string;

if (!aftermathFeaturesURL) {
  throw new Error("AFTERMATH_FEATURES_URL is not set");
}

export class AftermathFlagsProvider implements IFlagsProvider {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getFlags(
    query: FlagsQuery = {
      deprecated: false,
      active: true,
      beforeDeployment: false,
    }
  ) {
    try {
      const res = await axios.get<any[]>(aftermathFeaturesURL, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      const flags = res.data;

      const filterFlags = (flag: any) => {
        let shouldKeep = false;
        if (query.active) {
          shouldKeep = flag.stage?.number > 0 && flag.stage?.number <= 6;
          if (
            !shouldKeep &&
            query.beforeDeployment &&
            flag.stage?.number === 0
          ) {
            shouldKeep = true;
          }
        }
        if (!shouldKeep && query.deprecated && flag.stage?.number > 5) {
          shouldKeep = true;
        }
        if (flag.status === "paused") {
          shouldKeep = false;
        }
        return shouldKeep;
      };

      return flags.filter(filterFlags).reduce((result, current) => {
        const key = current.path as string;
        // "features.gradual.momo.enabled", true
        set(result, key, true);
        return result;
      }, {} as FlagsReturnValue);
    } catch (e) {
      console.error(e);
      return {};
    }
  }
}
