import { Module } from '@nestjs/common';
import { ProductReviewsController, ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController, ProductReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
