import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { MulterExceptionFilter } from './multer-exception.filter';
import { ACCEPTED_MIME, MAX_UPLOAD_BYTES, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  // Image processing is CPU-heavy (sharp), so cap it well below the global rate
  // limit to blunt abuse.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post()
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep the buffer in memory for sharp
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
      // Reject non-images before buffering the whole file. Passing an
      // HttpException to the callback yields a clean 400 (not a 500).
      fileFilter: (_req, file, cb) => {
        if (ACCEPTED_MIME.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed.'), false);
        }
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!folder || !this.uploads.isFolder(folder)) {
      throw new BadRequestException('Invalid or missing upload folder.');
    }
    return this.uploads.upload(file, folder);
  }
}
