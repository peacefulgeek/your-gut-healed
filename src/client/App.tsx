import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticlePage } from './pages/ArticlePage';
import { AboutPage } from './pages/AboutPage';
import { ToolkitPage } from './pages/ToolkitPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { QuizPage } from './pages/QuizPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <div className="site-wrapper">
      <Header />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gut-healing-toolkit" element={<ToolkitPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/gut-health-quiz" element={<QuizPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
