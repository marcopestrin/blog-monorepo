import { Tenants } from "@marcopestrin/blog-core";

export async function getTenant() {
  const slug = process.env.DEFAULT_TENANT_SLUG || "demo";
  const t = await Tenants.getTenantBySlug(slug);
  if (!t) {
    return Tenants.ensureDefaultTenant(slug, "Demo Tenant");
  }
  return t;
}
