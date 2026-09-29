import { Storage } from "@google-cloud/storage";
import type { File } from "@google-cloud/storage";

const sidecar = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${sidecar}/token`,
    type: "external_account",
    credential_source: {
      url: `${sidecar}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function privateDir() {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  const parts = dir.replace(/^\/|\/$/g, "").split("/");
  if (parts.length < 2 || parts.some(p => !p)) throw new Error("Invalid PRIVATE_OBJECT_DIR");
  return { bucket: parts[0], prefix: parts.slice(1).join("/") };
}
export function pendingPath(id: string) {
  return `/objects/feedback-pending/${id}`;
}
function objectFile(folder: "feedback-pending" | "feedback-published", id: string): File {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid image identifier");
  const { bucket, prefix } = privateDir();
  return storage.bucket(bucket).file(`${prefix}/${folder}/${id}`);
}
export const pendingFile = (id: string) => objectFile("feedback-pending", id);
export const publishedFile = (id: string) => objectFile("feedback-published", id);

export async function signUpload(id: string) {
  const { bucket, prefix } = privateDir();
  const response = await fetch(`${sidecar}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucket, object_name: `${prefix}/feedback-pending/${id}`,
      method: "PUT", expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Object storage signing failed (${response.status})`);
  const json: unknown = await response.json();
  if (!json || typeof json !== "object" || !("signed_url" in json) || typeof json.signed_url !== "string") throw new Error("Object storage returned no signed URL");
  return json.signed_url;
}

const MAX_BYTES = 5 * 1024 * 1024;
export async function verifyImage(file: File, expectedType: string, expectedSize: number) {
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size);
  if (!Number.isInteger(size) || size < 1 || size > MAX_BYTES || size !== expectedSize || metadata.contentType !== expectedType) throw new Error("Uploaded image size or type does not match");
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of file.createReadStream()) {
    const data = Buffer.from(chunk);
    length += data.length;
    if (length > MAX_BYTES) throw new Error("Image exceeds 5MB");
    chunks.push(data);
  }
  if (length !== size) throw new Error("Image size mismatch");
  const b = Buffer.concat(chunks);
  const jpeg = b.length >= 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9;
  // A PNG ends with the zero-length IEND chunk and its fixed CRC32.
  const png = b.length >= 45 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && b.toString("ascii", 12, 16) === "IHDR" && b.subarray(-12).equals(Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130]));
  const webp = b.length >= 20 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" && b.readUInt32LE(4) + 8 === b.length && ["VP8 ", "VP8L", "VP8X"].includes(b.toString("ascii", 12, 16));
  if (!({ "image/jpeg": jpeg, "image/png": png, "image/webp": webp }[expectedType])) throw new Error("Invalid image bytes");
}