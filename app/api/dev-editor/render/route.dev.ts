import { NextRequest, NextResponse } from "next/server";
import { createElement, type ReactNode } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import overnight from "overnight/themes/Overnight-Slumber.json";
import { render as renderPele } from "pele";
import { remarkPeleMermaid } from "../../../mdx";

const theme: any = {
  ...overnight,
  colors: {
    ...(overnight as any).colors,
    "editor.background": "var(--code-bg)",
  },
};

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available outside development" }, { status: 404 });
  }

  try {
    const body = await req.json();

    // Fast path for rendering a single Mermaid diagram via Pele
    if (body.mode === "mermaid") {
      const code = String(body.code ?? "");
      const { svg } = renderPele(code, { fontFamily: "monospace" });
      return NextResponse.json({ svg });
    }

    const slug = String(body.slug ?? "");
    const content = String(body.content ?? "");

    const { default: MDXContent } = await evaluate(content, {
      ...(jsxRuntime as any),
      development: false,
      remarkPlugins: [remarkSmartpants, remarkGfm, remarkPeleMermaid] as any,
      rehypePlugins: [[rehypePrettyCode, { theme }], [rehypeSlug]] as any,
    });

    const { renderToStaticMarkup } = await import("react-dom/server");

    const components: Record<string, any> = {
      a: ({ href, children, ...rest }: any) => {
        const isExt = href && !href.startsWith("/") && !href.startsWith("#");
        return createElement(
          "a",
          {
            href,
            ...(isExt ? { target: "_blank", rel: "noopener noreferrer" } : {}),
            ...rest,
          },
          children,
        );
      },
      img: ({ src, ...rest }: any) => {
        const resolved = src && !/^https?:\/\//.test(src) && !src.startsWith("/")
          ? `/${slug}/${src}`
          : src;
        return createElement("img", { src: resolved, ...rest });
      },
      MermaidDiagram: ({ svg }: { svg: string }) =>
        createElement("div", {
          className: "pele-diagram",
          dangerouslySetInnerHTML: { __html: svg },
        }),
      Term: ({ tip, children }: { tip: string; children: ReactNode }) =>
        createElement(
          "span",
          { className: "glossary-term", tabIndex: 0 },
          createElement("span", { className: "glossary-label" }, children),
          createElement("span", { className: "glossary-tip", role: "tooltip" }, tip),
        ),
    };

    const html = renderToStaticMarkup(createElement(MDXContent, { components }));
    return NextResponse.json({ html });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "MDX render error" },
      { status: 400 },
    );
  }
}
