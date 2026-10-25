import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { content, email, wechat, type Content, type Lang } from './data';
import { usePrefersReducedMotion } from './hooks';
import ScrollBackground from './components/ScrollBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import OtherExperience from './components/OtherExperience';
import Projects from './components/Projects';
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
        onToggleLang={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
      />

      <main className="relative z-10">
        <Hero ref={heroRef} t={t} lang={lang} />
        <Timeline t={t} lang={lang} reducedMotion={reducedMotion} />
        <OtherExperience t={t} />
        <Projects t={t} lang={lang} reducedMotion={reducedMotion} />
        <Achievements t={t} lang={lang} />
        <Contact t={t} />
      </main>
    </>
  );
}

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => {});
}

function Contact({ t }: { t: Content }) {
  const [copiedWeChat, setCopiedWeChat] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleWeChat = () => {
    copyText(wechat);
    setCopiedWeChat(true);
    window.setTimeout(() => setCopiedWeChat(false), 3200);
    window.location.href = 'weixin://';
  };

  const handleEmail = () => {
    copyText(email);
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 3200);
    window.location.href = `mailto:${email}`;
  };

  return (
    <footer id="contact" className="w-full px-6 pt-12 pb-10 md:px-10 lg:px-14">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-white text-xs sm:text-sm font-medium uppercase tracking-[0.3em]">{t.contact.heading}</h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/25 border border-white/25">
          <button
            type="button"
            onClick={handleWeChat}
            className="text-left bg-black/50 p-6 sm:p-8 flex flex-col gap-3 hover:bg-black/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs font-medium uppercase tracking-[0.2em]">
                {t.contact.wechat.label}
              </span>
              {copiedWeChat ? (
                <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              )}
            </div>
            <span className="text-white text-xl sm:text-2xl font-medium tracking-tight font-mono">{wechat}</span>
            <span className="text-white/60 text-xs sm:text-sm font-light">
              {copiedWeChat ? t.contact.wechat.copied : t.contact.wechat.hint}
            </span>
          </button>

          <button
            type="button"
            onClick={handleEmail}
            className="text-left bg-black/50 p-6 sm:p-8 flex flex-col gap-3 hover:bg-black/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs font-medium uppercase tracking-[0.2em]">
                {t.contact.email.label}
              </span>
              {copiedEmail ? (
                <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              )}
            </div>
            <span className="text-white text-xl sm:text-2xl font-medium tracking-tight break-all">{email}</span>
            <span className="text-white/60 text-xs sm:text-sm font-light">
              {copiedEmail ? t.contact.email.copied : t.contact.email.hint}
            </span>
          </button>
        </div>

        <p className="mt-10 text-white/40 text-xs font-light">
          © {new Date().getFullYear()} {t.hero.name}
        </p>
      </div>
    </footer>
  );
}
