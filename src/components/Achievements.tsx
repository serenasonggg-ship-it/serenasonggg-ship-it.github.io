import { ArrowUpRight } from 'lucide-react';
import type { Achievement, Content, Lang } from '../data';

type Props = { t: Content; lang: Lang; email: string };

export default function Achievements({ t, lang, email }: Props) {
  const tight = lang === 'en' ? 'tracking-[-0.06em]' : 'tracking-tight';

  return (
    <section
      id="achievements"
      className="min-h-screen w-full flex flex-col lg:flex-row px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-20 lg:px-14 gap-10 md:gap-12"
    >
      <div className="lg:w-1/3 flex flex-col justify-between">
        <h2 className={`text-white text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] ${tight}`}>
          {t.achievements.heading[0]}
          <br />
          {t.achievements.heading[1]}
        </h2>
        <div>
          <p className="mt-8 text-white/60 text-xs sm:text-sm leading-relaxed font-light max-w-sm">
            {t.achievements.summary}
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-8 inline-block w-fit border border-white/30 text-white text-xs sm:text-sm font-light px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm hover:bg-white/10 transition-colors"
          >
            {t.achievements.cta}
          </a>
        </div>
      </div>

      <div className="lg:flex-1 flex items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/15 w-full">
          {t.achievements.items.map((item, i) => (
            <AchievementCard key={`${item.title}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AchievementCard({ item }: { item: Achievement }) {
  const body = (
    <>
      <div className="flex items-start">
        <span className="text-white text-4xl sm:text-5xl font-normal tracking-[-0.06em]">{item.metric}</span>
        {item.link && <ArrowUpRight className="w-4 h-4 text-white/60 ml-auto" />}
      </div>
      <h3 className="text-white text-sm sm:text-base font-medium tracking-tight">{item.title}</h3>
      <p className="text-white/60 text-xs sm:text-sm font-light leading-relaxed">{item.description}</p>
    </>
  );
  const className = 'bg-black/50 p-6 sm:p-8 flex flex-col gap-3 hover:bg-black/20 transition-colors';

  return item.link ? (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
