import { ArrowRight } from 'lucide-react';
import type { Content, Lang, Project } from '../data';
import { useRevealOnce } from '../hooks';
import ProjectVisualView from './ProjectVisuals';

type Props = { t: Content; lang: Lang; reducedMotion: boolean };

export default function Projects({ t, lang, reducedMotion }: Props) {
  const tight = lang === 'en' ? 'tracking-[-0.06em]' : 'tracking-tight';

  return (
    <section id="projects" className="w-full px-6 pt-28 pb-24 md:px-10 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight leading-[1.05] ${tight}`}>
          {t.projects.heading[0]}
          <br />
          {t.projects.heading[1]}
        </h2>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {t.projects.items.map((project, i) => (
            <ProjectRow
              key={project.name}
              project={project}
              index={i}
              more={t.projects.more}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({
  project,
  index,
  more,
  reducedMotion,
}: {
  project: Project;
  index: number;
  more: string;
  reducedMotion: boolean;
}) {
  const { ref, visible } = useRevealOnce<HTMLElement>(0.25);
  const shown = reducedMotion || visible;
  const flipped = index % 2 === 1;

  return (
    <article
      ref={ref}
      className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
        reducedMotion ? '' : 'transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
      } ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div
        className={`aspect-[16/10] border border-white/25 bg-black/50 rounded-sm overflow-hidden p-4 sm:p-6 ${
          flipped ? 'lg:order-2' : ''
        }`}
      >
        <ProjectVisualView kind={project.visual} active={shown} />
      </div>

      <div>
        <p className="text-white text-xs font-medium tracking-[0.3em]">{String(index + 1).padStart(2, '0')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h3 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">{project.name}</h3>
          {project.badge && (
            <span className="bg-white text-black text-xs font-medium px-2.5 py-1 rounded-sm">{project.badge}</span>
          )}
        </div>
        <p className="mt-2 text-white/70 text-sm font-light">{project.meta}</p>

        <p className="mt-6 pl-4 border-l-2 border-white text-white text-base leading-relaxed font-light">
          {project.summary}
        </p>

        {project.stats && (
          <dl className="mt-6 grid grid-cols-3 border-y border-white/25">
            {project.stats.map((stat) => (
              <div key={stat.label} className="py-4 pr-2">
                <dt className="text-white/70 text-xs font-light">{stat.label}</dt>
                <dd className="mt-1 text-white text-2xl sm:text-3xl font-normal tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="mt-6 space-y-3">
          {project.points.map((point) => (
            <li key={point} className="flex gap-3 text-white text-sm font-light leading-relaxed">
              <span className="mt-[9px] w-1.5 h-px shrink-0 bg-white" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="border border-white/50 rounded-full px-3 py-1 text-white text-xs font-light">
              {tag}
            </li>
          ))}
        </ul>

        {project.href && (
          <a
            href={project.href}
            className="mt-8 inline-flex items-center gap-2 border border-white text-white text-sm font-light px-5 py-2.5 rounded-sm hover:bg-white hover:text-black transition-colors"
          >
            {more}
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </article>
  );
}
