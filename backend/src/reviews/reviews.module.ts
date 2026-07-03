import { Module } from '@nestjs/common';
import { AppReviewsController } from './app-reviews.controller';
import { ProductReviewsController, ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController, ProductReviewsController, AppReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
