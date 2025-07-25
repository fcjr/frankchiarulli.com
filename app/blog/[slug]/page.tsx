import { Fragment } from "react";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import Link from "../../Link";
import { sans } from "../../fonts";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkMdxEvalCodeBlock } from "../../mdx";
import overnight from "overnight/themes/Overnight-Slumber.json";
import "../../markdown.css";
import remarkGfm from "remark-gfm";

overnight.colors["editor.background"] = "var(--code-bg)";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  let postComponents: any = {};
  try {
    postComponents = await import("../../public/" + slug + "/components.js");
  } catch (e: any) {
    if (!e || e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
  let Wrapper = postComponents.Wrapper ?? Fragment;
  const { content, data } = matter(file);
  const isDraft = new Date(data.date).getFullYear() > new Date().getFullYear();
  const editUrl = `https://github.com/fcjr/frankchiarulli.com/edit/main/public/${encodeURIComponent(
    slug,
  )}/index.md`;
  return (
    <>
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>all posts</span>
        </Link>
      </div>
      <article>
        <h1
          className={[
            sans.className,
            "text-[40px] font-black leading-[44px] text-[--title]",
          ].join(" ")}
        >
          {data.title}
        </h1>
        <p className="mt-2 text-[13px] text-gray-700 dark:text-gray-300">
          {new Date(data.date).toLocaleDateString("en", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="markdown">
          <div className="mb-8 relative md:-left-6 flex flex-wrap items-baseline">
            {data.youtube && (
              <a
                className="leading-tight mt-4"
                href={data.youtube}
                target="_blank"
              >
                <span className="hidden min-[400px]:inline">Watch on </span>
                YouTube
              </a>
            )}
          </div>

          <Wrapper>
            <MDXRemote
              source={content}
              components={{
                a: Link,
                img: ({ src, ...rest }) => {
                  if (src && !/^https?:\/\//.test(src)) {
                    // https://github.com/gaearon/overreacted.io/issues/827
                    src = `/${slug}/${src}`;
                  }
                  return <img src={src} {...rest} />;
                },
                ...postComponents,
              }}
              options={{
                mdxOptions: {
                  useDynamicImport: true,
                  remarkPlugins: [
                    remarkSmartpants,
                    remarkGfm,
                    [remarkMdxEvalCodeBlock, filename],
                  ] as any,
                  rehypePlugins: [
                    [
                      rehypePrettyCode,
                      {
                        theme: overnight,
                      },
                    ],
                    [rehypeSlug],
                    [
                      rehypeAutolinkHeadings,
                      {
                        behavior: "wrap",
                        properties: {
                          className: "linked-heading",
                          target: "_self",
                        },
                      },
                    ],
                  ] as any,
                } as any,
              }}
            />
          </Wrapper>
          <hr />
          <p>
            {data.bluesky && (
              <>
                <Link href={data.bluesky}>Discuss on Bluesky</Link>
                &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              </>
            )}
            {data.youtube && (
              <>
                <Link href={data.youtube}>Watch on YouTube</Link>
                &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              </>
            )}
            <Link href={editUrl}>Edit on GitHub</Link>
          </p>
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — frankchiarulli.com",
    description: data.spoiler,
  };
}
