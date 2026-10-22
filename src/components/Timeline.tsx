import type { Content, Lang, TimelineItem } from '../data';
import { useRevealOnce } from '../hooks';

type Props = { t: Content; lang: Lang; reducedMotion: boolean };

export default function Timeline({ t, lang, reducedMotion }: Props) {
  const tight = lang === 'en' ? 'tracking-[-0.06em]' : 'tracking-tight';

  return (
    <section id="timeline" className="min-h-screen w-full px-6 pt-28 pb-20 md:px-10 lg:px-14">
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight leading-[1.05] ${tight}`}>
          {t.timeline.heading[0]}
          <br />
          {t.timeline.heading[1]}
        </h2>

        <ol className="mt-20 relative">
          <span className="absolute left-0 md:left-[180px] top-0 bottom-0 w-px bg-white/30" aria-hidden="true" />
          {t.timeline.items.map((item, i) => (
            <TimelineEntry key={`${item.period}-${i}`} item={item} index={i} reducedMotion={reducedMotion} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineEntry({ item, index, reducedMotion }: { item: TimelineItem; index: number; reducedMotion: boolean }) {
  const { ref, visible } = useRevealOnce<HTMLLIElement>();
  const shown = reducedMotion || visible;

  return (
    <li
      ref={ref}
      className={`relative grid md:grid-cols-[180px_1fr] gap-2 md:gap-0 pl-8 md:pl-0 pb-20 last:pb-0 ${
        reducedMotion ? '' : 'transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
      } ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: reducedMotion ? '0ms' : `${index * 80}ms` }}
    >
      <span
        className="absolute left-[-4px] md:left-[176px] top-2 md:top-3.5 w-[9px] h-[9px] rounded-full bg-white ring-4 ring-black/40"
        aria-hidden="true"
      />
      <p className="text-white text-sm font-light tracking-wide md:text-right md:pr-10 md:pt-2">{item.period}</p>
      <div className="md:pl-10 max-w-xl">
        <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">{item.org}</h3>
        <p className="mt-2 text-white text-base sm:text-lg font-normal tracking-tight">{item.title}</p>
        {item.unit && <p className="mt-0.5 text-white text-sm font-light">{item.unit}</p>}

        <p className="mt-6 pl-4 border-l-2 border-white text-white text-sm sm:text-base leading-relaxed font-light">
          {item.description}
        </p>

        {item.highlights && (
          <ul className="mt-8 border-t border-white/25">
            {item.highlights.map((highlight) => (
              <li
                key={highlight.label}
                className="grid grid-cols-[76px_1fr] sm:grid-cols-[104px_1fr] gap-4 py-5 border-b border-white/25"
              >
                <span className="pt-1 text-white text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em]">
                  {highlight.label}
                </span>
                <div>
                  <p className="text-white text-base sm:text-lg font-medium leading-snug tracking-tight">
                    {highlight.headline}
                  </p>
                  <p className="mt-2 text-white text-sm font-light leading-relaxed">{highlight.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
