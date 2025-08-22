import { getTenant } from "../lib/tenant";
import { getCurrentUser } from "../lib/auth";


export default async function TenantBadge() {
  const tenant = await getTenant();


  const { roles } = await getCurrentUser(tenant.id);

  return (
    <span style={{marginLeft: 12, fontSize: 12, opacity: .8}}>
      Tenant: <strong>{tenant.name}</strong> (<code>{tenant.slug}</code>) — Ruoli: {roles.join(", ")}
    </span>
  );
}
