import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Apply explicitly on protected customer routes. Those routes are also marked
// @Public() so the global admin JwtAuthGuard skips them and this one runs instead.
@Injectable()
export class CustomerJwtGuard extends AuthGuard('customer-jwt') {}
