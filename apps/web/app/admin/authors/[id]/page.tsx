import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Authors } from "@marcopestrin/blog-core";
import { getTenant } from "../../../../lib/tenant";

async function updateAuthorAction(formData: FormData) {
  "use server";
  const tenant = await getTenant();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const profileUrl = String(formData.get("profileUrl") || "") || null;
  const bio = String(formData.get("bio") || "") || null;

  if (!id || !name) return;
  await Authors.updateAuthor({ 
    tenantId: tenant.id,
    id,
    name,
    profileUrl,
    bio
  });
  revalidatePath("/admin/authors/new");
  redirect("/admin/authors/new");
}

export default async function EditAuthorPage({ params }: { params: { id: string } }) {
  const tenant = await getTenant();
  const author = await Authors.getAuthorById(tenant.id, params.id);
  if (!author) notFound();

  return (
    <div>
      <h1>Modifica Autore</h1>
      <form action={updateAuthorAction} className="grid" style={{marginTop:12}}>
        <input type="hidden" name="id" value={author.id} />

        <label>Nome</label>
        <input name="name" defaultValue={author.name} required />

        <label>URL profilo</label>
        <input name="profileUrl" defaultValue={author.profileUrl || ""} />

        <label>Bio</label>
        <textarea name="bio" rows={5} defaultValue={author.bio || ""} />

        <button type="submit">Modifica</button>
      </form>
    </div>
  );
}
