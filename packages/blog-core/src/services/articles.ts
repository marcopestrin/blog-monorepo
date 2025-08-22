import { prisma } from "../db";
import type { CreateArticleInput, ListParams, UpdateArticleInput } from "../types";
import { upsertTags } from "./tags";

export async function createArticle(input: CreateArticleInput) {
  const {
    tenantId,
    title,
    slug,
    content,
    locale = "it",
    excerpt,
    seoTitle,
    seoDescription,
    canonicalUrl,
    authorId,
    coverMediaId,
    status = "draft",
    publishedAt,
    tags = []
  } = input;

  const tagRecords = await upsertTags(tenantId, tags);

  const article = await prisma.article.create({
    data: {
      tenantId,
      title,
      slug,
      content,
      locale,
      excerpt,
      seoTitle,
      seoDescription,
      canonicalUrl,
      authorId,
      coverMediaId,
      status,
      publishedAt: publishedAt ? new Date(publishedAt as any) : null,
      tags: {
        create: tagRecords.map((t) => ({ tagId: t.id })),
      },
      revisions: {
        create: [{
          snapshot: { 
            title,
            slug,
            content,
            excerpt,
            seoTitle,
            seoDescription,
            canonicalUrl,
            locale,
            status
          },
        }],
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return article;
}

export async function updateArticle(input: UpdateArticleInput) {
  const { id, tenantId, tags, ...rest } = input;

  const updates: any = { ...rest };
  if (rest.publishedAt) {
    updates.publishedAt = new Date(rest.publishedAt as any);
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...updates,
      revisions: {
        create: [{ snapshot: updates }],
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  if (tags) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    const tagRecords = await upsertTags(tenantId, tags);
    await prisma.article.update({
      where: { id },
      data: {
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      },
    });
  }

  return prisma.article.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

export async function listArticles(params: ListParams) {
  const {
    tenantId,
    status,
    tagSlug,
    locale,
    search,
    page = 1,
    pageSize = 10,
  } = params;
  const where: any = { tenantId };

  if (status && status.length) where.status = { in: status };
  if (locale) where.locale = locale;
  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug, tenantId } } };
  }

  let items, total;
  if (search && search.trim().length > 0) {
    const q = search.trim().replace(/\s+/g, " & "); // simple AND
    items = await prisma.$queryRawUnsafe(`
      SELECT a.*
      FROM "Article" a
      WHERE a."tenantId" = $1
        AND (a.search_vector @@ to_tsquery('italian', $2) OR a.title ILIKE '%' || $3 || '%')
      ORDER BY a."publishedAt" DESC NULLS LAST, a."createdAt" DESC
      OFFSET $4 LIMIT $5
    `, tenantId, q, search, (page - 1) * pageSize, pageSize) as any;

    const countRows = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as c
      FROM "Article" a
      WHERE a."tenantId" = $1
        AND (a.search_vector @@ to_tsquery('italian', $2) OR a.title ILIKE '%' || $3 || '%')
    `, tenantId, q, search) as any;
    total = countRows[0]?.c ?? 0;
  } else {
    [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tags: { include: { tag: true } }, author: true, coverMedia: true },
      }),
      prisma.article.count({ where }),
    ]);
  }

  return {
    items,
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  };
}

export async function getArticleBySlug(tenantId: string, slug: string, locale?: string) {
  return prisma.article.findFirst({
    where: { tenantId, slug, ...(locale ? { locale } : {}) },
    include: { tags: { include: { tag: true } }, author: true, coverMedia: true },
  });
}

export async function getArticleById(tenantId: string, id: string) {
  return prisma.article.findFirst({
    where: { id, tenantId },
    include: { tags: { include: { tag: true } }, author: true, coverMedia: true },
  });
}

export async function publishScheduled(tenantId?: string) {
  const now = new Date();
  const where: any = {
    status: "scheduled",
    publishedAt: { lte: now },
  };
  if (tenantId) where.tenantId = tenantId;

  const toPublish = await prisma.article.findMany({ where });
  const ids = toPublish.map((a) => a.id);
  if (!ids.length) return { count: 0 };

  await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: { status: "published" },
  });
  return {
    count: ids.length,
    ids
  };
}
