import { Articles } from "@marcopestrin/blog-core";
import { getTenant } from "../lib/tenant";

export default async function sitemap() {
  const tenant = await getTenant();
  const { items } = await Articles.listArticles({ tenantId: tenant.id, status: ["published"], page: 1, pageSize: 1000 });
  const base = process.env.SITE_URL || "http://localhost:3000";
  return items.map((a:any) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.updatedAt,
  }));
}
