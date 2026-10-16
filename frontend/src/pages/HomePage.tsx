import { ConnectionStatus } from "../components/ConnectionStatus";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { PlatformOverview } from "../components/PlatformOverview";
import { useBackendHealth } from "../hooks/useBackendHealth";

export function HomePage() {
  const { snapshot, retry, isChecking } = useBackendHealth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header snapshot={snapshot} />
      <main id="main" className="flex-1">
        <Hero />
        <PlatformOverview />
        <ConnectionStatus snapshot={snapshot} onRetry={retry} isChecking={isChecking} />
      </main>
      <Footer />
    </div>
  );
}
