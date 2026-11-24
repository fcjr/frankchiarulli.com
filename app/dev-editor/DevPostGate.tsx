"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "../Link";
import { WysiwygEditor, type Frontmatter } from "./WysiwygEditor";
import "./dev-editor.css";

interface DevPostGateProps {
  slug: string;
  initialFrontmatter: Frontmatter;
  initialContent: string;
  children: ReactNode;
}

export default function DevPostGate({
  slug,
  initialFrontmatter,
  initialContent,
  children,
}: DevPostGateProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  // Auto-open editor when navigated with ?edit=1 (e.g. right after "+ New Post")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1") {
      setEditing(true);
      params.delete("edit");
      const clean = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (clean ? `?${clean}` : ""),
      );
    }
  }, []);

  // Cmd/Ctrl+E toggles edit mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEditing((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (editing) {
    return (
      <>
        <div className="dev-top-bar">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-paragraph hover:text-secondary text-sm font-medium transition-colors duration-200 group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>all posts</span>
          </Link>
          <span className="dev-status">DEV EDITOR · /public/{slug}/index.md</span>
        </div>
        <WysiwygEditor
          slug={slug}
          initialFrontmatter={initialFrontmatter}
          initialContent={initialContent}
          onExit={(didSave) => {
            setEditing(false);
            if (didSave) {
              router.refresh();
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="dev-top-bar">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-paragraph hover:text-secondary text-sm font-medium transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>all posts</span>
        </Link>
        <button
          type="button"
          className="dev-btn dev-btn-primary"
          onClick={() => setEditing(true)}
          title="Open WYSIWYG editor (Cmd+E)"
        >
          Edit Post
        </button>
      </div>
      {children}
    </>
  );
}
