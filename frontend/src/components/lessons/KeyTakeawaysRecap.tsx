import { BookmarkSimple, CheckSquareOffset } from "@phosphor-icons/react";

export type TakeawayItem = {
  title: string;
  summary: string;
  tag?: string;
};

type KeyTakeawaysRecapProps = {
  items: TakeawayItem[];
};

export function KeyTakeawaysRecap({ items }: KeyTakeawaysRecapProps) {
  return (
    <section
      id="recap"
      aria-labelledby="recap-heading"
      className="my-10 rounded-2xl border border-action/20 bg-gradient-to-br from-white via-canvas-subtle to-sky-50/40 p-6 sm:p-7 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
          <BookmarkSimple size={16} weight="fill" />
          Lesson Recap
        </span>
        <span className="text-xs text-muted">Core Conceptual Takeaways</span>
      </div>

      <h3 id="recap-heading" className="mt-2 font-heading text-xl font-semibold text-ink">
        Summary of Key Insights
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item, idx) => (
          <div
            key={item.title}
            className="flex flex-col justify-between rounded-xl border border-ink/8 bg-white p-4.5 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-action">
                  <CheckSquareOffset size={16} weight="fill" className="text-action" />
                  0{idx + 1}
                </span>
                {item.tag && (
                  <span className="rounded bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
                    {item.tag}
                  </span>
                )}
              </div>
              <h4 className="mt-2 font-heading text-base font-semibold text-ink">{item.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
