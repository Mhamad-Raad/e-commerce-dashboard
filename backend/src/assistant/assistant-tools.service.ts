import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantTool } from './provider/assistant-provider.interface';

/**
 * The tools the assistant can call, plus their execution against the catalog.
 * Kept separate from the chat orchestration so it's independently testable and
 * reusable, and so adding a tool doesn't touch the chat flow.
 */
@Injectable()
export class AssistantToolsService {
  constructor(private prisma: PrismaService) {}

  readonly definitions: AssistantTool[] = [
    {
      name: 'search_products',
      description:
        'Search the products WE sell. Call before recommending anything. Returns real, in-stock-aware items with prices and attributes.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keywords: a concern, product type, ingredient, or name.',
          },
          limit: { type: 'integer', description: 'Max results (1-10).' },
        },
      },
    },
    {
      name: 'search_stores',
      description: 'Search the stores/brands we carry.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer' },
        },
      },
    },
  ];

  async execute(name: string, input: Record<string, unknown>): Promise<string> {
    const query = typeof input.query === 'string' ? input.query : '';
    const limit = Math.min(Math.max(Number(input.limit) || 5, 1), 10);

    if (name === 'search_products') {
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: {
          store: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { ratingAvg: 'desc' },
        take: limit,
      });
      return JSON.stringify(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          currency: p.currency,
          inStock: p.stock > 0,
          store: p.store?.name ?? null,
          category: p.category?.name ?? null,
          attributes: p.attributes,
          description: p.description?.slice(0, 200) ?? null,
        })),
      );
    }

    if (name === 'search_stores') {
      const stores = await this.prisma.store.findMany({
        where: {
          isActive: true,
          ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
        },
        take: limit,
      });
      return JSON.stringify(
        stores.map((s) => ({ id: s.id, name: s.name, description: s.description ?? null })),
      );
    }

    return `Unknown tool: ${name}`;
  }
}
