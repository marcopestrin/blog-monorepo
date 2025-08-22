import { prisma } from "../db";
import { randomBytes } from "crypto";

export async function ensureDefaultTenant(slug: string, name?: string) {
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.tenant.create({
    data: {
      slug,
      name: name ?? slug,
      apiKey: randomBytes(16).toString("hex"),
    },
  });
}

export async function createTenant(name: string, slug: string) {
  return prisma.tenant.create({
    data: { 
      name,
      slug,
      apiKey: randomBytes(16).toString("hex")
    },
  });
}

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}
