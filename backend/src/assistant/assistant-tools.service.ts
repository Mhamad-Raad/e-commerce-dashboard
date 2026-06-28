import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantTool } from './provider/assistant-provider.interface';

// Non-discriminative words dropped from product search so they don't match
// nearly every product's text (function words + generic shopping/skincare terms).
const SEARCH_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'are', 'was', 'has', 'have', 'had',
  'that', 'this', 'these', 'those', 'what', 'which', 'can', 'could', 'would',
  'should', 'will', 'use', 'used', 'using', 'need', 'needs', 'want', 'wants',
  'some', 'any', 'get', 'got', 'also', 'how', 'does', 'did', 'done', 'its', 'our',
  'their', 'from', 'about', 'into', 'than', 'then', 'them', 'they', 'one', 'help',
  'please', 'looking', 'recommend', 'product', 'products', 'something', 'anything',
  'good', 'best', 'buy', 'show', 'give', 'tell', 'make', 'like', 'just', 'really',
  'very', 'much', 'more', 'most', 'but', 'not', 'skin', 'face', 'daily', 'routine',
]);

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
      // Token-OR match: split the query into words and match ANY meaningful word
      // across name + description in all three languages. Far better recall than
      // a whole-phrase substring (e.g. "moisturizer for oily skin" hits a product
      // named "...Oil-Free Gel Moisturizer" via "moisturizer"/"oily"). Stopwords
      // are dropped so generic words ("for", "skin", "good") — which match almost
      // every product — don't drown out the discriminative ones.
      const tokens = query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.replace(/[^\p{L}\p{N}]+/gu, ''))
        .filter((t) => t.length >= 3 && !SEARCH_STOPWORDS.has(t))
        .slice(0, 6);
      const fieldContains = (t: string) => [
        { name: { contains: t, mode: 'insensitive' as const } },
        { nameAr: { contains: t, mode: 'insensitive' as const } },
        { nameCkb: { contains: t, mode: 'insensitive' as const } },
        { description: { contains: t, mode: 'insensitive' as const } },
        { descriptionAr: { contains: t, mode: 'insensitive' as const } },
        { descriptionCkb: { contains: t, mode: 'insensitive' as const } },
      ];
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          ...(tokens.length ? { OR: tokens.flatMap(fieldContains) } : {}),
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
          salePriceCents: p.salePriceCents,
          currency: p.currency,
          imageUrl: p.imageUrl,
          inStock: p.stock > 0,
          storeName: p.store?.name ?? null,
          category: p.category?.name ?? null,
          ratingAvg: p.ratingAvg,
          ratingCount: p.ratingCount,
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
