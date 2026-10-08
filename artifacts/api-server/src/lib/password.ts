import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Scrypt salts and hashes are never sent to the browser or put in session data.
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => error ? reject(error) : resolve(key));
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, encoded?: string) {
  const [algorithm, salt, hex] = (encoded ?? "").split("$");
  const valid = algorithm === "scrypt" && /^[a-f0-9]{32}$/.test(salt ?? "") && /^[a-f0-9]{128}$/.test(hex ?? "");
  // Equal-cost work for unknown emails prevents fast account discovery.
  const actual = await derive(password, valid ? salt : "00000000000000000000000000000000");
  return valid && timingSafeEqual(actual, Buffer.from(hex, "hex"));
}
