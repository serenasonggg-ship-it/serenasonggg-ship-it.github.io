import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, Check, X } from 'lucide-react';
import type { Lang } from '../data';
import { usePrefersReducedMotion, useRevealOnce } from '../hooks';
import ChaosToStructure from './ChaosToStructure';
import WarehouseViz from './WarehouseViz';
import { trajectoryContent, type TrajectoryContent } from './content';

function initialLang(): Lang {
  const saved = localStorage.getItem('lang');
  if (saved === 'zh' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export default function TrajectoryPage() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const reducedMotion = usePrefersReducedMotion();
  const t = trajectoryContent[lang];
  const tight = lang === 'en' ? 'tracking-[-0.05em]' : 'tracking-tight';

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  return (
    <div className="min-h-screen text-white">
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #e6f5fd 0%, #c9e9f9 100%)' }} />
      </div>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
        aria-hidden="true"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 lg:px-14 bg-[#2f3a42]/70 backdrop-blur-md">
        <a href="/" className="text-white/80 hover:text-white text-sm font-light transition-colors">
          {t.back}
        </a>
        <button
          type="button"
          onClick={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
          className="border border-white/30 rounded-sm px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          {t.langToggle}
        </button>
      </nav>

      <main className="relative z-10 px-6 md:px-10 lg:px-14">
        <Hero t={t} tight={tight} />
        <Warehouse t={t} tight={tight} reducedMotion={reducedMotion} />
        <Operators t={t} tight={tight} reducedMotion={reducedMotion} />
        <FeedbackLoop t={t} tight={tight} reducedMotion={reducedMotion} />
        <SftSynthesis t={t} tight={tight} reducedMotion={reducedMotion} />
        <Assistant t={t} tight={tight} reducedMotion={reducedMotion} />
        <footer className="max-w-6xl mx-auto pt-4 pb-14 flex flex-col sm:flex-row justify-between gap-4 text-[#1f3d4f] text-xs font-normal">
          <span>{t.footer}</span>
          <a href="/" className="hover:text-white/70 transition-colors">
            {t.back}
          </a>
        </footer>
      </main>
    </div>
  );
}

type SectionProps = { t: TrajectoryContent; tight: string; reducedMotion: boolean };

function Section({
  eyebrow,
  heading,
  tight,
  reducedMotion,
  children,
}: {
  eyebrow: string;
  heading: string;
  tight: string;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  const { ref, visible } = useRevealOnce<HTMLElement>(0.12);
  const shown = reducedMotion || visible;
  return (
    <section
      ref={ref}
      className={`max-w-6xl mx-auto my-8 sm:my-10 rounded-2xl bg-[#2f3a42]/70 backdrop-blur-sm px-6 py-14 sm:px-10 sm:py-20 lg:px-14 ${
        reducedMotion ? '' : 'transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]'
      } ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <p className="text-white/60 text-xs font-medium tracking-[0.3em] uppercase">{eyebrow}</p>
      <h2 className={`mt-4 text-white text-3xl sm:text-4xl md:text-5xl font-light leading-[1.15] max-w-4xl ${tight}`}>
        {heading}
      </h2>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function Hero({ t, tight }: { t: TrajectoryContent; tight: string }) {
  return (
    <header className="max-w-6xl mx-auto mt-28 sm:mt-32 mb-8 sm:mb-10 rounded-2xl bg-[#2f3a42]/70 backdrop-blur-sm px-6 py-14 sm:px-10 sm:py-20 lg:px-14">
      <span className="inline-block bg-white text-black text-xs font-medium px-2.5 py-1 rounded-sm">{t.hero.badge}</span>
      <h1 className={`mt-6 text-white text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] max-w-5xl ${tight}`}>
        {t.hero.title}
      </h1>
      <p className="mt-8 text-white text-lg sm:text-xl font-light leading-relaxed max-w-3xl">{t.hero.summary}</p>
      <p className="mt-4 pl-4 border-l-2 border-white text-white/80 text-sm sm:text-base font-light max-w-3xl">
        {t.hero.role}
      </p>
      <dl className="mt-14 grid grid-cols-2 md:grid-cols-4 border-y border-white/20">
        {t.hero.stats.map((stat) => (
          <div key={stat.label} className="py-6 pr-4">
            <dd className="text-white text-4xl sm:text-5xl font-normal tracking-[-0.04em]">{stat.value}</dd>
            <dt className="mt-2 text-white/60 text-xs sm:text-sm font-light">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

function Warehouse({ t, tight, reducedMotion }: SectionProps) {
  const w = t.warehouse;
  return (
    <Section eyebrow={w.eyebrow} heading={w.heading} tight={tight} reducedMotion={reducedMotion}>
      <p className="text-white/80 text-base font-light leading-relaxed max-w-3xl">{w.lead}</p>

      <p className="mt-12 text-white/60 text-xs font-medium tracking-[0.2em] uppercase">{w.sourcesTitle}</p>
      <ul className="mt-4 grid sm:grid-cols-3 gap-px bg-white/15 border border-white/15">
        {w.sources.map((source) => (
          <li key={source.title} className="bg-[#3d4f5b] p-5 sm:p-6">
            <p className="text-white text-base font-semibold">{source.title}</p>
            <p className="mt-1 text-white/60 text-sm font-light">{source.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-start">
        <div>
          <p className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase">{w.chaosTitle}</p>
          <ul className="mt-4 space-y-3">
            {w.chaos.map((item) => (
              <li key={item} className="flex gap-3 text-white/80 text-sm font-light leading-relaxed">
                <span className="mt-[9px] w-1.5 h-px shrink-0 bg-white" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ChaosToStructure lanes={w.lanes} captions={w.captions} toggle={w.toggle} reducedMotion={reducedMotion} />
      </div>

      <ol className="mt-16">
        {w.layers.map((layer, i) => (
          <li key={layer.code}>
            <div
              className="grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 p-5 sm:p-7 border border-white/25"
              style={{ backgroundColor: `rgba(255,255,255,${0.03 + i * 0.03})` }}
            >
              <div className="flex flex-col">
                <span className="text-white text-4xl sm:text-5xl font-light tracking-tight">{layer.code}</span>
                <p className="mt-3 text-white text-base font-semibold">{layer.name}</p>
                <p className="mt-2 text-white/70 text-sm font-light leading-relaxed">{layer.text}</p>
                <div className="mt-auto pt-6">
                  <code className="block text-white text-xs font-mono leading-relaxed break-words border-t border-white/15 pt-4">
                    {layer.schema}
                  </code>
                  <p className="mt-3 text-white/60 text-xs font-light">
                    <span className="text-white font-medium mr-2">{w.fixesLabel}</span>
                    {layer.fixes}
                  </p>
                </div>
              </div>
              <div className="aspect-[420/240] border border-white/15 bg-black/25 p-2 sm:p-3">
                <WarehouseViz kind={layer.viz} actions={w.actions} />
              </div>
            </div>
            {i < w.layers.length - 1 && (
              <div className="flex justify-center py-1.5" aria-hidden="true">
                <ArrowDown className="w-4 h-4 text-white/50" strokeWidth={1.5} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Operators({ t, tight, reducedMotion }: SectionProps) {
  const { ref, visible } = useRevealOnce<HTMLDivElement>(0.2);
  const shown = reducedMotion || visible;
  const op = t.operators;
  const max = Math.max(...op.groups.map((group) => group.n));

  return (
    <Section eyebrow={op.eyebrow} heading={op.heading} tight={tight} reducedMotion={reducedMotion}>
      <p className="text-white/80 text-base font-light leading-relaxed max-w-3xl">{op.lead}</p>

      <div className="mt-10 grid sm:grid-cols-3 gap-px bg-white/15 border border-white/15">
        {op.output.map((item) => (
          <div key={item.label} className="bg-[#3d4f5b] p-5 sm:p-6">
            <p className="text-white text-base font-semibold">{item.label}</p>
            <p className="mt-1 text-white/60 text-sm font-light">{item.text}</p>
          </div>
        ))}
      </div>

      <div ref={ref} className="mt-14">
        <p className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase">{op.groupsTitle}</p>
        <ul className="mt-6 space-y-3">
          {op.groups.map((group, i) => (
            <li key={group.name} className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 items-center">
              <span className="text-white text-sm font-normal">{group.name}</span>
              <div className="group relative">
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-white/10 flex-1 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-white"
                      style={{
                        width: `${(group.n / max) * 100}%`,
                        opacity: 0.35 + (group.n / max) * 0.65,
                        transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: reducedMotion ? 'none' : `transform 900ms cubic-bezier(0.25,0.1,0.25,1) ${i * 60}ms`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-white text-sm font-mono">{group.n}</span>
                </div>
                <p className="mt-1 text-white/50 text-xs font-light">{group.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 grid lg:grid-cols-2 gap-8">
        <div className="border border-white/15 p-6 sm:p-8">
          <h3 className="text-white text-lg font-semibold">{op.views.title}</h3>
          <ul className="mt-5 space-y-4">
            {op.views.items.map((item) => (
              <li key={item.title}>
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-white/60 text-sm font-light">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-white p-6 sm:p-8 bg-white/[0.04]">
          <h3 className="text-white text-lg font-semibold">{op.calibration.title}</h3>
          <p className="mt-5 font-mono text-white text-sm sm:text-base leading-relaxed border-y border-white/20 py-4">
            {op.calibration.formula}
          </p>
          <p className="mt-5 text-white/70 text-sm font-light leading-relaxed">{op.calibration.text}</p>
        </div>
      </div>
    </Section>
  );
}

function FeedbackLoop({ t, tight, reducedMotion }: SectionProps) {
  return (
    <Section eyebrow={t.loop.eyebrow} heading={t.loop.heading} tight={tight} reducedMotion={reducedMotion}>
      <ol className="grid lg:grid-cols-3 gap-6 lg:gap-0">
        {t.loop.steps.map((step, i) => (
          <li key={step.title} className="relative lg:pr-10">
            <div className="flex items-center gap-4">
              <span className="w-9 h-9 shrink-0 rounded-full border border-white flex items-center justify-center text-white text-sm font-mono">
                {i + 1}
              </span>
              <h3 className="text-white text-xl font-semibold tracking-tight">{step.title}</h3>
              {i < t.loop.steps.length - 1 && (
                <span className="hidden lg:block flex-1 h-px bg-white/30" aria-hidden="true" />
              )}
            </div>
            <p className="mt-4 text-white/70 text-sm font-light leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-wrap items-center gap-3">
        <span className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase mr-2">{t.loop.causesTitle}</span>
        {t.loop.causes.map((cause) => (
          <span key={cause} className="border border-white/50 rounded-full px-4 py-1.5 text-white text-sm font-light">
            {cause}
          </span>
        ))}
      </div>
    </Section>
  );
}

function SftSynthesis({ t, tight, reducedMotion }: SectionProps) {
  const sft = t.sft;
  const demo = sft.demo;

  return (
    <Section eyebrow={sft.eyebrow} heading={sft.heading} tight={tight} reducedMotion={reducedMotion}>
      <p className="text-white/80 text-base font-light leading-relaxed max-w-3xl">{sft.lead}</p>

      <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/15 border border-white/15">
        {sft.steps.map((step, i) => (
          <li key={step.title} className="bg-[#3d4f5b] p-5 sm:p-6">
            <span className="text-white/50 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 text-white text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-white/65 text-sm font-light leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 border border-white/25">
        <div className="px-5 sm:px-8 py-5 border-b border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-white text-sm font-semibold">{demo.title}</p>
          <p className="text-white/70 text-sm font-light">{demo.instruction}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-white/50 text-xs text-left">
                <th className="font-normal px-5 sm:px-8 py-3">#</th>
                <th className="font-normal py-3">{demo.columns.constraint}</th>
                <th className="font-normal py-3">{demo.columns.type}</th>
                <th className="font-normal py-3">{demo.columns.judge}</th>
                <th className="font-normal py-3 text-center">{demo.before}</th>
                <th className="font-normal py-3 pr-5 sm:pr-8 text-center">{demo.after}</th>
              </tr>
            </thead>
            <tbody>
              {demo.constraints.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="px-5 sm:px-8 py-3 font-mono text-white/60">{c.id}</td>
                  <td className="py-3 text-white font-light">{c.text}</td>
                  <td className="py-3 text-white/60 font-light">{c.type}</td>
                  <td className="py-3">
                    <span className="border border-white/40 rounded-full px-2 py-0.5 text-white/80 text-xs">{c.judge}</span>
                  </td>
                  <td className="py-3 text-center">
                    <Mark ok={c.before} />
                  </td>
                  <td className="py-3 pr-5 sm:pr-8 text-center">
                    <Mark ok />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 sm:px-8 py-5 border-t border-white/15 flex flex-wrap items-center gap-3">
          <span className="text-white/60 text-xs">→ JSONL</span>
          {demo.outputs.map((out) => (
            <span key={out} className="bg-white text-black text-xs font-medium px-2.5 py-1 rounded-sm">
              {out}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="inline w-4 h-4 text-white" strokeWidth={2} aria-label="pass" />
  ) : (
    <X className="inline w-4 h-4 text-white/40" strokeWidth={2} aria-label="fail" />
  );
}

function Assistant({ t, tight, reducedMotion }: SectionProps) {
  const a = t.assistant;
  return (
    <Section eyebrow={a.eyebrow} heading={a.heading} tight={tight} reducedMotion={reducedMotion}>
      <p className="text-white/80 text-base font-light leading-relaxed max-w-3xl">{a.lead}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {a.tools.map((tool) => (
          <code key={tool} className="border border-white/30 px-2.5 py-1 text-white text-xs font-mono">
            {tool}
          </code>
        ))}
      </div>
      <ul className="mt-10 grid md:grid-cols-3 gap-px bg-white/15 border border-white/15">
        {a.rules.map((rule) => (
          <li key={rule.title} className="bg-[#3d4f5b] p-6">
            <p className="text-white text-base font-semibold">{rule.title}</p>
            <p className="mt-2 text-white/65 text-sm font-light leading-relaxed">{rule.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
