import { Articles } from "@marcopestrin/blog-core";
import { getTenant } from "../../../lib/tenant";
import { notFound } from "next/navigation";
import ArticleView from "../../../components/ArticleView";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const tenant = await getTenant();
  const article = await Articles.getArticleBySlug(tenant.id, params.slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    alternates: { canonical: article.canonicalUrl || undefined },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const tenantInfo = await getTenant();
  const article = await Articles.getArticleBySlug(tenantInfo.id, params.slug);
  if (!article || article.status !== "published") notFound();

  return (
    <>
      <p className="card">Tenant corrente: <strong>{tenantInfo.name}</strong> (<code>{tenantInfo.slug}</code>)</p>
      <ArticleView
        title={article.title}
        date={article.publishedAt as any}
        html={article.content}
        coverUrl={article.coverMedia?.path || undefined}
      />
    </>
  );
}
