import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

/**
 * Multer aborts an upload with a MulterError (e.g. the file exceeds the
 * configured size limit). Without this filter it would surface as a generic
 * 500; here we translate the common cases into clean client errors.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(err: MulterError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const isTooLarge = err.code === 'LIMIT_FILE_SIZE';
    const status = isTooLarge
      ? HttpStatus.PAYLOAD_TOO_LARGE
      : HttpStatus.BAD_REQUEST;
    const message = isTooLarge
      ? 'Image must be 5 MB or smaller.'
      : 'Invalid file upload.';
    res.status(status).json({ statusCode: status, message });
  }
}
