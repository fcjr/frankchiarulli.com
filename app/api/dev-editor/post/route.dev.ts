import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir, access } from "fs/promises";
import path from "path";
import matter from "gray-matter";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

function devGuard() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available outside development" }, { status: 404 });
  }
  return null;
}

function resolvePostDir(slug: string) {
  if (!slug || !SLUG_RE.test(slug)) return null;
  const publicRoot = path.resolve(process.cwd(), "public");
  const dir = path.resolve(publicRoot, slug);
  if (!dir.startsWith(publicRoot + path.sep)) return null;
  return dir;
}

function serializeFrontmatter(fm: Record<string, string | undefined>): string {
  const quote = (v: string) => JSON.stringify(v);
  const lines = ["---"];
  lines.push(`title: ${quote(fm.title ?? "")}`);
  lines.push(`date: '${(fm.date ?? new Date().toISOString().slice(0, 10)).replace(/'/g, "")}'`);
  lines.push(`spoiler: ${quote(fm.spoiler ?? "")}`);
  if (fm.youtube?.trim()) lines.push(`youtube: ${quote(fm.youtube.trim())}`);
  if (fm.bluesky?.trim()) lines.push(`bluesky: ${quote(fm.bluesky.trim())}`);
  lines.push("---");
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const blocked = devGuard();
  if (blocked) return blocked;

  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const dir = resolvePostDir(slug);
  if (!dir) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const filePath = path.join(dir, "index.md");
    const raw = await readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const entries = await readdir(dir);
    const images = entries.filter((f) => IMAGE_RE.test(f)).sort();

    return NextResponse.json({
      slug,
      frontmatter: {
        title: String(data.title ?? ""),
        date: String(data.date ?? ""),
        spoiler: String(data.spoiler ?? ""),
        youtube: data.youtube ? String(data.youtube) : "",
        bluesky: data.bluesky ? String(data.bluesky) : "",
      },
      content: content.replace(/^\n+/, ""),
      raw,
      images: images.map((name) => `/${slug}/${name}`),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to read post" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  const blocked = devGuard();
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const slug = String(body.slug ?? "");
    const dir = resolvePostDir(slug);
    if (!dir) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    let output: string;
    if (typeof body.raw === "string") {
      output = body.raw.endsWith("\n") ? body.raw : body.raw + "\n";
    } else {
      const fm = serializeFrontmatter(body.frontmatter ?? {});
      const content = String(body.content ?? "").replace(/^\n+/, "").replace(/\n*$/, "\n");
      output = `${fm}\n\n${content}`;
    }

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.md"), output, "utf8");

    return NextResponse.json({ ok: true, slug, savedAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to save post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const blocked = devGuard();
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const dir = resolvePostDir(slug);
    if (!dir) {
      return NextResponse.json(
        { error: "Slug must start with a letter/number and contain only lowercase letters, numbers, and hyphens." },
        { status: 400 },
      );
    }

    const filePath = path.join(dir, "index.md");
    try {
      await access(filePath);
      return NextResponse.json({ error: `Post "${slug}" already exists.` }, { status: 409 });
    } catch {
      // Does not exist yet
    }

    const title = String(body.title ?? slug).trim() || slug;
    const spoiler = String(body.spoiler ?? "").trim();
    const date = String(body.date ?? new Date().toISOString().slice(0, 10)).trim();

    const fm = serializeFrontmatter({ title, date, spoiler });
    const starter = `${fm}\n\nStart writing here.\n`;

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, starter, "utf8");

    return NextResponse.json({ ok: true, slug, url: `/blog/${slug}/?edit=1` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create post" }, { status: 500 });
  }
}
