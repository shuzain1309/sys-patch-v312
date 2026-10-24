// usage: PAYLOAD_KEY=... node crypt.mjs enc|dec <in> <out>   (same file lives in local app/)
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const key = () => {
  if (!process.env.PAYLOAD_KEY) throw new Error("PAYLOAD_KEY missing");
  return createHash("sha256").update(process.env.PAYLOAD_KEY).digest();
};
export const enc = (b) => {
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", key(), iv);
  const x = Buffer.concat([c.update(b), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), x]);
};
export const dec = (b) => {
  const d = createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]);
};
if (process.argv[1]?.endsWith("crypt.mjs")) {
  const [, , mode, i, o] = process.argv;
  writeFileSync(o, (mode === "enc" ? enc : dec)(readFileSync(i)));
}
