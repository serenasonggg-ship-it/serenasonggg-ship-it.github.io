import type { ProjectVisual } from '../data';

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
const FLOW = 'animate-dash motion-reduce:animate-none';

export default function ProjectVisualView({ kind }: { kind: ProjectVisual }) {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" role="img" aria-hidden="true">
      {kind === 'trajectory' && <TrajectoryVisual />}
      {kind === 'pipeline' && <PipelineVisual />}
      {kind === 'spaceact' && <SpaceActVisual />}
    </svg>
  );
}

const SPANS = [
  { label: 'agent.run', depth: 0, x: 0, w: 1 },
  { label: 'llm.plan', depth: 1, x: 0.02, w: 0.16 },
  { label: 'tool.search', depth: 1, x: 0.2, w: 0.14 },
  { label: 'llm.reason', depth: 1, x: 0.36, w: 0.18 },
  { label: 'tool.exec', depth: 1, x: 0.56, w: 0.24, fail: true },
  { label: 'judge', depth: 1, x: 0.83, w: 0.15 },
];

function TrajectoryVisual() {
  const barX = 120;
  const barW = 260;
  const rowY = (i: number) => 46 + i * 24;
  const fail = SPANS.findIndex((span) => span.fail);
  const failX = barX + (SPANS[fail].x + SPANS[fail].w / 2) * barW;

  return (
    <g fill="white" style={MONO} fontSize="9">
      <text x="20" y="22" opacity="0.6">TRACE · 6 spans · 18.4k tokens</text>
      <path d={`M27 ${rowY(0) + 4} V${rowY(SPANS.length - 1)}`} stroke="white" strokeOpacity="0.4" fill="none" />
      {SPANS.map((span, i) => {
        const y = rowY(i);
        const x = barX + span.x * barW;
        const w = span.w * barW;
        return (
          <g key={span.label}>
            {span.depth > 0 && <path d={`M27 ${y} H36`} stroke="white" strokeOpacity="0.4" />}
            <text x={20 + span.depth * 20} y={y + 3}>
              {span.label}
            </text>
            {span.fail ? (
              <>
                <rect x={x} y={y - 6} width={w} height="12" fill="none" stroke="white" strokeDasharray="4 3" />
                <path d={`M${x + w - 10} ${y - 3} l6 6 m0 -6 l-6 6`} stroke="white" strokeWidth="1.2" />
              </>
            ) : (
              <rect x={x} y={y - 6} width={w} height="12" opacity={span.depth === 0 ? 0.25 : 0.8} />
            )}
          </g>
        );
      })}
      <path
        d={`M${failX} ${rowY(fail) + 8} V206 H150`}
        stroke="white"
        fill="none"
        strokeDasharray="4 4"
        className={FLOW}
      />
      <text x="20" y="209">bad pattern · tool loop</text>
      <text x="20" y="230" opacity="0.6">→ judged · attributed · fed back as data</text>
    </g>
  );
}

function Box({ x, y, w, h, lines, dashed }: { x: number; y: number; w: number; h: number; lines: string[]; dashed?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="black"
        fillOpacity="0.4"
        stroke="white"
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + w / 2}
          y={y + h / 2 + (i - (lines.length - 1) / 2) * 12 + 3}
          textAnchor="middle"
          fill="white"
          opacity={i === 2 ? 0.6 : 1}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const LIFECYCLE = ['warm-up', 'mount', 'run', 'guard', 'teardown'];

function PipelineVisual() {
  const clis = ['Claude Code', 'Codex', 'CodeBuddy'];
  return (
    <g style={MONO} fontSize="9">
      {LIFECYCLE.map((state, i) => {
        const x = 15 + i * 76;
        const active = state === 'run';
        return (
          <g key={state}>
            <rect x={x} y="10" width="64" height="20" fill={active ? 'white' : 'black'} fillOpacity={active ? 1 : 0.4} stroke="white" />
            <text x={x + 32} y="23.5" textAnchor="middle" fill={active ? 'black' : 'white'}>
              {state}
            </text>
            {i < LIFECYCLE.length - 1 && <path d={`M${x + 64} 20 H${x + 76}`} stroke="white" strokeOpacity="0.6" />}
          </g>
        );
      })}

      <rect x="15" y="46" width="232" height="188" fill="none" stroke="white" strokeOpacity="0.6" strokeDasharray="6 4" />
      <text x="24" y="62" fill="white" opacity="0.8">SANDBOX</text>
      <text x="238" y="62" textAnchor="end" fill="white" opacity="0.5">quota · cpu / mem / pids</text>
      {clis.map((cli, i) => {
        const y = 78 + i * 40;
        return (
          <g key={cli}>
            <path
              d={`M106 ${y + 12} C122 ${y + 12} 122 130 138 130`}
              stroke="white"
              fill="none"
              strokeDasharray="4 4"
              className={FLOW}
            />
            <Box x={28} y={y} w={78} h={24} lines={[cli]} />
          </g>
        );
      })}
      <Box x={138} y={108} w={96} h={44} lines={['Gateway Proxy', 'unified protocol']} />
      <rect x="28" y="200" width="206" height="22" fill="none" stroke="white" strokeOpacity="0.5" />
      <text x="131" y="214.5" textAnchor="middle" fill="white" opacity="0.75">
        workspace · persisted across turns
      </text>

      <path d="M234 130 H278" stroke="white" fill="none" strokeDasharray="4 4" className={FLOW} />
      <text x="256" y="122" textAnchor="middle" fill="white" opacity="0.6">proxy</text>
      <Box x={278} y={92} w={107} h={76} lines={['Host', 'Orchestrator', 'secrets · judge']} />
      <text x="331" y="190" textAnchor="middle" fill="white" opacity="0.6">zero secrets</text>
      <text x="331" y="202" textAnchor="middle" fill="white" opacity="0.6">in sandbox</text>
    </g>
  );
}

const iso = (x: number, y: number, z = 0) => [200 + (x - y) * 19, 128 + (x + y) * 11 - z * 22] as const;
const pt = (x: number, y: number, z = 0) => iso(x, y, z).join(' ');

function Cube({ x, y, h }: { x: number; y: number; h: number }) {
  const corners = [
    [x, y],
    [x + 1, y],
    [x + 1, y + 1],
    [x, y + 1],
  ] as const;
  const top = corners.map(([cx, cy]) => pt(cx, cy, h)).join(' L');
  const bottom = corners.map(([cx, cy]) => pt(cx, cy)).join(' L');
  const verticals = corners.map(([cx, cy]) => `M${pt(cx, cy)} L${pt(cx, cy, h)}`).join(' ');
  return (
    <g stroke="white" fill="none">
      <path d={`M${top} Z`} fill="white" fillOpacity="0.12" />
      <path d={`M${bottom} Z`} strokeOpacity="0.4" />
      <path d={verticals} strokeOpacity="0.8" />
    </g>
  );
}

function SpaceActVisual() {
  const grid = [-3, -2, -1, 0, 1, 2, 3];
  const loop = [
    [-2.5, 1.6],
    [-0.4, 2.6],
    [2.3, 1.4],
    [2.5, -1.1],
    [0.2, -2.7],
    [-2.5, -1.6],
  ];
  const path = `M${loop.map(([x, y]) => pt(x, y)).join(' L')} Z`;
  const [ax, ay] = iso(loop[0][0], loop[0][1]);
  const [tx, ty] = iso(0.5, 1.5, 0.5);

  return (
    <g style={MONO} fontSize="9">
      {grid.map((i) => (
        <g key={i} stroke="white" strokeOpacity="0.18">
          <path d={`M${pt(i, -3)} L${pt(i, 3)}`} />
          <path d={`M${pt(-3, i)} L${pt(3, i)}`} />
        </g>
      ))}
      <Cube x={-2} y={-1.5} h={1} />
      <Cube x={1} y={-2} h={2} />
      <Cube x={0} y={1} h={1} />
      <path d={path} stroke="white" fill="none" strokeDasharray="5 4" className={FLOW} />
      <path
        d={`M${ax} ${ay} L${tx - 4} ${ty - 18} L${tx + 14} ${ty + 8} Z`}
        fill="white"
        fillOpacity="0.12"
        stroke="white"
        strokeOpacity="0.5"
      />
      <circle cx={ax} cy={ay} r="4.5" fill="white" />
      <text x="20" y="24" fill="white" opacity="0.6">t = 0 → T</text>
      <text x="20" y="226" fill="white">closed-loop action</text>
      <text x="20" y="240" fill="white" opacity="0.6">active perception · where to look next</text>
    </g>
  );
}
