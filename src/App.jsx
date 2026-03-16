import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';

import RightClickGuard from './custom/RightClickGuard';
import SectionLoader   from './custom/SectionLoader';
// import IdleManager     from './custom/IdleManager';
import NotFound        from './custom/NotFound';
const AdminApp = lazy(() => import("./admin/App"));

import GameLoadingScreen from './components/GameLoadingScreen';
import Navbar            from './components/Navbar';
import Hero              from './components/Hero';
import About             from './components/About';

const Projects = lazy(() => import("./components/Projects"))
const Certificates = lazy(() => import("./components/Certificates"))

const preloadProjects = () => import("./components/Projects")
const preloadCertificates = () => import("./components/Certificates")

import Skills            from './components/Skills';
import Contact           from './components/Contact';
import Footer            from './components/Footer';
import SectionDivider    from './components/SectionDivider';
const GitHubActivity = lazy(() => import("./components/GithubActivity"));
import Education        from './components/Education';

// chat ai
const ChangliChat = lazy(() => import("./chat-ai/components/ChangliChat"));

function Portfolio() {
  const [loaded, setLoaded] = useState(false)

  const preloadRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          preloadProjects()
          preloadCertificates()
          observer.disconnect()
        }
      },
      {
        rootMargin: "400px"
      }
    )

    if (preloadRef.current) {
      observer.observe(preloadRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />
      {!loaded && <GameLoadingScreen onComplete={() => setLoaded(true)} />}
      <div className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Navbar />
        <main className="relative z-10">
          <Hero />
          <SectionDivider />
          <About />
          <SectionDivider />

          <div ref={preloadRef}></div>

          <Suspense fallback={<SectionLoader label="LOADING PROJECTS..." />}>
            <Projects />
          </Suspense>

          <SectionDivider />

          <Suspense fallback={<SectionLoader label="LOADING CERTIFICATES..." />}>
            <Certificates />
          </Suspense>

          <SectionDivider />
          <Skills />
          <Education />
          <GitHubActivity />
          <SectionDivider />
          <Contact />
        </main>
        <Footer />
        <Suspense fallback={null}>
          <ChangliChat />
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RightClickGuard>
      {/* <IdleManager> */}
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      {/* </IdleManager> */}
    </RightClickGuard>
  );
}