/* eslint-disable @typescript-eslint/no-unused-vars -- `node` is destructured out
   of each renderer so react-markdown's AST node isn't spread onto the DOM. */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders user-authored Markdown (pasted from ChatGPT canvas, etc.) into styled
 * HTML. Bold, italics, headings, lists, links, quotes and code are preserved
 * instead of showing raw `**` / `##` markers. react-markdown escapes any raw
 * HTML by default, so this is safe against injection.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("space-y-4 text-base leading-relaxed text-foreground/75 sm:text-lg", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h4 className="font-heading text-lg font-semibold tracking-tight text-foreground" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h5 className="font-heading text-base font-semibold tracking-tight text-foreground" {...props} />
          ),
          p: ({ node, ...props }) => <p {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-brand hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc space-y-1 pl-6 marker:text-foreground/40" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal space-y-1 pl-6 marker:text-foreground/40" {...props} />
          ),
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-2 border-brand/50 pl-4 italic text-foreground/60"
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              className="overflow-x-auto rounded-xl border border-border/60 bg-secondary p-4 text-sm"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => <hr className="border-border/60" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
