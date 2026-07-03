import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import {
  ListProductReviewsQueryDto,
  UpsertMyReviewDto,
} from './dto/app-review.dto';
import { ReviewsService } from './reviews.service';

// Storefront reviews (mobile app). The list is public (browsable while logged
// out); the /me routes are scoped to the authenticated customer. @Public() so
// the global admin guard skips all of them.
@Public()
@Controller('app/products/:productId/reviews')
export class AppReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(
    @Param('productId') productId: string,
    @Query() query: ListProductReviewsQueryDto,
  ) {
    return this.reviews.listApprovedForProduct(
      productId,
      query.take ?? 10,
      query.skip ?? 0,
    );
  }

  @UseGuards(CustomerJwtGuard)
  @Get('me')
  mine(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.reviews.getMine(customer.id, productId);
  }

  @UseGuards(CustomerJwtGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Put('me')
  upsert(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('productId') productId: string,
    @Body() dto: UpsertMyReviewDto,
  ) {
    return this.reviews.upsertMine(customer.id, productId, dto);
  }

  @UseGuards(CustomerJwtGuard)
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.reviews.deleteMine(customer.id, productId);
  }
}
