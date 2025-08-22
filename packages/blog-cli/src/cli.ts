#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Tenants, prisma, Articles } from "@marcopestrin/blog-core";
import fs from "fs";

yargs(hideBin(process.argv))
  .command("create-tenant", "Create a Tenant", (y) => y
    .option("name", { type: "string", demandOption: true })
    .option("slug", { type: "string", demandOption: true })
  , async (args) => {
    const t = await Tenants.createTenant(String(args.name), String(args.slug));
    console.log("Tenant created:", t);
    process.exit(0);
  })
  .command("export", "Export content of a tenant", (y) => y
    .option("tenant", { type: "string", demandOption: true })
    .option("out", { type: "string", default: "export.json" })
  , async (args) => {
    const tenant = await prisma.tenant.findFirst({ where: { slug: String(args.tenant) } });
    if (!tenant) throw new Error("Tenant not found");
    const articles = await prisma.article.findMany({
      where: { tenantId: tenant.id },
      include: { tags: { include: { tag: true } } }
    });
    const payload = { tenant, articles };
    fs.writeFileSync(String(args.out), JSON.stringify(payload, null, 2));
    console.log("Exported in", args.out);
    process.exit(0);
  })
  .command("import", "Import content of a Tenant", (y) => y
    .option("tenant", { type: "string", demandOption: true })
    .option("in", { type: "string", demandOption: true })
  , async (args) => {
    const tenant = await prisma.tenant.findFirst({ where: { slug: String(args.tenant) } });
    if (!tenant) throw new Error("Tenant not found");
    const json = JSON.parse(fs.readFileSync(String(args.in), "utf-8"));
    for (const a of json.articles || []) {
      await Articles.createArticle({
        tenantId: tenant.id,
        title: a.title,
        slug: a.slug,
        content: a.content,
        excerpt: a.excerpt ?? undefined,
        seoTitle: a.seoTitle ?? undefined,
        seoDescription: a.seoDescription ?? undefined,
        canonicalUrl: a.canonicalUrl ?? undefined,
        status: a.status,
        publishedAt: a.publishedAt,
        tags: (a.tags || []).map((t:any) => t.tag.slug),
      });
    }
    console.log("Import completed");
    process.exit(0);
  })
  .demandCommand()
  .help()
  .parse();
