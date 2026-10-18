import { Link } from "react-router-dom";
import { topics } from "../content/catalog";
import { usePageTitle } from "./usePageTitle";

export function CommunityPage() {
  usePageTitle("Community");

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-action">Forthcoming</p>
      <h1 className="mt-3 max-w-[16ch] font-heading text-[2rem] font-semibold tracking-tight text-balance sm:text-5xl">
        A community for the lessons you read
      </h1>
      <p className="mt-5 max-w-[62ch] text-lg leading-relaxed">
        QuantumShield India is planned to include discussion rooms for each technology topic. People
        with accounts will be able to post there. That experience is not available in this release.
      </p>
      <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">
        This page does not show messages, members, or a live conversation. Nothing here is a transcript.
      </p>

      <section className="mt-10" aria-labelledby="planned-rooms-heading">
        <h2 id="planned-rooms-heading" className="font-heading text-2xl font-semibold">
          Rooms planned around the catalogue
        </h2>
        <ul className="mt-4 max-w-[62ch] list-disc space-y-2 pl-5 leading-relaxed">
          {topics.map((topic) => (
            <li key={topic.id}>{topic.title}</li>
          ))}
        </ul>
      </section>

      <p className="mt-8">
        <Link className="button-primary" to="/explore">
          Explore lessons
        </Link>
      </p>
    </main>
  );
}
