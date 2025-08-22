import Link from "next/link";

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | Date | null;
  tags?: { tag: { slug: string } }[];
};

export default function ArticleList({ items }: { items: ArticleListItem[] }) {
  return (
    <ul style={{listStyle:'none', padding:0}}>
      {items.map(a => (
        <li key={a.id} className="card">
          <h3><Link href={`/blog/${a.slug}`}>{a.title}</Link></h3>
          {a.publishedAt ? <small>Pubblicato il {new Date(a.publishedAt).toLocaleDateString("it-IT")}</small> : null}
          {a.excerpt ? <p>{a.excerpt}</p> : null}
          {a.tags?.length ? <p>
            {a.tags.map(t => <Link key={t.tag.slug} href={`/blog?tag=${t.tag.slug}`}>#{t.tag.slug} </Link>)}
          </p> : null}
        </li>
      ))}
    </ul>
  );
}
