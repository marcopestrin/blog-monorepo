import { prisma } from "@marcopestrin/blog-core";

export async function getCurrentUser(tenantId: string) {
  const email = process.env.ADMIN_BASIC_USER ? `${process.env.ADMIN_BASIC_USER}@local` : "admin@local";
  let user = await prisma.user.findFirst({ where: { tenantId, email } });
  if (!user) {
    user = await prisma.user.create({ data: {
      tenantId,
      email,
      name: "Admin"
    } });
  }

  const hasAdmin = await prisma.roleAssignment.findFirst({ where: { userId: user.id, role: "admin" } });
  if (!hasAdmin) {
    await prisma.roleAssignment.create({ data: {
      userId: user.id,
      role: "admin"
    } });
  }

  const roles = (await prisma.roleAssignment.findMany({ where: { userId: user.id } })).map(r => r.role);
  return { user, roles };
}
