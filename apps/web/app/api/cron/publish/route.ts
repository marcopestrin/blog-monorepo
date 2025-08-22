import { NextResponse } from "next/server";
import { Articles } from "@marcopestrin/blog-core";
import { getTenant } from "../../../../lib/tenant";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (token !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const tenant = await getTenant();
  const { count, ids } = await Articles.publishScheduled(tenant.id);
  revalidatePath("/blog");
  return NextResponse.json({ count, ids });
}
