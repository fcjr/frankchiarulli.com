"use client";

import { useEffect, useRef } from "react";
import { domToInlineMdx, inlineMdxToHtml, escapeAttr } from "./mdxBlocks";

export interface RichTextHandle {
  wrapBold: () => void;
  wrapItalic: () => void;
  wrapCode: () => void;
  insertLink: (text: string, href: string, asCode?: boolean) => void;
  insertTerm: (label: string, tip: string, existingEl?: HTMLElement | null) => void;
  removeTerm: (existingEl: HTMLElement) => void;
  getSelectionText: () => string;
  saveSelection: () => void;
  focus: () => void;
}

interface RichTextProps {
  value: string;
  onChange: (nextMdx: string) => void;
  onFocusHandle?: (handle: RichTextHandle) => void;
  onEditTerm?: (info: { el: HTMLElement; label: string; tip: string; handle: RichTextHandle }) => void;
  onRequestModal?: (kind: "link" | "lcsc" | "term") => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  placeholder?: string;
  className?: string;
  singleLine?: boolean;
  tag?: "div" | "p" | "span";
}

export function RichText({
  value,
  onChange,
  onFocusHandle,
  onEditTerm,
  onRequestModal,
  onEnter,
  onBackspaceEmpty,
  placeholder,
  className = "",
  singleLine = false,
  tag = "div",
}: RichTextProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const lastEmittedRef = useRef<string | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync external value -> DOM only when it actually differs from what we emitted
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (lastEmittedRef.current === value) return;
    el.innerHTML = inlineMdxToHtml(value);
    lastEmittedRef.current = value;
  }, [value]);

  const emitChange = () => {
    const el = elRef.current;
    if (!el) return;
    const next = domToInlineMdx(el);
    lastEmittedRef.current = next;
    onChange(next);
  };

  const restoreRange = (): Range | null => {
    const el = elRef.current;
    if (!el) return null;
    const sel = window.getSelection();
    if (!sel) return null;

    if (savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return savedRangeRef.current;
    }

    if (sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      return sel.getRangeAt(0);
    }

    // Fallback: caret at end of element
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  };

  const toggleInlineTag = (tagName: "STRONG" | "EM" | "CODE") => {
    const el = elRef.current;
    if (!el) return;
    el.focus();
    const range = restoreRange();
    if (!range) return;

    // Check if selection is already inside tagName -> unwrap
    let ancestor: Node | null = range.commonAncestorContainer;
    while (ancestor && ancestor !== el) {
      if (ancestor.nodeType === Node.ELEMENT_NODE && (ancestor as HTMLElement).tagName === tagName) {
        const parent = ancestor.parentNode;
        if (parent) {
          const textNode = document.createTextNode(ancestor.textContent ?? "");
          parent.replaceChild(textNode, ancestor);
          const sel = window.getSelection();
          if (sel) {
            const newRange = document.createRange();
            newRange.selectNodeContents(textNode);
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          emitChange();
          return;
        }
      }
      ancestor = ancestor.parentNode;
    }

    const selectedText = range.toString();
    const wrapper = document.createElement(tagName.toLowerCase());
    wrapper.textContent = selectedText || (tagName === "CODE" ? "code" : "text");
    range.deleteContents();
    range.insertNode(wrapper);

    // Move caret right after wrapped node
    const sel = window.getSelection();
    if (sel) {
      const after = document.createRange();
      after.setStartAfter(wrapper);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }
    savedRangeRef.current = null;
    emitChange();
  };

  const handleRef = useRef<RichTextHandle>({
    wrapBold: () => toggleInlineTag("STRONG"),
    wrapItalic: () => toggleInlineTag("EM"),
    wrapCode: () => toggleInlineTag("CODE"),
    insertLink: (text: string, href: string, asCode = false) => {
      const el = elRef.current;
      if (!el) return;
      el.focus();
      const range = restoreRange();
      if (!range) return;

      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.className = "wysiwyg-link";
      if (asCode) {
        const code = document.createElement("code");
        code.textContent = text;
        a.appendChild(code);
      } else {
        a.textContent = text;
      }

      range.deleteContents();
      range.insertNode(a);

      // Insert a trailing space if right at end so typing continues outside the link
      const sel = window.getSelection();
      if (sel) {
        const after = document.createRange();
        after.setStartAfter(a);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
      }
      savedRangeRef.current = null;
      emitChange();
    },
    insertTerm: (label: string, tip: string, existingEl?: HTMLElement | null) => {
      const el = elRef.current;
      if (!el) return;

      if (existingEl && el.contains(existingEl)) {
        existingEl.setAttribute("data-tip", tip);
        const lbl = existingEl.querySelector(".glossary-label");
        if (lbl) lbl.textContent = label;
        else existingEl.textContent = label;
        emitChange();
        return;
      }

      el.focus();
      const range = restoreRange();
      if (!range) return;

      const span = document.createElement("span");
      span.className = "wysiwyg-term";
      span.setAttribute("data-tip", tip);
      span.setAttribute("contenteditable", "false");
      span.innerHTML = `<span class="glossary-label">${escapeAttr(label)}</span>`;

      range.deleteContents();
      range.insertNode(span);

      const sel = window.getSelection();
      if (sel) {
        const after = document.createRange();
        after.setStartAfter(span);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
      }
      savedRangeRef.current = null;
      emitChange();
    },
    removeTerm: (existingEl: HTMLElement) => {
      const el = elRef.current;
      if (!el || !el.contains(existingEl)) return;
      const textNode = document.createTextNode(existingEl.textContent ?? "");
      existingEl.parentNode?.replaceChild(textNode, existingEl);
      emitChange();
    },
    getSelectionText: () => {
      const el = elRef.current;
      if (!el) return "";
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        return sel.toString();
      }
      if (savedRangeRef.current) {
        return savedRangeRef.current.toString();
      }
      return "";
    },
    saveSelection: () => {
      const el = elRef.current;
      const sel = window.getSelection();
      if (el && sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    },
    focus: () => elRef.current?.focus(),
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      handleRef.current.wrapBold();
      return;
    }
    if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      handleRef.current.wrapItalic();
      return;
    }
    if (mod && e.key === "`") {
      e.preventDefault();
      handleRef.current.wrapCode();
      return;
    }
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      handleRef.current.saveSelection();
      onFocusHandle?.(handleRef.current);
      onRequestModal?.("link");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && (singleLine || onEnter)) {
      e.preventDefault();
      onEnter?.();
      return;
    }
    if (e.key === "Backspace" && onBackspaceEmpty) {
      const text = (elRef.current?.textContent ?? "").trim();
      if (text === "") {
        e.preventDefault();
        onBackspaceEmpty();
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const termEl = target.closest(".wysiwyg-term") as HTMLElement | null;
    if (termEl && onEditTerm) {
      e.preventDefault();
      e.stopPropagation();
      onFocusHandle?.(handleRef.current);
      onEditTerm({
        el: termEl,
        label: (termEl.textContent ?? "").trim(),
        tip: termEl.getAttribute("data-tip") ?? "",
        handle: handleRef.current,
      });
      return;
    }
    const linkEl = target.closest("a") as HTMLAnchorElement | null;
    if (linkEl) {
      if (e.metaKey || e.ctrlKey) {
        window.open(linkEl.href, "_blank", "noopener,noreferrer");
      } else {
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plain);
    emitChange();
  };

  const Tag = tag as any;

  return (
    <Tag
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      className={`wysiwyg-richtext ${className}`}
      onInput={emitChange}
      onFocus={() => onFocusHandle?.(handleRef.current)}
      onMouseUp={() => handleRef.current.saveSelection()}
      onKeyUp={() => handleRef.current.saveSelection()}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPaste={handlePaste}
    />
  );
}
