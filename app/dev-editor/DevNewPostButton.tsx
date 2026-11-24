"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./dev-editor.css";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DevNewPostButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [spoiler, setSpoiler] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) {
      setError("Enter a title or slug.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/dev-editor/post/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: finalSlug,
          title: title.trim() || finalSlug,
          spoiler: spoiler.trim(),
          date: new Date().toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create post");
        return;
      }
      setOpen(false);
      router.push(data.url || `/blog/${finalSlug}/?edit=1`);
    } catch (err: any) {
      setError(err?.message || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="dev-btn dev-btn-primary"
        onClick={() => setOpen(true)}
      >
        + New Post
      </button>

      {open && (
        <div
          className="dev-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form onSubmit={handleSubmit} className="dev-modal">
            <h3 className="dev-modal-title">New Blog Post</h3>
            <div className="dev-modal-field">
              <label className="dev-label">Title</label>
              <input
                autoFocus
                className="dev-input"
                value={title}
                placeholder="e.g. Reverse Engineering a USB-C Dock"
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="dev-modal-field">
              <label className="dev-label">Slug (/public/&lt;slug&gt;/index.md)</label>
              <input
                className="dev-input"
                value={slug}
                placeholder="reverse-engineering-usb-c-dock"
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
              />
            </div>
            <div className="dev-modal-field">
              <label className="dev-label">Spoiler / Tagline (optional)</label>
              <input
                className="dev-input"
                value={spoiler}
                placeholder="Short one-line pitch..."
                onChange={(e) => setSpoiler(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-xs mb-2" style={{ color: "var(--accent)" }}>
                {error}
              </p>
            )}
            <div className="dev-modal-actions">
              <button type="button" className="dev-btn" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="dev-btn dev-btn-accent" disabled={creating}>
                {creating ? "Creating..." : "Create & Edit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
