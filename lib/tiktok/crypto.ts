import { createHmac, timingSafeEqual } from "crypto";

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function encodeSignedPayload<T extends object>(
  payload: T,
  secret: string,
): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function decodeSignedPayload<T>(
  value: string,
  secret: string,
): T | null {
  const [data, signature] = value.split(".");
  if (!data || !signature) return null;

  const expected = sign(data, secret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createCsrfToken(): string {
  return crypto.randomUUID();
}
