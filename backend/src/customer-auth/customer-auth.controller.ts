import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { Public } from '../auth/decorators/public.decorator';
import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
} from '../uploads/uploads.service';
import { MulterExceptionFilter } from '../uploads/multer-exception.filter';
import { CustomerAuthService } from './customer-auth.service';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from './decorators/current-customer.decorator';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { CustomerLoginDto } from './dto/login.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CustomerLogoutDto } from './dto/logout.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Mobile customer auth. Every route is @Public() so the global admin JwtAuthGuard
// skips it; protected routes apply CustomerJwtGuard explicitly. Lives under
// /api/app/auth to stay clear of the admin /api/auth surface.
@Controller('app/auth')
export class CustomerAuthController {
  constructor(private auth: CustomerAuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Public()
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  verifyPhone(@Body() dto: VerifyPhoneDto, @Req() req: Request) {
    return this.auth.verifyPhone(dto, this.ctx(req));
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: CustomerLoginDto, @Req() req: Request) {
    return this.auth.login(dto, this.ctx(req));
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, this.ctx(req));
  }

  @Public()
  @UseGuards(CustomerJwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: CustomerLogoutDto,
  ) {
    return this.auth.logout(customer.id, dto.refreshToken);
  }

  @Public()
  @UseGuards(CustomerJwtGuard)
  @Get('me')
  me(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.auth.me(customer.id);
  }

  @Public()
  @UseGuards(CustomerJwtGuard)
  @Patch('profile')
  updateProfile(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.auth.updateProfile(customer.id, dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Public()
  @UseGuards(CustomerJwtGuard)
  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.auth.deleteAccount(customer.id);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @UseGuards(CustomerJwtGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(customer.id, dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Public()
  @UseGuards(CustomerJwtGuard)
  @Post('avatar')
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (ACCEPTED_MIME.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPEG, PNG, and WebP images are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadAvatar(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.auth.updateAvatar(customer.id, file);
  }

  private ctx(req: Request) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
  }
}
