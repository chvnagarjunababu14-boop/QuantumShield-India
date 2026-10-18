import { Link } from "react-router-dom";
import { usePageTitle } from "./usePageTitle";

export function NotFoundPage() {
  usePageTitle("Page not found");

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="font-heading text-4xl font-semibold">This page is not part of the site</h1>
      <p className="mt-4">
        <Link className="text-link" to="/">
          Return home
        </Link>
      </p>
    </main>
  );
}
