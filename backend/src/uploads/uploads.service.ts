import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { createR2Client, R2Config, readR2Config } from './r2.client';

/**
 * Where each kind of image lives in the bucket. The client picks a folder; we
 * reject anything not on this list so a caller can never write an arbitrary key
 * (no path traversal, no escaping the type prefixes).
 */
export const UPLOAD_FOLDERS = [
  'products',
  'variants',
  'categories',
  'stores/logos',
  'stores/banners',
  'homepage',
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const ACCEPTED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_EDGE = 1600; // longest side after resize

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly config: R2Config | null;
  private readonly client: S3Client | null;

  constructor() {
    this.config = readR2Config();
    this.client = this.config ? createR2Client(this.config) : null;
    if (!this.config) {
      this.logger.warn(
        'R2 is not configured (missing R2_* env vars) — image uploads are disabled.',
      );
    }
  }

  isFolder(value: string): value is UploadFolder {
    return (UPLOAD_FOLDERS as readonly string[]).includes(value);
  }

  /**
   * Validate, compress to webp, store under `<folder>/<uuid>.webp`, and return
   * the public CDN URL to persist on the entity.
   */
  async upload(
    file: Express.Multer.File | undefined,
    folder: UploadFolder,
  ): Promise<{ url: string }> {
    if (!this.client || !this.config) {
      throw new ServiceUnavailableException('Image storage is not configured.');
    }
    if (!file) {
      throw new BadRequestException('No file provided.');
    }
    if (!ACCEPTED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller.');
    }

    let body: Buffer;
    try {
      // Re-encode everything to webp: smaller payloads for the mobile app, and
      // it strips any embedded metadata/exploits from the original file.
      body = await sharp(file.buffer)
        .rotate() // respect EXIF orientation before we drop the metadata
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Could not process the image — is it a valid file?');
    }

    const key = `${folder}/${randomUUID()}.webp`;
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: body,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch (err) {
      this.logger.error(`R2 upload failed for ${key}`, err as Error);
      throw new ServiceUnavailableException('Upload failed — please try again.');
    }

    return { url: `${this.config.publicUrl}/${key}` };
  }

  /**
   * Best-effort delete of a previously-uploaded image, given its public URL.
   * Used for delete-on-replace and entity deletion. Never throws — a failed
   * cleanup must not block the main write; it only leaves an orphan.
   */
  async deleteByUrl(url: string | null | undefined): Promise<void> {
    if (!url || !this.client || !this.config) return;
    const prefix = `${this.config.publicUrl}/`;
    if (!url.startsWith(prefix)) return; // not one of ours (e.g. a pasted external URL)

    const key = url.slice(prefix.length);
    if (!key) return;
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.warn(`R2 delete failed for ${key} (orphan left behind): ${String(err)}`);
    }
  }
}
