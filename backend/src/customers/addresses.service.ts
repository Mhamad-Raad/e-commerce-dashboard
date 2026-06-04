import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { City, Governorate } from '@prisma/client';
import { cityInGovernorate } from '../common/iraq-geo';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

const MAX_ADDRESSES = 3;

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  private async ensureCustomer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);
  }

  private validateCity(governorate: Governorate, city: City) {
    if (!cityInGovernorate(governorate, city)) {
      throw new BadRequestException(
        `${city} is not a city of ${governorate}`,
      );
    }
  }

  async list(customerId: string) {
    await this.ensureCustomer(customerId);
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(customerId: string, dto: CreateAddressDto) {
    await this.ensureCustomer(customerId);
    this.validateCity(dto.governorate, dto.city);

    const count = await this.prisma.address.count({ where: { customerId } });
    if (count >= MAX_ADDRESSES) {
      throw new BadRequestException(
        `A customer can have at most ${MAX_ADDRESSES} addresses`,
      );
    }

    // The first address is always the default; otherwise honour the flag.
    const isDefault = count === 0 ? true : dto.isDefault ?? false;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({ data: { ...dto, customerId, isDefault } });
    });
  }

  async update(customerId: string, id: string, dto: UpdateAddressDto) {
    const existing = await this.findOwned(customerId, id);
    const governorate = dto.governorate ?? existing.governorate;
    const city = dto.city ?? existing.city;
    this.validateCity(governorate, city);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { customerId, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({ where: { id }, data: dto });
    });
  }

  async remove(customerId: string, id: string) {
    const existing = await this.findOwned(customerId, id);
    await this.prisma.address.delete({ where: { id } });

    // If we removed the default, promote the oldest remaining address.
    if (existing.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  }

  private async findOwned(customerId: string, id: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.customerId !== customerId) {
      throw new NotFoundException(`Address ${id} not found for customer ${customerId}`);
    }
    return address;
  }
}
