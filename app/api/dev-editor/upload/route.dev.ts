import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available outside development" }, { status: 404 });
  }

  try {
    const form = await req.formData();
    const slug = String(form.get("slug") ?? "");
    const file = form.get("file");

    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    const origName = file.name || "image.png";
    const ext = path.extname(origName).toLowerCase() || ".png";
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: `Unsupported image type: ${ext}` }, { status: 400 });
    }

    const base = path
      .basename(origName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
    const filename = `${base}${ext}`;

    const publicRoot = path.resolve(process.cwd(), "public");
    const dir = path.resolve(publicRoot, slug);
    if (!dir.startsWith(publicRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buf);

    return NextResponse.json({
      ok: true,
      filename,
      path: `/${slug}/${filename}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
