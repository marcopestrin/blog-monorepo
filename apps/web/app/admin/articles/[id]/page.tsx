import NextDynamic from "next/dynamic";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma, Articles } from "@marcopestrin/blog-core";
import { can } from "@marcopestrin/blog-core/auth/permissions";
import { getCurrentUser } from "../../../../lib/auth";
import { getTenant } from "../../../../lib/tenant";

const RichEditor = NextDynamic(() => import("../../../../components/RichEditor"), { ssr: false });

async function updateArticleAction(formData: FormData) {
  "use server";
  const tenant = await getTenant();
  const authorId = (String(formData.get("authorId") || "") || undefined) as string | undefined;
  const { roles, user } = await getCurrentUser(tenant.id);
  const isEditor = can(roles,"article:update:any");
  const isOwner  = authorId === user.id;
  if (!(isEditor || isOwner)) throw new Error("Forbidden");
  const id = String(formData.get("id") || "");
  if (!id) return;
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const content = String(formData.get("content_html") || "");
  const status = String(formData.get("status") || "draft") as "draft"|"scheduled"|"published";
  const publishedAt = formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null;
  const tags = String(formData.get("tags") || "").split(",").map(s => s.trim()).filter(Boolean);

  await Articles.updateArticle({
    tenantId: tenant.id,
    id,
    title,
    slug,
    content,
    status,
    publishedAt,
    tags,
    authorId
  });

  redirect("/admin");
  // revalidatePath("/admin");
  // revalidatePath("/blog");
  // revalidatePath(`/blog/${slug}`);
}

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const tenant = await getTenant();
  const article = await Articles.getArticleById(tenant.id, params.id);
  if (!article) notFound();

  const authors = await prisma.author.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <p className="card">Tenant corrente: <strong>{tenant.name}</strong> (<code>{tenant.slug}</code>)</p>
      <h1>Modifica Articolo</h1>
      <form action={updateArticleAction} className="grid" style={{marginTop:12}}>

        <input type="hidden" name="id" value={article.id} />

        <label>Titolo</label>
        <input name="title" defaultValue={article.title} required />

        <label>Slug</label>
        <input name="slug" defaultValue={article.slug} required />

        <label>Contenuto</label>
        <RichEditor name="content_html" defaultValue={article.content} />

        <label>Tag (separati da virgola)</label>
        <input name="tags" defaultValue={(article.tags || []).map((t:any)=>t.tag.slug).join(", ")} />
        
        <label>Autore</label>
        <select name="authorId" defaultValue={article.authorId ?? ""}>
          <option value="">(nessuno)</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <label>Stato</label>
        <select name="status" defaultValue={article.status}>
          <option value="draft">draft</option>
          <option value="scheduled">scheduled</option>
          <option value="published">published</option>
        </select>

        <label>Data pubblicazione</label>
        <input type="datetime-local" name="publishedAt" defaultValue={article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0,16) : ""} />
        
        <button type="submit">Salva modifiche</button>
      </form>
    </div>
  );
}
