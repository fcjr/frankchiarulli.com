import { sans } from "./fonts";
import Link from "./Link";
import "./markdown.css";

export default function NotFound() {
  return (
    <article className="markdown">
      <h1
        className={[
          sans.className,
          "text-[40px] font-black leading-[44px] text-[--title]",
        ].join(" ")}
      >
        Not found
      </h1>
      <div className="markdown mt-10">
        <p>This page doesn't exist (yet?)</p>
        <p>
          I recently made this site so maybe something is broken. Please{" "}
          <Link href="https://github.com/fcjr/frankchiarulli.com/issues">
            complain here.
          </Link>
        </p>
        <p>Hope you'll find what you're looking for.</p>
      </div>
    </article>
  );
}
