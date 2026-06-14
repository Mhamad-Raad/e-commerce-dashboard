import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 is S3-compatible, so we talk to it with the AWS S3 SDK.
 *
 * Writes (PutObject/DeleteObject) go to the S3 API endpoint
 * (R2_ENDPOINT = https://<accountid>.r2.cloudflarestorage.com) authenticated
 * with the Object Read & Write token's access key / secret.
 *
 * Reads are public and direct from R2_PUBLIC_URL (the pub-*.r2.dev domain) —
 * no SDK, no auth — so the mobile app and storefront hit the CDN, not our API.
 */
export interface R2Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    // R2 ignores region but the SDK requires one; "auto" is the documented value.
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}
