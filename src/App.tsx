import { useEffect, useRef, useState } from 'react';
import { content, email, type Lang } from './data';
import { usePrefersReducedMotion } from './hooks';
import ScrollBackground from './components/ScrollBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import OtherExperience from './components/OtherExperience';
import Achievements from './components/Achievements';

function initialLang(): Lang {
  const saved = localStorage.getItem('lang');
  if (saved === 'zh' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const t = content[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  return (
    <>
      <ScrollBackground hero={heroRef} />

      <Navbar
        t={t}
        email={email}
        onToggleLang={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
      />

      <main className="relative z-10">
        <Hero ref={heroRef} t={t} lang={lang} />
        <Timeline t={t} lang={lang} reducedMotion={reducedMotion} />
        <OtherExperience t={t} />
        <Achievements t={t} lang={lang} email={email} />
        <footer className="px-6 md:px-10 lg:px-14 py-8 flex justify-between text-white/40 text-xs font-light">
          <span>
            © {new Date().getFullYear()} {t.hero.name}
          </span>
          <a href={`mailto:${email}`} className="hover:text-white/70 transition-colors">
            {email}
          </a>
        </footer>
      </main>
    </>
  );
}
