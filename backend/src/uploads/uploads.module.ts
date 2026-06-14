import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

// Global so any module (products, categories, stores…) can inject UploadsService
// for delete-on-replace without re-importing it everywhere.
@Global()
@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
