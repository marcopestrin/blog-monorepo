import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import Busboy from "busboy";
import { prisma } from "@marcopestrin/blog-core";

export async function POST(req: Request) {
  if (!process.env.S3_BUCKET) {
    return new NextResponse("S3 non configurato", { status: 400 });
  }
  const bb = Busboy({ headers: Object.fromEntries(req.headers) });
  const chunks: any[] = [];
  let filename = "";
  let alt = "";

  const finished = new Promise<void>((resolve, reject) => {
    bb.on("file", (_name, file, info) => {
      filename = info.filename;
      file.on("data", (d) => chunks.push(d));
      file.on("limit", () => reject(new Error("File too large")));
      file.on("end", () => {});
    });
    bb.on("field", (name, val) => {
      if (name === "alt") alt = val;
    });
    bb.on("finish", () => resolve());
    bb.on("error", reject);
  });

  const arrayBuffer = await req.arrayBuffer();
  bb.end(Buffer.from(arrayBuffer));
  await finished;

  const body = Buffer.concat(chunks);
  const ext = filename.split(".").pop() || "bin";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: process.env.S3_ACCESS_KEY_ID ? {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    } : undefined
  });

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ACL: "public-read",
  }));

  const publicBase = process.env.S3_PUBLIC_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;
  const url = `${publicBase}/${key}`;

  const tenant = await prisma.tenant.findFirst({ where: { slug: process.env.DEFAULT_TENANT_SLUG || "demo" }});
  if (!tenant) return new NextResponse("Tenant non trovato", { status: 400 });

  const media = await prisma.mediaAsset.create({
    data: {
      tenantId: tenant.id,
      path: url,
      mime: undefined,
      alt: alt || null
    }
  });

  return NextResponse.json({ ok: true, media });
}
