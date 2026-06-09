import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('summary')
  summary(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.summary({ start, end });
  }

  @Get('timeseries')
  timeseries(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.timeseries({ start, end });
  }

  @Get('sales-by-store')
  salesByStore(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.salesByStore({ start, end });
  }

  @Get('sales-by-governorate')
  salesByGovernorate(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.salesByGovernorate({ start, end });
  }

  @Get('charges')
  charges(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.charges({ start, end });
  }

  @Get('refund-stats')
  refundStats(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reports.refundStats({ start, end });
  }

  @Get('top-products')
  topProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.reports.topProducts(limit, { start, end });
  }

  @Get('recent-orders')
  recentOrders(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reports.recentOrders(limit);
  }
}
