import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep the buffer in memory for sharp
      limits: { fileSize: 5 * 1024 * 1024 }, // hard stop before buffering huge files
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
