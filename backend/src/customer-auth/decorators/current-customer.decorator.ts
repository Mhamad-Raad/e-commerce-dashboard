import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentCustomerPayload {
  id: string;
}

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentCustomerPayload => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
