import type { Content } from '../data';

export default function OtherExperience({ t }: { t: Content }) {
  return (
    <section className="w-full px-6 pb-16 md:px-10 md:pb-24 lg:px-14">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-white text-xs sm:text-sm font-medium uppercase tracking-[0.3em]">{t.other.heading}</h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/25 border-y border-white/25">
          {t.other.items.map((item) => (
            <article key={`${item.org}-${item.unit}`} className="bg-black/50 p-6 sm:p-8">
              <h3 className="text-white text-xl sm:text-2xl font-semibold tracking-tight">{item.org}</h3>
              <p className="mt-1 text-white text-sm font-normal">
                {item.title}
                {item.unit && <span className="font-light"> · {item.unit}</span>}
              </p>
              <p className="mt-4 text-white text-sm font-light leading-relaxed">{item.description}</p>
              {item.tags && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag} className="border border-white/50 rounded-full px-3 py-1 text-white text-xs font-light">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
