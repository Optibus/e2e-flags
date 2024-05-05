// This is a provider that fetches from both Airtable and Aftermath
// Once we completely deprecate Airtable we will delete this file and use aftermath provider
import _ from "lodash";
import { AftermathFlagsProvider } from "./aftermath";
import { AirtableFlagsProvider } from "./airtable";
import { FlagsQuery, IFlagsProvider } from "./interface";

export class AftermathAirtableFlagsProvider implements IFlagsProvider {
  aftermath: AftermathFlagsProvider;

  airtable: AirtableFlagsProvider;

  constructor(aftermathApiKey: string, airtableApiKey: string) {
    console.log("Building AftermathAirtableFlagsProvider");
    this.aftermath = new AftermathFlagsProvider(aftermathApiKey);
    this.airtable = new AirtableFlagsProvider(airtableApiKey);
  }

  async getFlags(
    query: FlagsQuery = {
      deprecated: false,
      active: true,
      beforeDeployment: false,
    }
  ) {
    try {
      console.log("Calling AftermathAirtableFlagsProvider");
      // Get flags from aftermath and airtable
      const [aftermathFlags, airtableFlags] = await Promise.all([
        this.aftermath.getFlags(query),
        this.airtable.getFlags(query),
      ]);

      console.log("Aftermath flags", JSON.stringify(aftermathFlags));

      console.log(
        "Output",
        JSON.stringify(_.merge(airtableFlags, aftermathFlags))
      );
      // Merge the flags to one object
      return _.merge(airtableFlags, aftermathFlags);
    } catch (e) {
      console.log(e);
    }
  }
}
