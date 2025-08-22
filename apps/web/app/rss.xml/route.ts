import { NextResponse } from "next/server";
import { Articles } from "@marcopestrin/blog-core";
import { getTenant } from "../../lib/tenant";

export async function GET() {
  const tenant = await getTenant();
  const { items } = await Articles.listArticles({ tenantId: tenant.id, status: ["published"], page: 1, pageSize: 50 });
  const base = process.env.SITE_URL || "http://localhost:3000";

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${tenant.name} - Blog</title>
    <link>${base}/blog</link>
    <description>Feed del blog</description>
    ${items.map((i:any) => `
      <item>
        <title><![CDATA[${i.title}]]></title>
        <link>${base}/blog/${i.slug}</link>
        <guid>${i.id}</guid>
        ${i.publishedAt ? `<pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>` : ""}
        ${i.excerpt ? `<description><![CDATA[${i.excerpt}]]></description>` : ""}
      </item>
    `).join("")}
  </channel>
</rss>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml" } });
}
