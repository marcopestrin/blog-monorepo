import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
import { prisma, Authors } from "@marcopestrin/blog-core";
import { getTenant } from "../../../../lib/tenant";

export default async function NewAuthorPage() {
  const tenant = await getTenant();

  const authors = await prisma.author.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  async function createAuthorAction(fd: FormData) {
    "use server";
    const tenant = await getTenant();
    const name = String(fd.get("name") || "");
    const bio = String(fd.get("bio") || "") || null;
    const profileUrl = String(fd.get("profileUrl") || "") || null;
    if (!name) return;
    await Authors.createAuthor({ 
      tenantId: tenant.id,
      name,
      bio,
      profileUrl
    });
    revalidatePath("/admin/authors/new");
    redirect("/admin/authors/new");
  }

  return (
    <div>
      <h2>Autori</h2>
      <details open>
        <summary>Crea Autore</summary>
        <form className="grid"  style={{marginTop:12}} action={createAuthorAction} >
          <input name="name" placeholder="Nome autore" required />
          <input name="profileUrl" placeholder="URL profilo (opzionale)" />
          <textarea name="bio" placeholder="Bio (opzionale)" rows={3} />
          <button type="submit">Crea Autore</button>
        </form>
      </details>

      <ul style={{listStyle:'none', padding:0}}>
        {authors.map((au: any) => (
          <li key={au.id} className="card">
            <strong>{au.name}</strong> {au.profileUrl ? <>— <a href={au.profileUrl} target="_blank">profilo</a></> : null}
            <div style={{marginTop:8}}>
              <a href={`/admin/authors/${au.id}`} className="button">Modifica</a>
              <br />

              <small>
                Creato il {new Date(au.createdAt).toLocaleString("it-IT")}
              </small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
