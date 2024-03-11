import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";
import { set } from "../utils/my-dash";
import { FlagsReturnValue, IFlagsProvider } from "./interface";

class AirtableInstance {
  base: AirtableBase;

  baseId: string = "apptxGM3XLRUX9aLM";

  get(apiKey: string) {
    if (!this.base) {
      this.base = new Airtable({ apiKey }).base(this.baseId);
    }
    return this.base;
  }
}

const airTableCreator = new AirtableInstance();

/**
 * a utility function to get the right value of a flag whether is a boolean or custom
 * @param type
 * @param fields
 */
const fixType = (type: unknown, fields: Record<string, any>) => {
  if (type === "true") {
    return true;
  }
  if (type === "custom value") {
    return fields["flag custom value"];
  }
  return type;
};

export class AirtableFlagsProvider implements IFlagsProvider {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getFlags(query: string = "NOT({Status} = 'Deprecated')") {
    const base = airTableCreator.get(this.apiKey);
    const getFlagsApi = () => {
      const page = base("Features").select({
        view: "Grid view",
        filterByFormula: query,
        fields: [
          "Feature Name",
          "flag full path",
          "Status",
          "flag required value",
          "flag custom value",
        ],
      });
      return page.all();
    };

    const flags = await getFlagsApi();

    // @ts-ignore
    const filterFlags = (flag) => {
      return flag.fields.Status && flag.fields.Status.match("Stage");
    };

    return flags.filter(filterFlags).reduce((result, current) => {
      const key = current.fields["flag full path"] as string;
      const value = fixType(
        current.fields["flag required value"],
        current.fields
      );
      // "features.gradual.momo.enabled", true
      set(result, key, value);
      return result;
    }, {} as FlagsReturnValue);
  }

  async getAllFlags(query: string = "NOT({Status} = 'Deprecated')") {
    const base = airTableCreator.get(this.apiKey);
    const getFlagsApi = () => {
      const page = base("Features").select({
        view: "Grid view",
        filterByFormula: query,
        fields: [
          "Feature Name",
          "flag full path",
          "Status",
          "flag required value",
          "flag custom value",
        ],
      });
      return page.all();
    };

    const flags = await getFlagsApi();

    return flags.reduce((result, current) => {
      const key = current.fields["flag full path"] as string;
      const value = fixType(
        current.fields["flag required value"],
        current.fields
      );
      set(result, key, value);
      return result;
    }, {} as FlagsReturnValue);
  }
}
