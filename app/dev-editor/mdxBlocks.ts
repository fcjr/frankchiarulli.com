export type Block =
  | { id: string; type: "heading"; level: 2 | 3 | 4; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "blockquote"; text: string }
  | { id: string; type: "code"; lang: string; code: string }
  | { id: string; type: "mermaid"; code: string; caption: string }
  | { id: string; type: "figure"; src: string; alt: string; caption: string; imgStyle?: string }
  | { id: string; type: "explainer"; title: string; body: string; isSimple: boolean; raw: string }
  | { id: string; type: "table"; headers: string[]; rows: string[][] }
  | { id: string; type: "hr" }
  | { id: string; type: "mdx"; raw: string };

let idSeq = 1;
export function makeBlockId(): string {
  return `blk_${idSeq++}_${Math.random().toString(36).slice(2, 6)}`;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|") && !trimmed.includes("-")) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function hasBalancedTags(lines: string[], tagName: string): boolean {
  const text = lines.join("\n");
  const openRe = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "g");
  const closeRe = new RegExp(`</${tagName}>`, "g");
  const selfCloseRe = new RegExp(`<${tagName}(?:\\s[^>]*)?/>`, "g");
  const opens = (text.match(openRe) || []).length - (text.match(selfCloseRe) || []).length;
  const closes = (text.match(closeRe) || []).length;
  return opens > 0 && opens <= closes;
}

function parseFigureBlock(raw: string): Block {
  // Check if it wraps a mermaid fence
  const mermaidMatch = raw.match(/```mermaid\s*\n([\s\S]*?)\n```/);
  if (mermaidMatch) {
    const capMatch = raw.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
    return {
      id: makeBlockId(),
      type: "mermaid",
      code: mermaidMatch[1],
      caption: capMatch ? capMatch[1].trim() : "",
    };
  }

  // Standard <figure> with <img>
  const imgMatch = raw.match(/<img\s+([\s\S]*?)\/?>/);
  if (imgMatch && !raw.includes("<iframe") && (raw.match(/<img\b/g) || []).length === 1) {
    const attrs = imgMatch[1];
    const srcMatch = attrs.match(/src="([^"]*)"/);
    const altMatch = attrs.match(/alt="([^"]*)"/);
    const styleMatch = attrs.match(/style=\{\{([\s\S]*?)\}\}/);
    const capMatch = raw.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
    if (srcMatch) {
      return {
        id: makeBlockId(),
        type: "figure",
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : "",
        caption: capMatch ? capMatch[1].trim() : "",
        imgStyle: styleMatch ? styleMatch[1] : undefined,
      };
    }
  }

  return { id: makeBlockId(), type: "mdx", raw };
}

function parseExplainerBlock(raw: string): Block {
  const titleMatch = raw.match(/<span\s+className="explainer-title">([\s\S]*?)<\/span>/);
  const title = titleMatch ? titleMatch[1].trim() : "Note";

  // Check if simple: only one <p> inside after the title, with no nested <div> or <ul>
  const inner = raw
    .replace(/^<div\s+className="explainer">\s*/, "")
    .replace(/\s*<\/div>$/, "")
    .replace(/<span\s+className="explainer-title">[\s\S]*?<\/span>\s*/, "")
    .trim();

  const simplePMatch = inner.match(/^<p>([\s\S]*?)<\/p>$/);
  const hasComplexTags = /<(div|ul|ol|table|figure|svg)\b/i.test(inner);

  if (simplePMatch && !hasComplexTags) {
    // Convert simple HTML tags inside <p> to inline MDX for WYSIWYG editing
    const body = simpleHtmlToInlineMdx(simplePMatch[1]);
    return {
      id: makeBlockId(),
      type: "explainer",
      title,
      body,
      isSimple: true,
      raw,
    };
  }

  return {
    id: makeBlockId(),
    type: "explainer",
    title,
    body: inner,
    isSimple: false,
    raw,
  };
}

function simpleHtmlToInlineMdx(html: string): string {
  return html
    .replace(
      /<a\s+href="([^"]*)"[^>]*><code>([\s\S]*?)<\/code><\/a>/g,
      (_, href, text) => `[\`${text}\`](${href})`,
    )
    .replace(
      /<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
      (_, href, text) => `[${text}](${href})`,
    )
    .replace(/<code>([\s\S]*?)<\/code>/g, (_, text) => `\`${text}\``)
    .replace(/<strong>([\s\S]*?)<\/strong>/g, (_, text) => `**${text}**`)
    .replace(/<em>([\s\S]*?)<\/em>/g, (_, text) => `*${text}*`);
}

function inlineMdxToSimpleHtml(mdx: string): string {
  // Used when serializing a simple explainer back into <p>...</p>
  let out = mdx;
  // Preserve <Term ...>...</Term> as-is using placeholders
  const terms: string[] = [];
  out = out.replace(/<Term\s+tip="([^"]*)">([\s\S]*?)<\/Term>/g, (match) => {
    terms.push(match);
    return `\u0000TERM${terms.length - 1}\u0000`;
  });
  out = out.replace(
    /\[`([^`]+)`\]\(([^)]+)\)/g,
    (_, code, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer"><code>${code}</code></a>`,
  );
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  );
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, text) => `<strong>${text}</strong>`);
  out = out.replace(/\*([^*]+)\*/g, (_, text) => `<em>${text}</em>`);
  out = out.replace(/\u0000TERM(\d+)\u0000/g, (_, idx) => terms[Number(idx)]);
  return out;
}

export function parseMdxToBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ id: makeBlockId(), type: "hr" });
      i++;
      continue;
    }

    // Heading (H2 - H4)
    const headingMatch = line.match(/^(#{2,4})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        id: makeBlockId(),
        type: "heading",
        level: headingMatch[1].length as 2 | 3 | 4,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Fenced code block (or standalone mermaid)
    const fenceMatch = line.match(/^```(\S*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```
      if (lang === "mermaid") {
        blocks.push({
          id: makeBlockId(),
          type: "mermaid",
          code: codeLines.join("\n"),
          caption: "",
        });
      } else {
        blocks.push({
          id: makeBlockId(),
          type: "code",
          lang,
          code: codeLines.join("\n"),
        });
      }
      continue;
    }

    // JSX / HTML block starting with <figure>, <div ...>, <iframe ...>, etc.
    const tagMatch = line.trim().match(/^<([a-zA-Z][a-zA-Z0-9]*)(?:\s|>|$)/);
    if (tagMatch && tagMatch[1] !== "Term" && !/^<(strong|em|code|a|span)\b/.test(line.trim())) {
      const tagName = tagMatch[1];
      const chunk: string[] = [line];
      i++;
      // Handle single-line self-closing or closed on same line
      const singleClosed =
        new RegExp(`</${tagName}>\\s*$`).test(line.trim()) ||
        /\/>\s*$/.test(line.trim());

      if (!singleClosed) {
        let inFence = false;
        while (i < lines.length) {
          const cur = lines[i];
          if (/^```/.test(cur.trim())) inFence = !inFence;
          chunk.push(cur);
          i++;
          if (!inFence && hasBalancedTags(chunk, tagName)) {
            break;
          }
        }
      }

      const raw = chunk.join("\n");
      if (tagName === "figure") {
        blocks.push(parseFigureBlock(raw));
      } else if (tagName === "div" && raw.trimStart().startsWith('<div className="explainer">')) {
        blocks.push(parseExplainerBlock(raw));
      } else {
        blocks.push({ id: makeBlockId(), type: "mdx", raw });
      }
      continue;
    }

    // GFM Table
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line);
      i += 2; // skip header & separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ id: makeBlockId(), type: "table", headers, rows });
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith(">")) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        qLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ id: makeBlockId(), type: "blockquote", text: qLines.join("\n") });
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ id: makeBlockId(), type: "list", ordered: false, items });
      continue;
    }

    // Ordered list (1. 2. ...)
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ id: makeBlockId(), type: "list", ordered: true, items });
      continue;
    }

    // Paragraph: collect contiguous non-blank lines until another block starts
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{2,4}\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i].trim()) &&
      !/^<(figure|div|iframe|table|hr)\b/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({ id: makeBlockId(), type: "paragraph", text: pLines.join("\n") });
  }

  return blocks;
}

export function serializeBlocksToMdx(blocks: Block[]): string {
  return (
    blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            return `${"#".repeat(block.level)} ${block.text}`;
          case "paragraph":
            return block.text;
          case "list":
            return block.items
              .map((item, idx) => (block.ordered ? `${idx + 1}. ${item}` : `- ${item}`))
              .join("\n");
          case "blockquote":
            return block.text
              .split("\n")
              .map((l) => `> ${l}`)
              .join("\n");
          case "code":
            return `\`\`\`${block.lang}\n${block.code}\n\`\`\``;
          case "mermaid":
            if (block.caption.trim()) {
              return `<figure>\n\n\`\`\`mermaid\n${block.code}\n\`\`\`\n\n  <figcaption>${block.caption}</figcaption>\n</figure>`;
            }
            return `\`\`\`mermaid\n${block.code}\n\`\`\``;
          case "figure": {
            const stylePart = block.imgStyle ? ` style={{${block.imgStyle}}}` : "";
            const imgTag = `  <img src="${block.src}" alt="${escapeAttr(block.alt)}"${stylePart} />`;
            const capTag = block.caption.trim()
              ? `\n  <figcaption>${block.caption}</figcaption>`
              : "";
            return `<figure>\n${imgTag}${capTag}\n</figure>`;
          }
          case "explainer":
            if (block.isSimple) {
              const innerHtml = inlineMdxToSimpleHtml(block.body);
              return `<div className="explainer">\n  <span className="explainer-title">${block.title}</span>\n  <p>${innerHtml}</p>\n</div>`;
            }
            return block.raw;
          case "table": {
            const colCount = Math.max(
              block.headers.length,
              ...block.rows.map((r) => r.length),
            );
            const padRow = (cells: string[]) => {
              const out = [...cells];
              while (out.length < colCount) out.push("");
              return `| ${out.map((c) => c.replace(/\|/g, "\\|")).join(" | ")} |`;
            };
            const sep = `| ${Array(colCount).fill("---").join(" | ")} |`;
            return [padRow(block.headers), sep, ...block.rows.map(padRow)].join("\n");
          }
          case "hr":
            return "---";
          case "mdx":
            return block.raw;
        }
      })
      .join("\n\n") + "\n"
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert inline Markdown/MDX into editable rich-text HTML.
 * Supports: <Term tip="...">, [`code`](url), [text](url), `code`, **bold**, *italic*.
 */
export function inlineMdxToHtml(mdx: string): string {
  const tokens: string[] = [];
  const stash = (html: string) => {
    tokens.push(html);
    return `\u0000TOK${tokens.length - 1}\u0000`;
  };

  let s = mdx;

  // 1. <Term tip="...">label</Term>
  s = s.replace(/<Term\s+tip="([^"]*)">([\s\S]*?)<\/Term>/g, (_, tip, label) =>
    stash(
      `<span class="wysiwyg-term" data-tip="${escapeAttr(tip)}" contenteditable="false"><span class="glossary-label">${escapeHtml(label)}</span></span>`,
    ),
  );

  // 2. [`code`](url)
  s = s.replace(/\[`([^`]+)`\]\(([^)]+)\)/g, (_, code, url) =>
    stash(
      `<a href="${escapeAttr(url)}" class="wysiwyg-link"><code>${escapeHtml(code)}</code></a>`,
    ),
  );

  // 3. [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
    stash(`<a href="${escapeAttr(url)}" class="wysiwyg-link">${escapeHtml(text)}</a>`),
  );

  // 4. Inline `code`
  s = s.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));

  // Escape remaining raw HTML entities
  s = escapeHtml(s);

  // 5. **bold**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 6. *italic* (avoid matching inside words or empty)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");

  // Line breaks
  s = s.replace(/\n/g, "<br>");

  // Restore tokens
  s = s.replace(/\u0000TOK(\d+)\u0000/g, (_, idx) => tokens[Number(idx)]);

  return s;
}

/**
 * Serialize a contentEditable DOM element back into clean inline Markdown/MDX.
 */
export function domToInlineMdx(root: HTMLElement): string {
  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? "").replace(/\u00a0/g, " ");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    if (el.classList.contains("wysiwyg-term")) {
      const tip = el.getAttribute("data-tip") ?? "";
      const label = (el.textContent ?? "").trim();
      if (!label) return "";
      return `<Term tip="${tip.replace(/"/g, "&quot;")}">${label}</Term>`;
    }

    if (tag === "BR") return "\n";

    const inner = Array.from(el.childNodes).map(walk).join("");

    if (tag === "STRONG" || tag === "B") {
      return inner ? `**${inner}**` : "";
    }
    if (tag === "EM" || tag === "I") {
      return inner ? `*${inner}*` : "";
    }
    if (tag === "CODE") {
      return inner ? `\`${inner}\`` : "";
    }
    if (tag === "A") {
      const href = el.getAttribute("href") ?? "";
      if (!inner) return "";
      return `[${inner}](${href})`;
    }
    if (tag === "DIV" || tag === "P") {
      return inner ? `\n${inner}` : "";
    }

    return inner;
  }

  return Array.from(root.childNodes)
    .map(walk)
    .join("")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}
