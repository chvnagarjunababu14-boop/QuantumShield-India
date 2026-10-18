import type { LessonBlock } from "../content/types";
import { Diagram } from "./Diagram";
import { Quiz } from "./Quiz";

type LessonArticleProps = {
  blocks: LessonBlock[];
  lessonSlug?: string;
};

export function LessonArticle({ blocks, lessonSlug }: LessonArticleProps) {
  return (
    <div className="lesson-article max-w-[68ch]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                id={block.id}
                key={`heading-${block.id}-${index}`}
                className="mt-8 scroll-mt-6 font-heading text-2xl font-semibold text-ink"
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={`${block.type}-${index}`} className="mt-4 text-base sm:text-lg leading-relaxed text-slate-800">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={`${block.type}-${index}`} className="mt-4 list-disc space-y-2.5 pl-5 text-base sm:text-lg leading-relaxed text-slate-800">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside
                key={`${block.title}-${index}`}
                className="mt-6 rounded-xl border-l-4 border-action bg-canvas-subtle/80 px-4.5 py-4 shadow-xs"
              >
                <p className="font-heading font-semibold text-ink">{block.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{block.text}</p>
              </aside>
            );
          case "code":
            return (
              <figure key={`${block.label}-${index}`} className="mt-6">
                <figcaption className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                  {block.label}
                </figcaption>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 text-xs font-mono leading-relaxed text-slate-100 shadow-xs">
                  <code>{block.code}</code>
                </pre>
              </figure>
            );
          case "link":
            return (
              <p key={block.href} className="mt-4">
                <a className="text-link" href={block.href} rel="noopener noreferrer">
                  {block.label}
                </a>
              </p>
            );
          case "illustration":
            return <Diagram key={`diagram-${block.diagram}-${index}`} diagram={block.diagram} caption={block.caption} />;
          case "concept":
            return (
              <aside
                key={block.title}
                className="mt-8 rounded-xl border border-action/20 bg-action/5 p-5 shadow-xs"
                aria-label={block.title}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-action">
                  Educational concept · not a live tool
                </p>
                <h2 className="mt-1.5 font-heading text-2xl font-semibold text-ink">{block.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{block.text}</p>
              </aside>
            );
          case "quiz":
            return (
              <Quiz
                key={`quiz-${lessonSlug || "default"}`}
                questions={block.questions}
                quizId={lessonSlug || "post-quantum-cryptography"}
              />
            );
        }
      })}
    </div>
  );
}
