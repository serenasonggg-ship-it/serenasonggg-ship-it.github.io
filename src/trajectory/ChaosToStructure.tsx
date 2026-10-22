import { useEffect, useMemo, useState } from 'react';
import { useRevealOnce } from '../hooks';

type Role = 0 | 1 | 2 | 3;

// One synthetic session: SP, user, then assistant/tool rhythm with a parallel burst and a second user turn.
const SEQUENCE: Role[] = [0, 1, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2];
const ROLE_LABEL = ['SP', 'U', 'A', 'T'];
const ROLE_STYLE = [
  'bg-white text-black border-white',
  'bg-transparent text-white border-white border-2',
  'bg-white/75 text-black border-white/75',
  'bg-transparent text-white border-white/70 border-dashed',
];
const NOISE = [
  '{…}',
  '"modelRequest"',
  '\\"messages\\"',
  'requestId',
  'startTime',
  '<user_info>',
  '<rules>',
  '97 fields',
  '<cb_summary>',
  '"delta"',
  'usage',
  'conversationId',
  '\\"role\\"',
  '[…]',
  'stream_options',
  'endTime',
  '"tool_calls"',
  '<user_query>',
  'reasoning_content',
  '{…}',
];
const LANE_Y = [16, 39, 62, 85];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Props = {
  lanes: [string, string, string, string];
  captions: { chaos: string; structured: string };
  toggle: { toStructure: string; toChaos: string };
  reducedMotion: boolean;
};

export default function ChaosToStructure({ lanes, captions, toggle, reducedMotion }: Props) {
  const { ref, visible } = useRevealOnce<HTMLDivElement>(0.35);
  const [structured, setStructured] = useState(reducedMotion);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setTimeout(() => setStructured(true), 900);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion]);

  const scatter = useMemo(() => {
    const rand = seeded(7);
    const point = () => ({ x: 6 + rand() * 88, y: 8 + rand() * 84, r: (rand() - 0.5) * 70 });
    return {
      tokens: SEQUENCE.map(point),
      // Snowball: each real message reappears as faded copies in later lines.
      echoes: SEQUENCE.slice(0, 18).map((role) => ({ role, ...point() })),
      noise: NOISE.map(point),
    };
  }, []);

  const step = 78 / (SEQUENCE.length - 1);
  const ease = reducedMotion ? 'none' : 'all 1100ms cubic-bezier(0.65,0,0.35,1)';

  return (
    <div ref={ref}>
      <div className="overflow-x-auto border border-white/20 bg-white/[0.02]">
        <div className="relative h-[340px] sm:h-[380px] min-w-[680px]">
          {lanes.map((lane, i) => (
            <div
              key={lane}
              className="absolute left-0 right-0 flex items-center"
              style={{
                top: `${LANE_Y[i]}%`,
                opacity: structured ? 1 : 0,
                transition: reducedMotion ? 'none' : 'opacity 600ms ease 500ms',
              }}
            >
              <span className="w-[14%] pl-4 text-white text-xs font-medium -translate-y-1/2">{lane}</span>
              <span className="flex-1 mr-4 h-px bg-white/20 -translate-y-1/2" />
            </div>
          ))}

          {scatter.noise.map((p, i) => (
            <span
              key={`n${i}`}
              className="absolute font-mono text-[10px] text-white/55 whitespace-nowrap"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${p.r}deg) scale(${structured ? 0.4 : 1})`,
                opacity: structured ? 0 : 1,
                transition: ease,
                transitionDelay: `${i * 12}ms`,
              }}
            >
              {NOISE[i]}
            </span>
          ))}

          {scatter.echoes.map((p, i) => (
            <span
              key={`e${i}`}
              className={`absolute w-7 h-5 border rounded-[3px] text-[9px] font-mono flex items-center justify-center ${ROLE_STYLE[p.role]}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${p.r}deg) scale(${structured ? 0.3 : 0.85})`,
                opacity: structured ? 0 : 0.35,
                transition: ease,
                transitionDelay: `${i * 10}ms`,
              }}
            >
              {ROLE_LABEL[p.role]}
            </span>
          ))}

          {SEQUENCE.map((role, i) => {
            const chaos = scatter.tokens[i];
            const left = structured ? 18 + i * step : chaos.x;
            const top = structured ? LANE_Y[role] : chaos.y;
            return (
              <span
                key={`t${i}`}
                className={`absolute w-7 h-5 border rounded-[3px] text-[9px] font-mono font-medium flex items-center justify-center ${ROLE_STYLE[role]}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: `translate(-50%, -50%) rotate(${structured ? 0 : chaos.r}deg)`,
                  transition: ease,
                  transitionDelay: `${i * 22}ms`,
                }}
              >
                {ROLE_LABEL[role]}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-white/70 text-sm font-light">{structured ? captions.structured : captions.chaos}</p>
        <button
          type="button"
          onClick={() => setStructured((value) => !value)}
          className="self-start border border-white text-white text-xs px-4 py-2 rounded-sm hover:bg-white hover:text-black transition-colors"
        >
          {structured ? toggle.toChaos : toggle.toStructure}
        </button>
      </div>
    </div>
  );
}
