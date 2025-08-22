import { prisma } from "../db";

export async function upsertTags(tenantId: string, tagSlugs: string[]) {
  const tags = [];
  for (const slug of tagSlugs) {
    const name = slug.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const tag = await prisma.tag.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      update: {},
      create: { tenantId, slug, name },
    });
    tags.push(tag);
  }
  return tags;
}
