"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Block,
  makeBlockId,
  parseMdxToBlocks,
  serializeBlocksToMdx,
} from "./mdxBlocks";
import { RichText, type RichTextHandle } from "./RichText";
import "./dev-editor.css";

export interface Frontmatter {
  title: string;
  date: string;
  spoiler: string;
  youtube?: string;
  bluesky?: string;
}

type EditorMode = "visual" | "split" | "source";

type ModalState =
  | null
  | { kind: "link"; text: string; url: string }
  | { kind: "lcsc"; part: string; code: string }
  | { kind: "term"; label: string; tip: string; existingEl?: HTMLElement | null }
  | { kind: "image"; blockId?: string; src: string; alt: string; caption: string };

interface WysiwygEditorProps {
  slug: string;
  initialFrontmatter: Frontmatter;
  initialContent: string;
  onExit: (didSave: boolean) => void;
}

function LiveMermaidBlock({
  code,
  caption,
  onChange,
}: {
  code: string;
  caption: string;
  onChange: (next: { code?: string; caption?: string }) => void;
}) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/dev-editor/render/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "mermaid", code }),
        });
        const data = await res.json();
        if (!active) return;
        if (res.ok && data.svg) {
          setSvg(data.svg);
          setErr("");
        } else {
          setErr(data.error || "Mermaid render error");
        }
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to render diagram");
      }
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [code]);

  return (
    <figure>
      <div className="pele-diagram">
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : err ? (
          <div className="text-xs" style={{ color: "var(--accent)" }}>
            {err}
          </div>
        ) : (
          <div className="text-xs opacity-60">Rendering Pele diagram...</div>
        )}
      </div>
      <figcaption>
        <input
          type="text"
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Optional diagram caption..."
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "inherit",
            textAlign: "center",
            font: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            outline: "none",
          }}
        />
      </figcaption>
      <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.35rem" }}>
        <button
          type="button"
          className="dev-btn dev-btn-sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Hide Mermaid Source" : "Edit Mermaid Source"}
        </button>
        {err && (
          <span className="text-xs" style={{ color: "var(--accent)" }}>
            {err}
          </span>
        )}
      </div>
      {editing && (
        <div className="dev-code-box" style={{ marginTop: "0.35rem" }}>
          <div className="dev-code-header">
            <span>MERMAID (PELE)</span>
          </div>
          <textarea
            className="dev-code-input"
            rows={Math.max(6, code.split("\n").length + 1)}
            value={code}
            onChange={(e) => onChange({ code: e.target.value })}
            spellCheck={false}
          />
        </div>
      )}
    </figure>
  );
}

function LiveMdxBlock({
  slug,
  raw,
  label,
  onChange,
}: {
  slug: string;
  raw: string;
  label: string;
  onChange: (nextRaw: string) => void;
}) {
  const [html, setHtml] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/dev-editor/render/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, content: raw }),
        });
        const data = await res.json();
        if (!active) return;
        if (res.ok && typeof data.html === "string") {
          setHtml(data.html);
          setErr("");
        } else {
          setErr(data.error || "MDX render error");
        }
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to render block");
      }
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug, raw]);

  return (
    <div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : err ? (
        <div className="explainer" style={{ borderLeftColor: "var(--accent)" }}>
          <span className="explainer-title">MDX Error</span>
          <p>{err}</p>
        </div>
      ) : (
        <div className="text-xs opacity-60 py-2">Rendering {label}...</div>
      )}
      <div style={{ marginTop: "-0.75rem", marginBottom: "0.75rem" }}>
        <button
          type="button"
          className="dev-btn dev-btn-sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? `Hide ${label} Source` : `Edit ${label} Source`}
        </button>
      </div>
      {editing && (
        <div className="dev-code-box" style={{ marginBottom: "1rem" }}>
          <div className="dev-code-header">
            <span>{label.toUpperCase()} (MDX / HTML)</span>
          </div>
          <textarea
            className="dev-code-input"
            rows={Math.min(18, Math.max(5, raw.split("\n").length + 1))}
            value={raw}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

export function WysiwygEditor({
  slug,
  initialFrontmatter,
  initialContent,
  onExit,
}: WysiwygEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [fm, setFm] = useState<Frontmatter>(initialFrontmatter);
  const [showExtraFm, setShowExtraFm] = useState<boolean>(
    Boolean(initialFrontmatter.youtube || initialFrontmatter.bluesky),
  );
  const [blocks, setBlocks] = useState<Block[]>(() => parseMdxToBlocks(initialContent));
  const [sourceText, setSourceText] = useState<string>(initialContent);
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [didSaveAny, setDidSaveAny] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("SAVED");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewErr, setPreviewErr] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [rawBlockIds, setRawBlockIds] = useState<Record<string, boolean>>({});

  const activeHandleRef = useRef<RichTextHandle | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const insertAfterIdxRef = useRef<number | null>(null);

  // Load fresh post data + existing image list from disk
  useEffect(() => {
    fetch(`/api/dev-editor/post/?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.images)) setImages(data.images);
      })
      .catch(() => {});
  }, [slug]);

  const currentMarkdown = useCallback(() => {
    return mode === "visual" ? serializeBlocksToMdx(blocks) : sourceText;
  }, [mode, blocks, sourceText]);

  const switchMode = (nextMode: EditorMode) => {
    if (nextMode === mode) return;
    if (mode === "visual") {
      setSourceText(serializeBlocksToMdx(blocks));
    } else if (nextMode === "visual") {
      setBlocks(parseMdxToBlocks(sourceText));
    }
    setMode(nextMode);
  };

  // Live full-post preview in SPLIT mode
  useEffect(() => {
    if (mode !== "split") return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/dev-editor/render/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, content: sourceText }),
        });
        const data = await res.json();
        if (!active) return;
        if (res.ok && typeof data.html === "string") {
          setPreviewHtml(data.html);
          setPreviewErr("");
        } else {
          setPreviewErr(data.error || "MDX syntax error");
        }
      } catch (e: any) {
        if (active) setPreviewErr(e?.message || "Preview failed");
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mode, slug, sourceText]);

  const savePost = useCallback(async () => {
    setSaving(true);
    setErrorMsg("");
    setStatusMsg("SAVING...");
    try {
      const content = currentMarkdown();
      const res = await fetch("/api/dev-editor/post/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, frontmatter: fm, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Save failed");
        setStatusMsg("ERROR");
        return false;
      }
      setDirty(false);
      setDidSaveAny(true);
      setStatusMsg("SAVED");
      return true;
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error");
      setStatusMsg("ERROR");
      return false;
    } finally {
      setSaving(false);
    }
  }, [currentMarkdown, fm, slug]);

  // Global Cmd/Ctrl+S shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        savePost();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [savePost]);

  const markDirty = () => {
    setDirty(true);
    setStatusMsg("UNSAVED");
  };

  const updateBlock = (id: string, updater: (b: Block) => Block) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
    markDirty();
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    markDirty();
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
    markDirty();
  };

  const insertBlock = (newBlock: Block, afterIdx?: number | null) => {
    setBlocks((prev) => {
      if (typeof afterIdx === "number" && afterIdx >= 0 && afterIdx < prev.length) {
        const copy = [...prev];
        copy.splice(afterIdx + 1, 0, newBlock);
        return copy;
      }
      return [...prev, newBlock];
    });
    markDirty();
  };

  // Source textarea insertion helper
  const insertIntoSource = (before: string, after = "", fallback = "") => {
    const ta = sourceRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = sourceText.slice(start, end) || fallback;
    const next =
      sourceText.slice(0, start) + before + selected + after + sourceText.slice(end);
    setSourceText(next);
    markDirty();
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const getSelectedText = (): string => {
    if (mode === "visual") {
      return activeHandleRef.current?.getSelectionText() ?? "";
    }
    const ta = sourceRef.current;
    if (!ta) return "";
    return sourceText.slice(ta.selectionStart, ta.selectionEnd);
  };

  const openModal = (kind: "link" | "lcsc" | "term") => {
    if (mode === "visual") {
      activeHandleRef.current?.saveSelection();
    }
    const sel = getSelectedText().trim();
    if (kind === "link") {
      setModal({ kind: "link", text: sel, url: "https://" });
    } else if (kind === "lcsc") {
      setModal({ kind: "lcsc", part: sel, code: "C" });
    } else if (kind === "term") {
      setModal({ kind: "term", label: sel, tip: "", existingEl: null });
    }
  };

  const handleToolbarFormat = (kind: "bold" | "italic" | "code") => {
    if (mode === "visual") {
      const h = activeHandleRef.current;
      if (!h) return;
      if (kind === "bold") h.wrapBold();
      if (kind === "italic") h.wrapItalic();
      if (kind === "code") h.wrapCode();
    } else {
      if (kind === "bold") insertIntoSource("**", "**", "bold");
      if (kind === "italic") insertIntoSource("*", "*", "italic");
      if (kind === "code") insertIntoSource("`", "`", "code");
    }
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("slug", slug);
      fd.append("file", file);
      const res = await fetch("/api/dev-editor/upload/", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Image upload failed");
        return null;
      }
      if (data.path) {
        setImages((prev) => (prev.includes(data.path) ? prev : [...prev, data.path]));
        return data.path;
      }
      return null;
    } catch (e: any) {
      setErrorMsg(e?.message || "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const uploadedPath = await uploadImageFile(file);
    if (!uploadedPath) return;
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    if (mode === "visual") {
      insertBlock({
        id: makeBlockId(),
        type: "figure",
        src: uploadedPath,
        alt,
        caption: alt,
      });
    } else {
      insertIntoSource(
        `\n<figure>\n  <img src="${uploadedPath}" alt="${alt}" />\n  <figcaption>${alt}</figcaption>\n</figure>\n`,
      );
    }
  };

  const addBlockOfType = (
    type:
      | "paragraph"
      | "h2"
      | "h3"
      | "list"
      | "explainer"
      | "mermaid"
      | "code"
      | "table"
      | "blockquote"
      | "image",
    afterIdx?: number | null,
  ) => {
    if (type === "image") {
      insertAfterIdxRef.current = afterIdx ?? null;
      setModal({
        kind: "image",
        src: images[0] ?? `/${slug}/`,
        alt: "",
        caption: "",
      });
      return;
    }
    const map: Record<string, Block> = {
      paragraph: { id: makeBlockId(), type: "paragraph", text: "" },
      h2: { id: makeBlockId(), type: "heading", level: 2, text: "New Section" },
      h3: { id: makeBlockId(), type: "heading", level: 3, text: "Subsection" },
      list: { id: makeBlockId(), type: "list", ordered: false, items: [""] },
      explainer: {
        id: makeBlockId(),
        type: "explainer",
        title: "Note",
        body: "Write your technical note here.",
        isSimple: true,
        raw: "",
      },
      mermaid: {
        id: makeBlockId(),
        type: "mermaid",
        code: 'flowchart LR\n  A["Host"] --> B["Device"]',
        caption: "Diagram caption",
      },
      code: { id: makeBlockId(), type: "code", lang: "bash", code: "" },
      table: {
        id: makeBlockId(),
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [["Value 1", "Value 2"]],
      },
      blockquote: { id: makeBlockId(), type: "blockquote", text: "" },
    };
    const blk = map[type];
    if (blk) insertBlock(blk, afterIdx);
  };

  const handleDone = async () => {
    if (dirty) {
      const ok = await savePost();
      if (!ok) return;
      onExit(true);
      return;
    }
    onExit(didSaveAny);
  };

  return (
    <div
      className={mode === "split" ? "dev-split-breakout" : ""}
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes("Files")) {
          e.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      {isDragging && <div className="dev-drop-banner">Drop Image to Upload to /public/{slug}/</div>}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const uploadedPath = await uploadImageFile(file);
          if (uploadedPath && modal?.kind === "image") {
            setModal({ ...modal, src: uploadedPath });
          }
        }}
      />

      {/* Sticky WYSIWYG Toolbar */}
      <div className="dev-toolbar">
        <div className="dev-toolbar-group">
          <button
            type="button"
            className={`dev-btn ${mode === "visual" ? "dev-btn-active" : ""}`}
            onClick={() => switchMode("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={`dev-btn ${mode === "split" ? "dev-btn-active" : ""}`}
            onClick={() => switchMode("split")}
          >
            Split
          </button>
          <button
            type="button"
            className={`dev-btn ${mode === "source" ? "dev-btn-active" : ""}`}
            onClick={() => switchMode("source")}
          >
            Source
          </button>

          <span className="dev-toolbar-sep" />

          <button
            type="button"
            className="dev-btn"
            title="Bold (Cmd+B)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToolbarFormat("bold")}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="dev-btn"
            title="Italic (Cmd+I)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToolbarFormat("italic")}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="dev-btn"
            title="Inline Code (Cmd+`)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToolbarFormat("code")}
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            className="dev-btn"
            title="Insert Link (Cmd+K)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openModal("link")}
          >
            Link
          </button>
          <button
            type="button"
            className="dev-btn"
            title="Insert LCSC Part Link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openModal("lcsc")}
          >
            LCSC
          </button>
          <button
            type="button"
            className="dev-btn"
            title="Insert Glossary Tooltip (<Term>)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openModal("term")}
          >
            Term
          </button>
        </div>

        <div className="dev-toolbar-group">
          <span
            className={`dev-status ${errorMsg ? "error" : dirty ? "unsaved" : ""}`}
            title={errorMsg || undefined}
          >
            {uploading ? "UPLOADING..." : statusMsg}
          </span>
          <button
            type="button"
            className={`dev-btn ${dirty ? "dev-btn-accent" : "dev-btn-primary"}`}
            disabled={saving}
            onClick={savePost}
            title="Save to disk (Cmd+S)"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="dev-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          className="explainer"
          style={{ borderLeftColor: "var(--accent)", marginBottom: "1rem" }}
        >
          <span className="explainer-title">Error</span>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Editable Frontmatter Header */}
      <div className="dev-fm">
        <textarea
          className="dev-fm-title"
          rows={Math.max(1, Math.ceil((fm.title.length || 1) / 36))}
          value={fm.title}
          placeholder="POST TITLE"
          onChange={(e) => {
            setFm((prev) => ({ ...prev, title: e.target.value }));
            markDirty();
          }}
        />
        <div className="dev-fm-row">
          <div>
            <label className="dev-label">Date</label>
            <input
              type="date"
              className="dev-input"
              value={fm.date}
              onChange={(e) => {
                setFm((prev) => ({ ...prev, date: e.target.value }));
                markDirty();
              }}
            />
          </div>
          <div>
            <label className="dev-label">Spoiler / Tagline</label>
            <input
              type="text"
              className="dev-input"
              value={fm.spoiler}
              placeholder="One-line summary shown on /blog and link previews..."
              onChange={(e) => {
                setFm((prev) => ({ ...prev, spoiler: e.target.value }));
                markDirty();
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: "0.45rem" }}>
          <button
            type="button"
            className="dev-btn dev-btn-sm"
            onClick={() => setShowExtraFm((v) => !v)}
          >
            {showExtraFm ? "Hide YouTube / Bluesky" : "+ YouTube / Bluesky Links"}
          </button>
        </div>
        {showExtraFm && (
          <div className="dev-fm-extra">
            <div>
              <label className="dev-label">YouTube URL (optional)</label>
              <input
                type="url"
                className="dev-input"
                value={fm.youtube ?? ""}
                placeholder="https://youtube.com/..."
                onChange={(e) => {
                  setFm((prev) => ({ ...prev, youtube: e.target.value }));
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dev-label">Bluesky URL (optional)</label>
              <input
                type="url"
                className="dev-input"
                value={fm.bluesky ?? ""}
                placeholder="https://bsky.app/..."
                onChange={(e) => {
                  setFm((prev) => ({ ...prev, bluesky: e.target.value }));
                  markDirty();
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODE 1: VISUAL WYSIWYG */}
      {mode === "visual" && (
        <div className="markdown">
          {blocks.map((block, idx) => {
            const isRaw = Boolean(rawBlockIds[block.id]);

            const renderBlockControls = (tag: string, extra?: React.ReactNode) => (
              <div className="dev-block-tools">
                <span className="dev-block-tag">{tag}</span>
                {extra}
                <button
                  type="button"
                  className="dev-btn dev-btn-sm"
                  title="Move up"
                  disabled={idx === 0}
                  onClick={() => moveBlock(idx, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-sm"
                  title="Move down"
                  disabled={idx === blocks.length - 1}
                  onClick={() => moveBlock(idx, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-sm"
                  title="Insert paragraph below"
                  onClick={() => addBlockOfType("paragraph", idx)}
                >
                  +P
                </button>
                {block.type === "paragraph" && (
                  <button
                    type="button"
                    className="dev-btn dev-btn-sm"
                    title="Toggle raw MDX for this block"
                    onClick={() =>
                      setRawBlockIds((prev) => ({ ...prev, [block.id]: !prev[block.id] }))
                    }
                  >
                    {isRaw ? "UI" : "MD"}
                  </button>
                )}
                <button
                  type="button"
                  className="dev-btn dev-btn-sm"
                  title="Delete block"
                  onClick={() => removeBlock(block.id)}
                >
                  ×
                </button>
              </div>
            );

            return (
              <div key={block.id} className="dev-block">
                {block.type === "heading" && (
                  <>
                    {renderBlockControls(
                      `H${block.level}`,
                      <button
                        type="button"
                        className="dev-btn dev-btn-sm"
                        title="Cycle heading level (H2 / H3 / H4)"
                        onClick={() =>
                          updateBlock(block.id, (b) =>
                            b.type === "heading"
                              ? { ...b, level: b.level === 2 ? 3 : b.level === 3 ? 4 : 2 }
                              : b,
                          )
                        }
                      >
                        H2/3/4
                      </button>,
                    )}
                    {block.level === 2 && (
                      <h2>
                        <RichText
                          value={block.text}
                          singleLine
                          placeholder="Section heading..."
                          onFocusHandle={(h) => (activeHandleRef.current = h)}
                          onRequestModal={openModal}
                          onEditTerm={({ el, label, tip, handle }) => {
                            activeHandleRef.current = handle;
                            setModal({ kind: "term", label, tip, existingEl: el });
                          }}
                          onEnter={() => addBlockOfType("paragraph", idx)}
                          onChange={(text) =>
                            updateBlock(block.id, (b) =>
                              b.type === "heading" ? { ...b, text } : b,
                            )
                          }
                        />
                      </h2>
                    )}
                    {block.level === 3 && (
                      <h3>
                        <RichText
                          value={block.text}
                          singleLine
                          placeholder="Subsection heading..."
                          onFocusHandle={(h) => (activeHandleRef.current = h)}
                          onRequestModal={openModal}
                          onEditTerm={({ el, label, tip, handle }) => {
                            activeHandleRef.current = handle;
                            setModal({ kind: "term", label, tip, existingEl: el });
                          }}
                          onEnter={() => addBlockOfType("paragraph", idx)}
                          onChange={(text) =>
                            updateBlock(block.id, (b) =>
                              b.type === "heading" ? { ...b, text } : b,
                            )
                          }
                        />
                      </h3>
                    )}
                    {block.level === 4 && (
                      <h4>
                        <RichText
                          value={block.text}
                          singleLine
                          placeholder="Sub-heading..."
                          onFocusHandle={(h) => (activeHandleRef.current = h)}
                          onRequestModal={openModal}
                          onEditTerm={({ el, label, tip, handle }) => {
                            activeHandleRef.current = handle;
                            setModal({ kind: "term", label, tip, existingEl: el });
                          }}
                          onEnter={() => addBlockOfType("paragraph", idx)}
                          onChange={(text) =>
                            updateBlock(block.id, (b) =>
                              b.type === "heading" ? { ...b, text } : b,
                            )
                          }
                        />
                      </h4>
                    )}
                  </>
                )}

                {block.type === "paragraph" && (
                  <>
                    {renderBlockControls("TEXT")}
                    {isRaw ? (
                      <div className="dev-code-box">
                        <textarea
                          className="dev-code-input"
                          rows={Math.max(3, Math.ceil(block.text.length / 80))}
                          value={block.text}
                          onChange={(e) =>
                            updateBlock(block.id, (b) =>
                              b.type === "paragraph" ? { ...b, text: e.target.value } : b,
                            )
                          }
                        />
                      </div>
                    ) : (
                      <p>
                        <RichText
                          tag="span"
                          value={block.text}
                          placeholder="Write a paragraph..."
                          onFocusHandle={(h) => (activeHandleRef.current = h)}
                          onRequestModal={openModal}
                          onEditTerm={({ el, label, tip, handle }) => {
                            activeHandleRef.current = handle;
                            setModal({ kind: "term", label, tip, existingEl: el });
                          }}
                          onEnter={() => addBlockOfType("paragraph", idx)}
                          onBackspaceEmpty={() => {
                            if (blocks.length > 1) removeBlock(block.id);
                          }}
                          onChange={(text) =>
                            updateBlock(block.id, (b) =>
                              b.type === "paragraph" ? { ...b, text } : b,
                            )
                          }
                        />
                      </p>
                    )}
                  </>
                )}

                {block.type === "list" && (
                  <>
                    {renderBlockControls(
                      block.ordered ? "OL" : "UL",
                      <button
                        type="button"
                        className="dev-btn dev-btn-sm"
                        onClick={() =>
                          updateBlock(block.id, (b) =>
                            b.type === "list" ? { ...b, ordered: !b.ordered } : b,
                          )
                        }
                      >
                        {block.ordered ? "Bullets" : "1.2.3"}
                      </button>,
                    )}
                    <div style={{ marginBottom: "1.2rem" }}>
                      {block.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="dev-list-item">
                          <span className="dev-list-marker">
                            {block.ordered ? `${itemIdx + 1}.` : "•"}
                          </span>
                          <RichText
                            value={item}
                            singleLine
                            placeholder="List item (Enter for next)..."
                            onFocusHandle={(h) => (activeHandleRef.current = h)}
                            onRequestModal={openModal}
                            onEditTerm={({ el, label, tip, handle }) => {
                              activeHandleRef.current = handle;
                              setModal({ kind: "term", label, tip, existingEl: el });
                            }}
                            onEnter={() =>
                              updateBlock(block.id, (b) => {
                                if (b.type !== "list") return b;
                                const next = [...b.items];
                                next.splice(itemIdx + 1, 0, "");
                                return { ...b, items: next };
                              })
                            }
                            onBackspaceEmpty={() =>
                              updateBlock(block.id, (b) => {
                                if (b.type !== "list" || b.items.length <= 1) return b;
                                return {
                                  ...b,
                                  items: b.items.filter((_, k) => k !== itemIdx),
                                };
                              })
                            }
                            onChange={(nextItem) =>
                              updateBlock(block.id, (b) => {
                                if (b.type !== "list") return b;
                                const next = [...b.items];
                                next[itemIdx] = nextItem;
                                return { ...b, items: next };
                              })
                            }
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="dev-btn dev-btn-sm"
                        style={{ marginTop: "0.25rem", marginLeft: "1.65rem" }}
                        onClick={() =>
                          updateBlock(block.id, (b) =>
                            b.type === "list" ? { ...b, items: [...b.items, ""] } : b,
                          )
                        }
                      >
                        + Item
                      </button>
                    </div>
                  </>
                )}

                {block.type === "blockquote" && (
                  <>
                    {renderBlockControls("QUOTE")}
                    <blockquote>
                      <p>
                        <RichText
                          tag="span"
                          value={block.text}
                          placeholder="Quote text..."
                          onFocusHandle={(h) => (activeHandleRef.current = h)}
                          onRequestModal={openModal}
                          onEditTerm={({ el, label, tip, handle }) => {
                            activeHandleRef.current = handle;
                            setModal({ kind: "term", label, tip, existingEl: el });
                          }}
                          onChange={(text) =>
                            updateBlock(block.id, (b) =>
                              b.type === "blockquote" ? { ...b, text } : b,
                            )
                          }
                        />
                      </p>
                    </blockquote>
                  </>
                )}

                {block.type === "explainer" && (
                  <>
                    {renderBlockControls("EXPLAINER")}
                    {block.isSimple ? (
                      <div className="explainer">
                        <span className="explainer-title">
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) =>
                              updateBlock(block.id, (b) =>
                                b.type === "explainer" ? { ...b, title: e.target.value } : b,
                              )
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "inherit",
                              font: "inherit",
                              letterSpacing: "inherit",
                              textTransform: "inherit",
                              outline: "none",
                              width: `${Math.max(8, block.title.length + 2)}ch`,
                            }}
                          />
                        </span>
                        <p>
                          <RichText
                            tag="span"
                            value={block.body}
                            placeholder="Explainer text..."
                            onFocusHandle={(h) => (activeHandleRef.current = h)}
                            onRequestModal={openModal}
                            onEditTerm={({ el, label, tip, handle }) => {
                              activeHandleRef.current = handle;
                              setModal({ kind: "term", label, tip, existingEl: el });
                            }}
                            onChange={(body) =>
                              updateBlock(block.id, (b) =>
                                b.type === "explainer" ? { ...b, body } : b,
                              )
                            }
                          />
                        </p>
                      </div>
                    ) : (
                      <LiveMdxBlock
                        slug={slug}
                        raw={block.raw}
                        label="Explainer"
                        onChange={(raw) =>
                          updateBlock(block.id, (b) =>
                            b.type === "explainer" ? { ...b, raw } : b,
                          )
                        }
                      />
                    )}
                  </>
                )}

                {block.type === "mermaid" && (
                  <>
                    {renderBlockControls("MERMAID")}
                    <LiveMermaidBlock
                      code={block.code}
                      caption={block.caption}
                      onChange={(patch) =>
                        updateBlock(block.id, (b) =>
                          b.type === "mermaid" ? { ...b, ...patch } : b,
                        )
                      }
                    />
                  </>
                )}

                {block.type === "figure" && (
                  <>
                    {renderBlockControls(
                      "FIGURE",
                      <button
                        type="button"
                        className="dev-btn dev-btn-sm"
                        onClick={() =>
                          setModal({
                            kind: "image",
                            blockId: block.id,
                            src: block.src,
                            alt: block.alt,
                            caption: block.caption,
                          })
                        }
                      >
                        Change Image
                      </button>,
                    )}
                    <figure>
                      <img src={block.src} alt={block.alt} />
                      <figcaption>
                        <input
                          type="text"
                          value={block.caption}
                          onChange={(e) =>
                            updateBlock(block.id, (b) =>
                              b.type === "figure" ? { ...b, caption: e.target.value } : b,
                            )
                          }
                          placeholder="Image caption..."
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            color: "inherit",
                            textAlign: "center",
                            font: "inherit",
                            letterSpacing: "inherit",
                            textTransform: "inherit",
                            outline: "none",
                          }}
                        />
                      </figcaption>
                    </figure>
                  </>
                )}

                {block.type === "code" && (
                  <>
                    {renderBlockControls("CODE")}
                    <div className="dev-code-box">
                      <div className="dev-code-header">
                        <span>CODE BLOCK</span>
                        <input
                          type="text"
                          className="dev-code-lang"
                          value={block.lang}
                          placeholder="lang (rust, yaml)"
                          onChange={(e) =>
                            updateBlock(block.id, (b) =>
                              b.type === "code" ? { ...b, lang: e.target.value } : b,
                            )
                          }
                        />
                      </div>
                      <textarea
                        className="dev-code-input"
                        rows={Math.max(4, block.code.split("\n").length + 1)}
                        value={block.code}
                        spellCheck={false}
                        onChange={(e) =>
                          updateBlock(block.id, (b) =>
                            b.type === "code" ? { ...b, code: e.target.value } : b,
                          )
                        }
                      />
                    </div>
                  </>
                )}

                {block.type === "table" && (
                  <>
                    {renderBlockControls(
                      "TABLE",
                      <>
                        <button
                          type="button"
                          className="dev-btn dev-btn-sm"
                          onClick={() =>
                            updateBlock(block.id, (b) =>
                              b.type === "table"
                                ? {
                                    ...b,
                                    rows: [...b.rows, Array(b.headers.length).fill("")],
                                  }
                                : b,
                            )
                          }
                        >
                          +Row
                        </button>
                        <button
                          type="button"
                          className="dev-btn dev-btn-sm"
                          onClick={() =>
                            updateBlock(block.id, (b) =>
                              b.type === "table"
                                ? {
                                    ...b,
                                    headers: [...b.headers, "New"],
                                    rows: b.rows.map((r) => [...r, ""]),
                                  }
                                : b,
                            )
                          }
                        >
                          +Col
                        </button>
                      </>,
                    )}
                    <table>
                      <thead>
                        <tr>
                          {block.headers.map((h, ci) => (
                            <th key={ci}>
                              <input
                                type="text"
                                className="dev-table-cell-input"
                                value={h}
                                onChange={(e) =>
                                  updateBlock(block.id, (b) => {
                                    if (b.type !== "table") return b;
                                    const headers = [...b.headers];
                                    headers[ci] = e.target.value;
                                    return { ...b, headers };
                                  })
                                }
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, ri) => (
                          <tr key={ri}>
                            {block.headers.map((_, ci) => (
                              <td key={ci}>
                                <input
                                  type="text"
                                  className="dev-table-cell-input"
                                  value={row[ci] ?? ""}
                                  onChange={(e) =>
                                    updateBlock(block.id, (b) => {
                                      if (b.type !== "table") return b;
                                      const rows = b.rows.map((r, rIdx) => {
                                        if (rIdx !== ri) return r;
                                        const nextRow = [...r];
                                        nextRow[ci] = e.target.value;
                                        return nextRow;
                                      });
                                      return { ...b, rows };
                                    })
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {block.type === "hr" && (
                  <>
                    {renderBlockControls("RULE")}
                    <hr />
                  </>
                )}

                {block.type === "mdx" && (
                  <>
                    {renderBlockControls("MDX")}
                    <LiveMdxBlock
                      slug={slug}
                      raw={block.raw}
                      label="Custom MDX"
                      onChange={(raw) =>
                        updateBlock(block.id, (b) => (b.type === "mdx" ? { ...b, raw } : b))
                      }
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Bottom Block Insert Bar */}
          <div className="dev-insert-bar">
            <span className="dev-insert-label">Add block:</span>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("paragraph")}>
              + Text
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("h2")}>
              + H2
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("h3")}>
              + H3
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("list")}>
              + List
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("explainer")}>
              + Explainer
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("image")}>
              + Image
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("mermaid")}>
              + Mermaid
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("code")}>
              + Code
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("table")}>
              + Table
            </button>
            <button type="button" className="dev-btn dev-btn-sm" onClick={() => addBlockOfType("blockquote")}>
              + Quote
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: SPLIT (MDX + LIVE SERVER PREVIEW) */}
      {mode === "split" && (
        <div className="dev-split-grid">
          <div>
            <textarea
              ref={sourceRef}
              className="dev-source-textarea"
              value={sourceText}
              spellCheck
              onChange={(e) => {
                setSourceText(e.target.value);
                markDirty();
              }}
            />
          </div>
          <div className="dev-preview-pane">
            {previewErr && (
              <div
                className="explainer"
                style={{ borderLeftColor: "var(--accent)", marginBottom: "1rem" }}
              >
                <span className="explainer-title">MDX Error</span>
                <p>{previewErr}</p>
              </div>
            )}
            <div className="markdown" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      {/* MODE 3: RAW SOURCE */}
      {mode === "source" && (
        <textarea
          ref={sourceRef}
          className="dev-source-textarea"
          value={sourceText}
          spellCheck
          onChange={(e) => {
            setSourceText(e.target.value);
            markDirty();
          }}
        />
      )}

      {/* MODALS: LINK / LCSC / TERM / IMAGE */}
      {modal && (
        <div
          className="dev-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="dev-modal">
            {modal.kind === "link" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = modal.text.trim() || modal.url.trim();
                  const url = modal.url.trim();
                  if (!url) return;
                  if (mode === "visual") {
                    activeHandleRef.current?.insertLink(text, url, false);
                  } else {
                    insertIntoSource(`[${text}](${url})`);
                  }
                  setModal(null);
                }}
              >
                <h3 className="dev-modal-title">Insert Link</h3>
                <div className="dev-modal-field">
                  <label className="dev-label">Label</label>
                  <input
                    autoFocus
                    className="dev-input"
                    value={modal.text}
                    onChange={(e) => setModal({ ...modal, text: e.target.value })}
                    placeholder="Link text"
                  />
                </div>
                <div className="dev-modal-field">
                  <label className="dev-label">URL</label>
                  <input
                    className="dev-input"
                    value={modal.url}
                    onChange={(e) => setModal({ ...modal, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="dev-modal-actions">
                  <button type="button" className="dev-btn" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="dev-btn dev-btn-primary">
                    Insert
                  </button>
                </div>
              </form>
            )}

            {modal.kind === "lcsc" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const part = modal.part.trim();
                  const code = modal.code.trim().toUpperCase();
                  if (!part || !code) return;
                  const url = `https://www.lcsc.com/product-detail/${code}.html`;
                  if (mode === "visual") {
                    activeHandleRef.current?.insertLink(part, url, true);
                  } else {
                    insertIntoSource(`[\`${part}\`](${url})`);
                  }
                  setModal(null);
                }}
              >
                <h3 className="dev-modal-title">Insert LCSC Part</h3>
                <div className="dev-modal-field">
                  <label className="dev-label">Part Name</label>
                  <input
                    autoFocus
                    className="dev-input"
                    value={modal.part}
                    onChange={(e) => setModal({ ...modal, part: e.target.value })}
                    placeholder="e.g. CH334P"
                  />
                </div>
                <div className="dev-modal-field">
                  <label className="dev-label">LCSC Part #</label>
                  <input
                    className="dev-input"
                    value={modal.code}
                    onChange={(e) => setModal({ ...modal, code: e.target.value })}
                    placeholder="e.g. C5373042"
                  />
                </div>
                <div className="dev-modal-actions">
                  <button type="button" className="dev-btn" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="dev-btn dev-btn-primary">
                    Insert Part Link
                  </button>
                </div>
              </form>
            )}

            {modal.kind === "term" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const label = modal.label.trim();
                  const tip = modal.tip.trim();
                  if (!label || !tip) return;
                  if (mode === "visual") {
                    activeHandleRef.current?.insertTerm(label, tip, modal.existingEl);
                  } else {
                    insertIntoSource(`<Term tip="${tip.replace(/"/g, "&quot;")}">${label}</Term>`);
                  }
                  setModal(null);
                }}
              >
                <h3 className="dev-modal-title">
                  {modal.existingEl ? "Edit Tooltip Term" : "Insert Tooltip Term"}
                </h3>
                <div className="dev-modal-field">
                  <label className="dev-label">Word / Acronym</label>
                  <input
                    autoFocus
                    className="dev-input"
                    value={modal.label}
                    onChange={(e) => setModal({ ...modal, label: e.target.value })}
                    placeholder="e.g. xHCI"
                  />
                </div>
                <div className="dev-modal-field">
                  <label className="dev-label">Tooltip Text</label>
                  <textarea
                    className="dev-input"
                    rows={3}
                    value={modal.tip}
                    onChange={(e) => setModal({ ...modal, tip: e.target.value })}
                    placeholder="Plain-English explanation shown on hover..."
                  />
                </div>
                <div className="dev-modal-actions">
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button type="button" className="dev-btn" onClick={() => setModal(null)}>
                      Cancel
                    </button>
                    {modal.existingEl && (
                      <button
                        type="button"
                        className="dev-btn"
                        onClick={() => {
                          if (modal.existingEl) {
                            activeHandleRef.current?.removeTerm(modal.existingEl);
                          }
                          setModal(null);
                        }}
                      >
                        Unwrap
                      </button>
                    )}
                  </div>
                  <button type="submit" className="dev-btn dev-btn-primary">
                    {modal.existingEl ? "Update" : "Insert"}
                  </button>
                </div>
              </form>
            )}

            {modal.kind === "image" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const src = modal.src.trim();
                  if (!src) return;
                  if (modal.blockId) {
                    updateBlock(modal.blockId, (b) =>
                      b.type === "figure"
                        ? { ...b, src, alt: modal.alt, caption: modal.caption }
                        : b,
                    );
                  } else {
                    insertBlock(
                      {
                        id: makeBlockId(),
                        type: "figure",
                        src,
                        alt: modal.alt,
                        caption: modal.caption,
                      },
                      insertAfterIdxRef.current,
                    );
                  }
                  setModal(null);
                }}
              >
                <h3 className="dev-modal-title">
                  {modal.blockId ? "Edit Image Figure" : "Insert Image Figure"}
                </h3>
                <div className="dev-modal-field">
                  <label className="dev-label">Upload New Image to /public/{slug}/</label>
                  <button
                    type="button"
                    className="dev-btn"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Uploading..." : "Choose Image File..."}
                  </button>
                </div>
                {images.length > 0 && (
                  <div className="dev-modal-field">
                    <label className="dev-label">Or Pick Existing Post Image</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {images.map((imgPath) => (
                        <button
                          key={imgPath}
                          type="button"
                          className={`dev-btn dev-btn-sm ${modal.src === imgPath ? "dev-btn-active" : ""}`}
                          onClick={() => setModal({ ...modal, src: imgPath })}
                        >
                          {imgPath.split("/").pop()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="dev-modal-field">
                  <label className="dev-label">Image Path / URL</label>
                  <input
                    className="dev-input"
                    value={modal.src}
                    onChange={(e) => setModal({ ...modal, src: e.target.value })}
                    placeholder={`/${slug}/photo.png`}
                  />
                </div>
                <div className="dev-modal-field">
                  <label className="dev-label">Alt Text</label>
                  <input
                    className="dev-input"
                    value={modal.alt}
                    onChange={(e) => setModal({ ...modal, alt: e.target.value })}
                    placeholder="Short image description..."
                  />
                </div>
                <div className="dev-modal-field">
                  <label className="dev-label">Caption (optional)</label>
                  <input
                    className="dev-input"
                    value={modal.caption}
                    onChange={(e) => setModal({ ...modal, caption: e.target.value })}
                    placeholder="Caption bar below image..."
                  />
                </div>
                <div className="dev-modal-actions">
                  <button type="button" className="dev-btn" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="dev-btn dev-btn-primary">
                    {modal.blockId ? "Update" : "Insert"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
