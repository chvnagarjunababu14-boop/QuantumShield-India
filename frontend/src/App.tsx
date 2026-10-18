import { Route, Routes } from "react-router-dom";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { AuthProvider } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DiscussionDetailPage } from "./pages/DiscussionDetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { LearnerPage } from "./pages/LearnerPage";
import { LessonPage } from "./pages/LessonPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-dvh bg-canvas text-ink">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/lessons/:slug" element={<LessonPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/discussions/:id" element={<DiscussionDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/learning" element={<LearnerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </div>
    </AuthProvider>
  );
}
