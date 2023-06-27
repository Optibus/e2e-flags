import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";
import _ from "lodash";

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

export const getFlags = async (
  apiKey: string,
  query: string = "NOT({Status} = 'Deprecated')"
) => {
  const base = airTableCreator.get(apiKey);
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
    _.set(result, key, value);
    return result;
  }, {});
};
