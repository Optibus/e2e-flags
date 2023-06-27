import { AWSError, SecretsManager } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

const client = new SecretsManager({});

export type EnvSecrets = {
  AIRTABLE_TOKEN: string;
};

export const secretPromise = client
  .getSecretValue({
    SecretId: "airtable-flags-api-key",
  })
  .promise();

export const getDataFromSecret = async (
  secretData: Promise<
    PromiseResult<SecretsManager.GetSecretValueResponse, AWSError>
  >
): Promise<EnvSecrets> => {
  const data = await secretData;
  if (data.SecretString) {
    return JSON.parse(data.SecretString);
  }

  const buff = Buffer.from(data.SecretBinary as any, "base64");
  return JSON.parse(buff.toString("ascii"));
};
