export type LayerViz = 'ods' | 'dwd' | 'dws' | 'ads';

const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };

type Role = 0 | 1 | 2 | 3;
// A synthetic session: SP, user, assistant/tool rhythm, a parallel burst, then a second user turn.
const MESSAGES: Role[] = [0, 1, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 1, 2, 3, 2];
const LINE_SIZES = [2, 4, 6, 10, 12, 13, 15, 16];
const LANES = ['SP', 'User Query', 'Assistant', 'Tool'];
const RULES = [['role == "system"'], ['<user_query> only'], ['content · reasoning', '+ tool_calls'], ['tool_call_id ⇄ id']];

function Square({ x, y, role, size = 10, opacity = 1 }: { x: number; y: number; role: Role | 'out'; size?: number; opacity?: number }) {
  if (role === 'out') {
    return (
      <g opacity={opacity}>
        <rect x={x + 0.5} y={y + 0.5} width={size - 1} height={size - 1} fill="none" stroke="white" />
        <circle cx={x + size / 2} cy={y + size / 2} r={1.6} fill="white" />
      </g>
    );
  }
  const common = { x: x + 0.5, y: y + 0.5, width: size - 1, height: size - 1, opacity };
  if (role === 0) return <rect {...common} fill="white" />;
  if (role === 1) return <rect {...common} fill="none" stroke="white" strokeWidth={1.6} />;
  if (role === 2) return <rect {...common} fill="white" fillOpacity={0.55} />;
  return <rect {...common} fill="none" stroke="white" strokeDasharray="2 1.5" />;
}

export default function WarehouseViz({ kind, actions }: { kind: LayerViz; actions: string[] }) {
  return (
    <svg viewBox="0 0 420 240" className="w-full h-full" role="img" aria-hidden="true" style={MONO}>
      {kind === 'ods' && <OdsViz />}
      {kind === 'dwd' && <DwdViz />}
      {kind === 'dws' && <DwsViz />}
      {kind === 'ads' && <AdsViz actions={actions} />}
    </svg>
  );
}

function OdsViz() {
  const raw =
    '{"conversationId":"bc27…","conversationRequestId":"bf90…","requestId":"bf90…","startTime":"2026-07-31 11:50:22","modelRequest":"{\\"messages\\":[{\\"role\\":\\"system\\",\\"content\\":\\"…';
  return (
    <g fontSize="7.5" fill="white">
      <clipPath id="ods-clip">
        <rect x="10" y="4" width="400" height="16" />
      </clipPath>
      <text x="10" y="15" opacity="0.5" clipPath="url(#ods-clip)">
        {raw}
      </text>
      <path d="M10 24 H410" stroke="white" strokeOpacity="0.15" />
      {LINE_SIZES.map((size, row) => {
        const y = 34 + row * 22;
        const previous = row === 0 ? 0 : LINE_SIZES[row - 1];
        return (
          <g key={row}>
            <text x="10" y={y + 8} opacity="0.6">
              L{row + 1}
            </text>
            {MESSAGES.slice(0, size).map((role, i) => (
              <Square key={i} x={34 + i * 12} y={y} role={role} opacity={i < previous ? 0.3 : 1} />
            ))}
            <Square x={34 + size * 12} y={y} role="out" />
            <text x="300" y={y + 8} opacity="0.45">
              {size} msgs · 97 fields
            </text>
          </g>
        );
      })}
      <text x="10" y="228" opacity="0.6">
        faded = repeated from the previous line
      </text>
      <Square x={232} y={220} role="out" size={9} />
      <text x="246" y="228" opacity="0.6">
        = modelResponse
      </text>
    </g>
  );
}

function DwdViz() {
  const last = [...MESSAGES, 'out' as const];
  const bucketX = [12, 114, 216, 318];
  const counts = [0, 0, 0, 0];
  last.forEach((role) => (counts[role === 'out' ? 2 : role] += 1));

  return (
    <g fontSize="7.5" fill="white">
      <text x="12" y="16" opacity="0.6">
        L8 · modelRequest.messages + modelResponse
      </text>
      {last.map((role, i) => {
        const cx = 34 + i * 21 + 6;
        const lane = role === 'out' ? 2 : role;
        const bx = bucketX[lane] + 45;
        return (
          <g key={i}>
            <path
              d={`M${cx} 42 C${cx} 88 ${bx} 84 ${bx} 124`}
              stroke="white"
              strokeOpacity="0.22"
              fill="none"
            />
            <Square x={cx - 6} y={28} role={role} size={12} />
          </g>
        );
      })}
      {LANES.map((lane, i) => (
        <g key={lane}>
          <rect x={bucketX[i]} y="126" width="90" height="56" fill="black" fillOpacity="0.5" stroke="white" />
          <text x={bucketX[i] + 8} y="142" fontSize="8.5" fontWeight="600">
            {lane}
          </text>
          <text x={bucketX[i] + 8} y="170" fontSize="18">
            {counts[i]}
          </text>
          {RULES[i].map((rule, j) => (
            <text key={rule} x={bucketX[i]} y={198 + j * 10} opacity="0.6" fontSize="6.5">
              {rule}
            </text>
          ))}
        </g>
      ))}
      <text x="114" y="226" opacity="0.6" fontSize="6.5" textDecoration="line-through">
        {'<user_info> <rules> stripped'}
      </text>
    </g>
  );
}

const TREE: [number, string][] = [
  [0, 'trace'],
  [1, 'turn 1'],
  [2, 'generation'],
  [3, 'read_file'],
  [2, 'generation'],
  [3, 'search'],
  [3, 'search'],
  [3, 'read_file'],
  [2, 'generation'],
  [3, 'task → sub-agent'],
  [1, 'turn 2'],
  [2, 'generation'],
  [3, 'edit_file'],
];

function DwsViz() {
  const rowY = (i: number) => 20 + i * 17;
  const compression = [4, 8, 14, 22, 30, 38, 46, 54, 6, 10];

  return (
    <g fontSize="7.5" fill="white">
      {TREE.map(([level, label], i) => {
        const y = rowY(i);
        const x = 14 + level * 16;
        return (
          <g key={i}>
            {level > 0 && <path d={`M${x - 10} ${y - 12} V${y - 3} H${x - 3}`} stroke="white" strokeOpacity="0.4" fill="none" />}
            <text x={x} y={y} opacity={level === 3 ? 0.75 : 1} fontWeight={level < 2 ? 600 : 400}>
              {label}
            </text>
          </g>
        );
      })}
      <path d={`M150 ${rowY(5) - 7} h5 V${rowY(7) - 2} h-5`} stroke="white" fill="none" />
      <text x="160" y={rowY(6)} opacity="0.7">
        parallel
      </text>
      <text x="118" y={rowY(10)} opacity="0.7">
        {'⟂ <cb_summary>'}
      </text>

      <path d="M232 10 V232" stroke="white" strokeOpacity="0.15" />

      <text x="244" y="16" opacity="0.7">
        context compression
      </text>
      {compression.map((n, i) => {
        const h = (n / 54) * 44;
        return (
          <rect
            key={i}
            x={246 + i * 16}
            y={68 - h}
            width="11"
            height={h}
            fill="white"
            fillOpacity={i === 8 ? 1 : 0.35}
          />
        );
      })}
      <text x="370" y="56" fontSize="6.5">
        ↓ cb_summary
      </text>

      <text x="244" y="96" opacity="0.7">
        parallel · a t t t
      </text>
      {([2, 3, 3, 3] as Role[]).map((role, i) => (
        <Square key={`p${i}`} x={330 + i * 13} y={88} role={role} />
      ))}
      <text x="244" y="118" opacity="0.7">
        serial · a t a t
      </text>
      {([2, 3, 2, 3] as Role[]).map((role, i) => (
        <Square key={`s${i}`} x={330 + i * 13} y={110} role={role} />
      ))}

      <text x="244" y="150" opacity="0.7">
        sub-agent dispatch
      </text>
      <text x="244" y="172" opacity="0.5" fontSize="6.5">
        main
      </text>
      <path d="M266 170 H410" stroke="white" />
      {[276, 300, 380, 404].map((x) => (
        <circle key={x} cx={x} cy="170" r="2.5" fill="white" />
      ))}
      <path d="M310 170 C320 170 318 205 332 205 H356 C368 205 366 170 376 170" stroke="white" strokeDasharray="3 2" fill="none" />
      <text x="244" y="208" opacity="0.5" fontSize="6.5">
        sub
      </text>
      <text x="334" y="220" opacity="0.7" fontSize="6.5">
        own SP · own requestId
      </text>
    </g>
  );
}

// 40 synthetic calls: 0 retrieve, 1 plan, 2 change, 3 execute, 4 verify.
const RIBBON = [0, 0, 0, 1, 0, 0, 1, 2, 3, 2, 0, 2, 3, 4, 2, 2, 3, 0, 2, 3, 4, 1, 2, 2, 3, 4, 0, 2, 3, 3, 4, 2, 3, 4, 4, 2, 3, 4, 4, 4];

function ActionFill({ kind, x, y, w, h }: { kind: number; x: number; y: number; w: number; h: number }) {
  if (kind === 0) return <rect x={x} y={y} width={w} height={h} fill="white" />;
  if (kind === 1) return <rect x={x} y={y} width={w} height={h} fill="white" fillOpacity={0.62} />;
  if (kind === 2) return <rect x={x} y={y} width={w} height={h} fill="white" fillOpacity={0.3} />;
  if (kind === 3) return <rect x={x} y={y} width={w} height={h} fill="url(#ads-hatch)" />;
  return <rect x={x + 0.5} y={y + 0.5} width={Math.max(0, w - 1)} height={Math.max(0, h - 1)} fill="none" stroke="white" />;
}

function AdsViz({ actions }: { actions: string[] }) {
  const deciles = Array.from({ length: 10 }, (_, d) => {
    const chunk = RIBBON.slice(d * 4, d * 4 + 4);
    return [0, 1, 2, 3, 4].map((k) => chunk.filter((v) => v === k).length / chunk.length);
  });

  return (
    <g fontSize="7.5" fill="white">
      <defs>
        <pattern id="ads-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <path d="M0 0 V4" stroke="white" strokeWidth="1.6" />
        </pattern>
      </defs>
      <text x="12" y="14" opacity="0.7">
        action ribbon · 40 calls
      </text>
      {RIBBON.map((kind, i) => (
        <ActionFill key={i} kind={kind} x={12 + i * 9.9} y={22} w={9} h={18} />
      ))}
      {actions.map((label, i) => (
        <g key={label}>
          <ActionFill kind={i} x={12 + i * 80} y={52} w={10} h={10} />
          <text x={27 + i * 80} y={60}>
            {label}
          </text>
        </g>
      ))}

      <text x="12" y="88" opacity="0.7">
        progress deciles
      </text>
      {deciles.map((shares, d) => {
        let top = 196;
        return (
          <g key={d}>
            {shares.map((share, k) => {
              const h = share * 94;
              top -= h;
              return share > 0 ? <ActionFill key={k} kind={k} x={40 + d * 36} y={top} w={26} h={h} /> : null;
            })}
          </g>
        );
      })}
      <text x="40" y="210" opacity="0.5">
        0%
      </text>
      <text x="370" y="210" opacity="0.5">
        100%
      </text>
      <text x="12" y="232" opacity="0.7">
        {'operator_hits · badcase · → export.jsonl'}
      </text>
    </g>
  );
}
