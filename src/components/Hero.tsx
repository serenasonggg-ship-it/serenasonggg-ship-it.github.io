import { forwardRef, Fragment } from 'react';
import type { Content, Lang } from '../data';

type Props = { t: Content; lang: Lang };

const Hero = forwardRef<HTMLElement, Props>(function Hero({ t, lang }, ref) {
  const tight = lang === 'en' ? 'tracking-[-0.06em]' : 'tracking-tight';

  return (
    <section
      id="about"
      ref={ref}
      className="relative h-screen w-full flex flex-col items-center justify-center px-6 text-center"
    >
      <p className="text-white/60 text-sm sm:text-base font-light tracking-wide mb-4">{t.hero.greeting}</p>

      <h1
        className={`text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[1.05] max-w-5xl ${tight}`}
      >
        {t.hero.name}
      </h1>

      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {t.hero.roles.map((role, i) => (
          <Fragment key={role}>
            {i > 0 && <span className="w-1 h-1 rounded-full bg-white/50" />}
            <span className="text-white text-base sm:text-xl md:text-2xl font-light tracking-tight">{role}</span>
          </Fragment>
        ))}
      </div>

      <p className="mt-6 sm:mt-8 text-white/70 text-sm sm:text-lg font-light max-w-xl leading-relaxed">
        {t.hero.tagline}
        <br className="hidden sm:block" /> {t.hero.location}
      </p>

      <div className="absolute bottom-10 flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs font-light tracking-[0.3em] uppercase">{t.hero.scroll}</span>
        <span className="w-px h-10 bg-white animate-pulse motion-reduce:animate-none" />
      </div>
    </section>
  );
});

export default Hero;
