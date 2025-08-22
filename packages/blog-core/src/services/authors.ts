import { prisma } from "../db";

export type CreateAuthorInput = {
  tenantId: string;
  name: string;
  bio?: string | null;
  profileUrl?: string | null;
  avatarId?: string | null;
};

export type UpdateAuthorInput = Partial<CreateAuthorInput> & { id: string; tenantId: string };

export async function listAuthors(tenantId: string) {
  return prisma.author.findMany({ 
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAuthorById(tenantId: string, id: string) {
  return prisma.author.findFirst({
    where: { id, tenantId } 
  });
}

export async function createAuthor(input: CreateAuthorInput) {
  const { tenantId, name, bio, profileUrl, avatarId } = input;
  return prisma.author.create({
    data: { 
      tenantId,
      name,
      bio: bio ?? null,
      profileUrl: profileUrl ?? null,
      avatarId: avatarId ?? null
    },
  });
}

export async function updateAuthor(input: UpdateAuthorInput) {
  const { id, tenantId, ...rest } = input;
  return prisma.author.update({
    where: { id },
    data: { ...rest }
  });
}
