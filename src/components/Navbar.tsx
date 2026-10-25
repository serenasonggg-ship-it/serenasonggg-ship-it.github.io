import { useEffect, useState } from 'react';
import { Atom } from 'lucide-react';
import type { Content } from '../data';

const EASE = 'ease-[cubic-bezier(0.25,0.1,0.25,1)]';

type Props = {
  t: Content;
  email: string;
  onToggleLang: () => void;
};

export default function Navbar({ t, email, onToggleLang }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.timeline, href: '#timeline' },
    { label: t.nav.projects, href: '#projects' },
    { label: t.nav.achievements, href: '#achievements' },
    { label: t.nav.contact, href: `mailto:${email}` },
  ];

  const langButton =
    'border border-white/30 rounded-sm px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:py-5 md:px-10 lg:px-14 max-md:bg-black/55 max-md:backdrop-blur-md">
        <a href="#about" className="flex items-center gap-2">
          <Atom className="w-6 h-6 text-white" strokeWidth={1.5} />
          <span className="text-white text-base font-medium tracking-tight">{t.hero.name}</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-light">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors cursor-pointer">
              {link.label}
            </a>
          ))}
          <button type="button" onClick={onToggleLang} className={langButton}>
            {t.langToggle}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-5 z-50">
          <button type="button" onClick={onToggleLang} className={langButton}>
            {t.langToggle}
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="text-white relative w-6 h-6 flex items-center justify-center"
          >
            <span
              className={`absolute w-5 h-[1.5px] bg-white transition-all duration-300 ${EASE} ${
                open ? 'rotate-45 translate-y-0' : '-translate-y-[5px]'
              }`}
            />
            <span
              className={`absolute w-5 h-[1.5px] bg-white transition-all duration-300 ${EASE} ${
                open ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'
              }`}
            />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-500 ${EASE} ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`text-white text-2xl font-light tracking-wide cursor-pointer hover:text-white/70 transition-all duration-500 ${EASE} ${
              open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: open ? `${100 + i * 75}ms` : '0ms' }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
