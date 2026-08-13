import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const iterations = 100_000;
const keyLength = 32;
const digest = "sha256";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = pbkdf2Sync(password, salt, iterations, keyLength, digest);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
