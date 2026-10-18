import { useState } from "react";
import { ImageSquare } from "@phosphor-icons/react";

type LessonHeroImageProps = {
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
};

export function LessonHeroImage({ src, alt, caption, badge }: LessonHeroImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="relative aspect-[16/9] max-h-[380px] w-full overflow-hidden bg-canvas-subtle">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-muted">
            <ImageSquare size={48} weight="duotone" className="text-action/50" />
            <p className="mt-2 text-sm font-semibold">{alt}</p>
            <p className="text-xs text-muted/70">QuantumShield Educational Illustration</p>
          </div>
        )}

        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-action shadow-xs border border-ink/8">
            {badge}
          </span>
        )}
      </div>

      {caption && (
        <figcaption className="border-t border-ink/8 bg-canvas-subtle/50 px-4 py-3 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">Figure: </span>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
