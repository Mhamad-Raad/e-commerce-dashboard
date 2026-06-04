import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateReviewDto,
  ListReviewsQueryDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(@Query() query: ListReviewsQueryDto) {
    return this.reviews.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviews.findById(id);
  }

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviews.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviews.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.reviews.remove(id);
  }
}

@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.reviews.listForProduct(productId);
  }
}
