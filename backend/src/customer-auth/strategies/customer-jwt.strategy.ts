import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface CustomerJwtPayload {
  sub: string; // customerId
  typ: 'customer'; // distinguishes from admin User tokens
}

/**
 * Validates a customer access token. Registered under the name 'customer-jwt' and
 * signed with its own secret, so a customer token can never satisfy the admin
 * 'jwt' strategy (and vice versa) even if the secrets were ever shared.
 */
@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('CUSTOMER_JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: CustomerJwtPayload) {
    if (payload.typ !== 'customer') throw new UnauthorizedException();
    return { id: payload.sub };
  }
}
