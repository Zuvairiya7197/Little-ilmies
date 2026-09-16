import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Backblaze B2 is S3-compatible, so the standard AWS S3 client talks to it
 * directly — no AWS account involved, this SDK is just a protocol client.
 * See lib/storage/index.ts for the security model these calls sit behind.
 */

let cachedClient: S3Client | null = null;

export function isB2Configured() {
  return Boolean(process.env.B2_KEY_ID && process.env.B2_APP_KEY && process.env.B2_BUCKET_NAME && process.env.B2_ENDPOINT);
}

export function getB2Bucket() {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) throw new Error("B2_BUCKET_NAME is not set.");
  return bucket;
}

export function getB2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const { B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, B2_REGION } = process.env;
  if (!B2_KEY_ID || !B2_APP_KEY || !B2_ENDPOINT) {
    throw new Error("Backblaze B2 is not configured — set B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, B2_BUCKET_NAME.");
  }

  cachedClient = new S3Client({
    region: B2_REGION || "us-west-004",
    endpoint: B2_ENDPOINT,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APP_KEY,
    },
  });
  return cachedClient;
}

export { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand };
