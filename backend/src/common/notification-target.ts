import { BadRequestException } from '@nestjs/common';
import { HomeTargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Validation for a single tappable target (reusing HomeTargetType) on an
 * Announcement. Targets are stored as `targetType` + a plain `targetId`/`url`
 * (no FK), so we check existence on write; the app routes by targetType+id on
 * tap (no entity resolution needed for the notification row itself).
 */

/** Throw a clean 400 if the target is malformed or points at a missing entity. */
export async function validateTarget(
  prisma: PrismaService,
  targetType: HomeTargetType,
  targetId: string | null | undefined,
  url: string | null | undefined,
): Promise<void> {
  switch (targetType) {
    case 'NONE':
      return;
    case 'URL':
      if (!url || url.trim() === '') {
        throw new BadRequestException('A URL is required for a URL target.');
      }
      return;
    case 'PRODUCT':
      return assertExists(targetId, await count(prisma, 'product', targetId), 'product');
    case 'CATEGORY':
      return assertExists(targetId, await count(prisma, 'category', targetId), 'category');
    case 'STORE':
      return assertExists(targetId, await count(prisma, 'store', targetId), 'store');
    case 'BLOG':
      return assertExists(targetId, await count(prisma, 'blogPost', targetId), 'blog post');
  }
}

function assertExists(id: string | null | undefined, found: number, label: string): void {
  if (!id) throw new BadRequestException(`A ${label} must be selected for this target.`);
  if (found === 0) throw new BadRequestException(`The selected ${label} no longer exists.`);
}

async function count(
  prisma: PrismaService,
  model: 'product' | 'category' | 'store' | 'blogPost',
  id: string | null | undefined,
): Promise<number> {
  if (!id) return 0;
  switch (model) {
    case 'product':
      return prisma.product.count({ where: { id } });
    case 'category':
      return prisma.category.count({ where: { id } });
    case 'store':
      return prisma.store.count({ where: { id } });
    case 'blogPost':
      return prisma.blogPost.count({ where: { id } });
  }
}
