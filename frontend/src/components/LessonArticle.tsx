import type { LessonBlock } from "../content/types";
import { Diagram } from "./Diagram";
import { Quiz } from "./Quiz";

type LessonArticleProps = {
  blocks: LessonBlock[];
};

export function LessonArticle({ blocks }: LessonArticleProps) {
  return (
    <div className="lesson-article max-w-[68ch]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 id={block.id} key={block.id} className="mt-8 font-heading text-2xl font-semibold">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={`${block.type}-${index}`} className="mt-4 text-lg leading-relaxed">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={`${block.type}-${index}`} className="mt-4 list-disc space-y-2 pl-5 text-lg leading-relaxed">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside key={`${block.title}-${index}`} className="mt-5 border-l-4 border-action bg-surface px-4 py-4">
                <p className="font-semibold">{block.title}</p>
                <p className="mt-2 leading-relaxed">{block.text}</p>
              </aside>
            );
          case "code":
            return (
              <figure key={`${block.label}-${index}`} className="mt-5">
                <figcaption className="text-sm font-semibold text-muted">{block.label}</figcaption>
                <pre className="mt-2 overflow-x-auto bg-ink px-4 py-4 text-sm leading-relaxed text-white">
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
            return <Diagram key={block.diagram} diagram={block.diagram} caption={block.caption} />;
          case "concept":
            return (
              <aside key={block.title} className="mt-6 bg-surface px-4 py-5" aria-label={block.title}>
                <p className="text-sm font-semibold tracking-wide text-action">Educational concept · not a live tool</p>
                <h2 className="mt-2 font-heading text-2xl font-semibold">{block.title}</h2>
                <p className="mt-3 leading-relaxed">{block.text}</p>
              </aside>
            );
          case "quiz":
            return <Quiz key="sample-quiz" questions={block.questions} />;
        }
      })}
    </div>
  );
}
