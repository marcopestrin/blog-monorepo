import { Articles } from "@marcopestrin/blog-core";
import { getTenant } from "../../lib/tenant";
import ArticleList from "../../components/ArticleList";

export const dynamic = "force-dynamic";

export default async function BlogIndex({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const tenant = await getTenant();
  const page = Number(searchParams?.page ?? 1);
  const tag = typeof searchParams?.tag === "string" ? searchParams?.tag : undefined;
  const q = typeof searchParams?.q === "string" ? searchParams?.q : undefined;

  const { items, total, pages } = await Articles.listArticles({
    tenantId: tenant.id,
    status: ["published"],
    page, pageSize: 10,
    tagSlug: tag,
    search: q,
  });

  return (
    <div>
      <h1>Blog</h1>
      <form style={{margin:'16px 0'}}>
        <input name="q" placeholder="Cerca..." defaultValue={q} />
        <button type="submit">Cerca</button>
      </form>

      <ArticleList items={items as any} />

      <div style={{marginTop: 16}}>
        {Array.from({ length: pages }).map((_, i) => {
          const n = i+1;
          const url = `/blog?page=${n}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return <a key={n} href={url} style={{marginRight: 8, fontWeight: n===page ? 'bold':'normal'}}>{n}</a>;
        })}
      </div>
    </div>
  );
}
