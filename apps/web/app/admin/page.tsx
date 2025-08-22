import Link from "next/link";
import NextDynamic from "next/dynamic";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Articles, prisma } from "@marcopestrin/blog-core";
import { can } from "@marcopestrin/blog-core/auth/permissions";
export const dynamic = "force-dynamic"; 
import { getTenant } from "../../lib/tenant";
import { getCurrentUser } from "../../lib/auth";

// Editor WYSIWYG lato client
const RichEditor = NextDynamic(() => import("../../components/RichEditor"), { ssr: false });

async function create(formData: FormData) {
  "use server";
  const tenant = await getTenant();

  const { roles } = await getCurrentUser(tenant.id);
  if (!can(roles, "article:create")) throw new Error("Forbidden");

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const content = String(formData.get("content_html") || "");
  const status = String(formData.get("status") || "draft") as
    | "draft"
    | "scheduled"
    | "published";
  const publishedAt = formData.get("publishedAt")
    ? new Date(String(formData.get("publishedAt")))
    : null;
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const authorId = (String(formData.get("authorId") || "") || undefined) as string | undefined;

  await Articles.createArticle({
    tenantId: tenant.id,
    title,
    slug,
    content,
    status,
    publishedAt,
    tags,
    authorId,
  });

  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin");
}

export default async function AdminPage() {
  const tenant = await getTenant();

  const { items } = await Articles.listArticles({
    tenantId: tenant.id,
    status: ["draft", "scheduled", "published", "archived"],
    page: 1,
    pageSize: 50,
  });

  const authors = await prisma.author.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });

  type AdminArticle = {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "scheduled" | "published" | "archived";
    publishedAt?: string | Date | null;
  };

  const list = items as AdminArticle[];

  const { roles } = await getCurrentUser(tenant.id);
  const canPublish = can(roles, "article:publish");

  return (
    <div>

      <h1>Admin</h1>

      <details open>
        <summary>Crea Articolo</summary>
        <form action={create} className="grid" style={{ marginTop: 12 }}>
          <input name="title" placeholder="Titolo" required />
          <input name="slug" placeholder="slug-esempio" required />

          <label>Autore</label>
            <select name="authorId" defaultValue="">
              <option value="">(nessuno)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

          <label>Contenuto</label>
          <RichEditor name="content_html" />

          <input name="tags" placeholder="tag1, tag2" />

          <label>
            Stato:
            <select name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="scheduled">scheduled</option>
              {canPublish && <option value="published">published</option>}
            </select>
          </label>

          <label>
            Data pubblicazione:
            <input type="datetime-local" name="publishedAt" />
          </label>

          <button type="submit">Salva</button>
        </form>
      </details>

      <details>
        <summary>Upload Media (S3)</summary>
        <form
          action="/api/admin/upload"
          method="post"
          encType="multipart/form-data"
          className="grid"
          style={{ marginTop: 12 }}
        >
          <input type="file" name="file" required />
          <input name="alt" placeholder="Alt text" />
          <button type="submit">Carica</button>
        </form>
      </details>

      <h2 style={{ marginTop: 24 }}>Articoli</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {list.map((a) => (
          <li key={a.id} className="card">
            <strong>{a.title}</strong> — <code>{a.status}</code>{" "}
            {a.publishedAt
              ? `(${new Date(a.publishedAt).toLocaleString("it-IT")})`
              : ""}{" "}
            <Link href={`/blog/${a.slug}`}>Apri</Link> {" | "}
            <Link href={`/admin/articles/${a.id}`}>Modifica</Link>

          </li>
        ))}
      </ul>
    </div>
  );
}
