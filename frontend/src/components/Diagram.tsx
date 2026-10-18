import type { DiagramId } from "../content/types";

type DiagramProps = {
  diagram: DiagramId;
  caption: string;
};

export function Diagram({ diagram, caption }: DiagramProps) {
  return (
    <figure className="my-6 border border-ink/10 bg-surface px-4 py-5">
      <DiagramGraphic diagram={diagram} />
      <figcaption className="mt-4 text-sm leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

function DiagramGraphic({ diagram }: { diagram: DiagramId }) {
  if (diagram === "bit-and-qubit") {
    return (
      <svg viewBox="0 0 640 180" aria-hidden="true">
        <BitPanel x={16} title="Classical bit" value="0 or 1" note="You read the stored value." />
        <BitPanel x={332} title="Qubit" value="amplitudes" note="One measurement, one outcome." />
      </svg>
    );
  }

  if (diagram === "public-key-risk") {
    return (
      <svg viewBox="0 0 640 200" aria-hidden="true">
        <Step x={16} label="1" title="Ciphertext stored" detail="The secret stays encrypted." />
        <Step x={228} label="2" title="Years may pass" detail="No date is claimed." />
        <Step x={440} label="3" title="Future machine" detail="Shor, if built at scale." />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 640 180" aria-hidden="true">
      <BitPanel x={16} title="Provider" value="Platform" note="Sites, hardware, base services." />
      <BitPanel x={332} title="Customer" value="Configuration" note="Identities, access, and data." />
    </svg>
  );
}

function BitPanel({
  x,
  title,
  value,
  note,
}: {
  x: number;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <g>
      <rect x={x} y={16} width={292} height={148} rx={12} fill="#FFFFFF" stroke="#0B1F3A" strokeOpacity="0.18" />
      <text x={x + 20} y={52} fill="#1D4ED8" fontFamily="Lexend, sans-serif" fontSize="16">
        {title}
      </text>
      <text x={x + 20} y={92} fill="#0B1F3A" fontFamily="Lexend, sans-serif" fontSize="28">
        {value}
      </text>
      <text x={x + 20} y={128} fill="#334155" fontFamily="Source Sans 3, sans-serif" fontSize="16">
        {note}
      </text>
    </g>
  );
}

function Step({
  x,
  label,
  title,
  detail,
}: {
  x: number;
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <g>
      <rect x={x} y={24} width={184} height={152} rx={12} fill="#FFFFFF" stroke="#1D4ED8" />
      <text x={x + 16} y={58} fill="#1D4ED8" fontFamily="Lexend, sans-serif" fontSize="18">
        {label}
      </text>
      <text x={x + 16} y={96} fill="#0B1F3A" fontFamily="Lexend, sans-serif" fontSize="16">
        {title}
      </text>
      <text x={x + 16} y={128} fill="#334155" fontFamily="Source Sans 3, sans-serif" fontSize="14">
        {detail}
      </text>
    </g>
  );
}
