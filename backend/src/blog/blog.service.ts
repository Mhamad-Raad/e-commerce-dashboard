import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

// List view omits the (potentially large) body fields.
const LIST_SELECT = {
  id: true,
  titleEn: true,
  titleAr: true,
  excerptEn: true,
  excerptAr: true,
  coverImage: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
} as const;

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ── Public ──────────────────────────────────────────────────────────────────
  listPublished() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: LIST_SELECT,
    });
  }

  async getPublished(id: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, isPublished: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ── Admin ───────────────────────────────────────────────────────────────────
  listAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: LIST_SELECT,
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
    // Stamp publishedAt the first time it goes live; clear it if unpublished.
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
