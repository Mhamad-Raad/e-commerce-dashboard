import { Injectable, NotFoundException } from '@nestjs/common';
import { Lang, pick } from '../common/i18n';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

// Admin list view: all languages, no (large) body.
const ADMIN_LIST_SELECT = {
  id: true,
  titleEn: true,
  titleAr: true,
  titleCkb: true,
  excerptEn: true,
  excerptAr: true,
  excerptCkb: true,
  coverImage: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
} as const;

// Public summary fields (all languages selected so we can resolve one).
const PUBLIC_SUMMARY_SELECT = {
  id: true,
  titleEn: true,
  titleAr: true,
  titleCkb: true,
  excerptEn: true,
  excerptAr: true,
  excerptCkb: true,
  coverImage: true,
  publishedAt: true,
} as const;

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ── Public (resolved to one language) ───────────────────────────────────────
  async listPublished(lang: Lang) {
    const posts = await this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: PUBLIC_SUMMARY_SELECT,
    });
    return posts.map((p) => ({
      id: p.id,
      title: pick(lang, p.titleEn, p.titleAr, p.titleCkb),
      excerpt: pick(lang, p.excerptEn, p.excerptAr, p.excerptCkb),
      coverImage: p.coverImage,
      publishedAt: p.publishedAt,
    }));
  }

  async getPublished(id: string, lang: Lang) {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, isPublished: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return {
      id: post.id,
      title: pick(lang, post.titleEn, post.titleAr, post.titleCkb),
      excerpt: pick(lang, post.excerptEn, post.excerptAr, post.excerptCkb),
      body: pick(lang, post.bodyEn, post.bodyAr, post.bodyCkb),
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
    };
  }

  // ── Admin (all languages) ───────────────────────────────────────────────────
  listAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: ADMIN_LIST_SELECT,
    });
  }

  async getOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  create(dto: CreateBlogDto) {
    return this.prisma.blogPost.create({
      data: { ...dto, publishedAt: dto.isPublished ? new Date() : null },
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const existing = await this.getOne(id);
    let publishedAt = existing.publishedAt;
    if (dto.isPublished === true) publishedAt = existing.publishedAt ?? new Date();
    if (dto.isPublished === false) publishedAt = null;

    return this.prisma.blogPost.update({
      where: { id },
      data: { ...dto, publishedAt },
    });
  }

  async remove(id: string) {
    await this.getOne(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }
}
