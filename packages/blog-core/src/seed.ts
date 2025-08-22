import { prisma } from "./db";
import { ensureDefaultTenant } from "./services/tenants";
import { createArticle } from "./services/articles";

const demoUsers = [
  { email: "writer@local",    roles: ["writer"] },
  { email: "editor@local",    roles: ["editor"] },
  { email: "publisher@local", roles: ["publisher"] },
  { email: "admin@local",     roles: ["admin"] },
];

async function main() {
  const slug = process.env.DEFAULT_TENANT_SLUG || "demo";
  const tenant = await ensureDefaultTenant(slug, "Demo Tenant");

  await prisma.author.upsert({
    where: { id: `${tenant.id}-author` },
    update: {},
    create: {
      id: `${tenant.id}-author`,
      tenantId: tenant.id,
      name: "Redazione",
    },
  });

  const existing = await prisma.article.findFirst({
    where: {
      tenantId: tenant.id,
      slug: "benvenuto"
    }
  });

  if (!existing) {
    await createArticle({
      tenantId: tenant.id,
      title: "Welcome in this blog",
      slug: "welcome",
      content: "<p>Lorem ipsum dolor sit amet.</p>",
      status: "published",
      publishedAt: new Date(),
      tags: ["novità"],
      authorId: `${tenant.id}-author`,
      excerpt: "this is an article.",
      seoTitle: "welcome",
      seoDescription: "demo article",
    });
  }


  for (const u of demoUsers) {
    // create/retrieve user
    const user = await prisma.user.upsert({
      where: { 
        tenantId_email: { 
          tenantId: tenant.id,
          email: u.email
        }
      },
      update: {},
      create: { 
        tenantId: tenant.id,
        email: u.email,
        name: u.email.split("@")[0]
      },
    });

    // assign roles (idempotente)
    for (const r of u.roles) {
      await prisma.roleAssignment.upsert({
        where: {
          id: `${user.id}:${r}`,
        },
        update: {},
        create: { 
          id: `${user.id}:${r}`, 
          userId: user.id, 
          role: r as any 
        },
      });
    }
  }


  console.log("Seed completed for:", tenant.slug);
  
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
