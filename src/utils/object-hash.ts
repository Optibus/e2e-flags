import crypto from "crypto";
import { isObject } from "./my-dash";

class ReversibleHasher {
  private key = Buffer.alloc(32);

  private iv = Buffer.alloc(16);

  private algorithm = "aes-256-cbc";

  toHash(obj: Record<string, unknown> | string): string {
    const text = isObject(obj) ? JSON.stringify(obj) : obj;
    let cipher = crypto.createHash("md5");
    // @ts-ignore
    let encrypted = cipher.update(text);
    return encrypted.digest("hex");
    // encrypted = Buffer.concat([encrypted, cipher.final()]);
    // return encrypted.toString("hex") + "exit";
  }

  toHash2(obj: Record<string, unknown> | string): string {
    const text = isObject(obj) ? JSON.stringify(obj) : obj;
    let cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.key),
      this.iv
    );
    // @ts-ignore
    let encrypted = cipher.update(text);
    // @ts-ignore
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  fromHash(hash: string) {
    let encryptedText = Buffer.from(hash, "hex");
    let decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key),
      this.iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const stringResult = decrypted.toString();
    try {
      return JSON.parse(stringResult);
    } catch (e) {
      return stringResult;
    }
  }
}

// const decrypt = (text: string) => {
//   let iv = Buffer.from(iv, "hex");
//   let encryptedText = Buffer.from(text.encryptedData, "hex");
//   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// };

// var hw = encrypt("Some serious secret");
// console.log(hw);
// console.log(decrypt(hw));

export const objectHash = new ReversibleHasher();
