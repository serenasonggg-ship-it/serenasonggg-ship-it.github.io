import type { Lang } from '../data';
import type { LayerViz } from './WarehouseViz';

type Step = { title: string; text: string };
type Constraint = { id: string; text: string; type: string; judge: string; before: boolean };

export type TrajectoryContent = {
  pageTitle: string;
  back: string;
  langToggle: string;
  hero: {
    badge: string;
    title: string;
    summary: string;
    role: string;
    stats: { value: string; label: string }[];
  };
  warehouse: {
    eyebrow: string;
    heading: string;
    lead: string;
    sourcesTitle: string;
    sources: Step[];
    chaosTitle: string;
    chaos: string[];
    lanes: [string, string, string, string];
    captions: { chaos: string; structured: string };
    toggle: { toStructure: string; toChaos: string };
    layers: { code: string; name: string; text: string; schema: string; fixes: string; viz: LayerViz }[];
    fixesLabel: string;
    actions: string[];
  };
  operators: {
    eyebrow: string;
    heading: string;
    lead: string;
    output: { label: string; text: string }[];
    groupsTitle: string;
    groups: { name: string; n: number; desc: string }[];
    views: { title: string; items: Step[] };
    calibration: { title: string; formula: string; text: string };
  };
  loop: { eyebrow: string; heading: string; steps: Step[]; causesTitle: string; causes: string[] };
  sft: {
    eyebrow: string;
    heading: string;
    lead: string;
    steps: Step[];
    demo: {
      title: string;
      instruction: string;
      columns: { constraint: string; type: string; judge: string };
      before: string;
      after: string;
      constraints: Constraint[];
      outputs: string[];
    };
  };
  assistant: { eyebrow: string; heading: string; lead: string; tools: string[]; rules: Step[] };
  footer: string;
};

export const trajectoryContent: Record<Lang, TrajectoryContent> = {
  zh: {
    pageTitle: 'Agent 轨迹分析平台 — 宋月',
    back: '← 返回主页',
    langToggle: 'EN',
    hero: {
      badge: '独立开发',
      title: 'Agent 轨迹分析平台',
      summary: '把每一条 Agent 轨迹，变成可读、可比、可归因的证据，再把失败变成训练数据。',
      role: '从轨迹解析、错误分析算子、数据回流到前端界面，全部由我独立设计与开发。',
      stats: [
        { value: '97', label: '错误分析算子' },
        { value: '41 / 56', label: '规则判定 / LLM 判定' },
        { value: '11', label: '问题大类' },
        { value: '6', label: '回流去向' },
      ],
    },
    warehouse: {
      eyebrow: '01 · 从混沌到结构',
      heading: '三路回流数据，一座四层数仓',
      lead: '原始轨迹不是给人看的：它是网关逐次落盘的日志，字段多、嵌套深、内容层层重复。平台要做的第一件事，是把它拆成清晰、可查询的结构。',
      sourcesTitle: '数据来源',
      sources: [
        { title: 'WorkBuddy 回流', text: '办公 Agent 的真实会话轨迹' },
        { title: 'CodeBuddy 回流', text: '编码 Agent 的真实会话轨迹' },
        { title: '司内产物', text: '内部评测交付包与人评' },
      ],
      chaosTitle: '原始轨迹有多乱',
      chaos: [
        '一次模型调用落一行，每行 97 个字段',
        'modelRequest / modelResponse 是字符串里再套一层 JSON',
        '每行 messages 都是到此刻为止的完整对话，层层滚雪球',
        'user 消息裹着 <user_info>、<rules> 等环境外壳',
        '对话过长时，历史被折成一段 <cb_summary>',
        '主 agent 与子 agent 的调用混在同一份日志里',
      ],
      lanes: ['SP', 'User Query', 'Assistant', 'Tool'],
      captions: {
        chaos: '原始日志：一次调用一行，消息层层重复，外壳与正文混在一起',
        structured: '按 role 拆进四条泳道，按真实调用顺序排开',
      },
      toggle: { toStructure: '拆解', toChaos: '还原为原始日志' },
      fixesLabel: '解决',
      actions: ['检索', '规划', '变更', '执行', '验证'],
      layers: [
        {
          code: 'ODS',
          viz: 'ods',
          name: '原始层 · 原样接入',
          text: '三路来源统一落为 NDJSON，一次模型调用一行，保留全部原始字段，不做任何改写，任何结论都能回溯到原文。',
          schema: 'conversationId · conversationRequestId · requestId · startTime · modelRequest · modelResponse …',
          fixes: '来源不一、格式不一',
        },
        {
          code: 'DWD',
          viz: 'dwd',
          name: '明细层 · 解析与去重',
          text: '展开字符串里的 JSON；每轮只取最后一行，用相邻行的差分还原增量；按 role 拆成 SP / User Query / Assistant / Tool，剥掉环境外壳，tool_call_id 认领各自的调用。',
          schema: 'message(role, content, reasoning, tool_calls[], tool_call_id)',
          fixes: '嵌套 JSON、消息雪球、外壳混杂',
        },
        {
          code: 'DWS',
          viz: 'dws',
          name: '汇总层 · 拼成结构',
          text: '用会话、轮次、请求三级 ID 串成 trace → turn → generation → tool 四级步骤树；识别上下文压缩、子 agent 派发，以及并行与串行调用。',
          schema: 'trace ▸ turn ▸ generation ▸ tool',
          fixes: '压缩断档、主子 agent 混杂',
        },
        {
          code: 'ADS',
          viz: 'ads',
          name: '应用层 · 面向分析',
          text: '行为画像（检索、规划、变更、执行、验证五类动作）、时序 pattern、97 个算子的判定结果、Bad Case 复核与回流导出。',
          schema: 'profile · pattern · operator_hits · badcase · export.jsonl',
          fixes: '看不出模型怎么做、错在哪',
        },
      ],
    },
    operators: {
      eyebrow: '02 · 错误分析算子',
      heading: '97 个可插拔算子，每一个都要拿出证据',
      lead: '每个算子读一条轨迹或一整道题，只做一件事：判断某一种失败是否发生。规则能判的用代码，语义问题才交给 LLM。',
      output: [
        { label: '是否命中', text: '命中 / 未命中 / 判不了' },
        { label: '严重度', text: '决定是否进入待复核' },
        { label: '证据', text: '命中的步号与工具返回原文' },
      ],
      groupsTitle: '问题大类 · 算子数',
      groups: [
        { name: '决策与方案', n: 22, desc: '前提未验证、歧义不澄清、方案静默降级、失败路线反复坚持' },
        { name: '工具调用', n: 15, desc: '调用不存在的工具、参数错、解析失败、编辑失败未恢复' },
        { name: '完成与交付', n: 14, desc: '没跑完、空回复、交付物缺失、完成度夸大' },
        { name: '执行与落地', n: 12, desc: '证据没用上、反证被放过、想做与实做不一致' },
        { name: '任务理解与验证', n: 11, desc: '意图偏差、目标漂移、要求漏做、改代码不验证' },
        { name: '文本与语言', n: 6, desc: '乱码、标点刷屏、大段空行、回复语言不一致' },
        { name: '重复与循环', n: 5, desc: '原样重做、重复调用、复读文字、循环走不出' },
        { name: '协议泄漏', n: 4, desc: 'think / tool call 标签漏进正文' },
        { name: '事实与依据', n: 4, desc: '无依据编造、证据不足却定论、计算与领域规则错误' },
        { name: '环境与平台', n: 3, desc: '工具被取消、沙箱异常等外因，不直接归罪模型' },
        { name: '综合评分', n: 1, desc: '完成、验证、效率、恢复、交付五维加权质量分' },
      ],
      views: {
        title: '同一批算子，三种看法',
        items: [
          { title: '按问题性质', text: '错在哪种机制上，用于归因' },
          { title: '按检测层', text: '在哪一层查出来，决定数据是修还是滤' },
          { title: '按阶段', text: '理解 → 检索 → 规划 → 变更 / 执行 → 验证 → 交付，定位该补哪段能力' },
        ],
      },
      calibration: {
        title: '算子校准：用人评检验算子',
        formula: '提升度 = 低分轨迹命中率 ÷ 高分轨迹命中率',
        text: '低分里命中多、高分里命中少的算子才可信。提升度低于 1.5 会被标黄，LLM 类算子必须先过校准才启用。',
      },
    },
    loop: {
      eyebrow: '03 · 统计 → 复核 → 回流',
      heading: '算子只负责发现，结论要经过复核',
      steps: [
        { title: '统计', text: '漏斗、信号 × 模型热力图、算子校准，以及题目健康度：全员失败、高区分度、已饱和。' },
        { title: '复核', text: '在同一处看题面、人评与算子证据，判定归因与失败模式。复核结论独立存储，算子重算不会覆盖人工判断。' },
        { title: '回流', text: '按去向打包：训练集（负样本、偏好对、改写 SFT）或评测集（能力集、回归集），导出 JSONL。' },
      ],
      causesTitle: '归因对象',
      causes: ['模型', '题目', '评分', '脚手架'],
    },
    sft: {
      eyebrow: '04 · Bad Case → SFT',
      heading: '借鉴 AgentIF，把失败改写成可验证的训练数据',
      lead: 'AgentIF 把 Agent 场景里的长指令拆成原子约束，并为每条约束配上代码、LLM 或混合判定。我把这套思路反过来用：先找出 bad case 违反了哪条约束，再只保留逐条通过校验的改写轨迹。',
      steps: [
        { title: '拆约束', text: '把 SP、工具说明与用户指令拆成原子约束，分格式、语义、工具三类，以及条件、示例等结构。' },
        { title: '定位违反', text: '用算子证据把 bad case 对齐到被违反的约束和出错步号。' },
        { title: '改写合成', text: '保留出错前的上下文，从出错步开始改写，生成满足全部约束的轨迹。' },
        { title: '逐条校验', text: '每条约束按它的判定方式重新检查，全部通过才入库，任何一条不过就丢弃。' },
        { title: '导出', text: '改写轨迹作为 SFT 样本，原始与改写配成偏好对，导出 JSONL。' },
      ],
      demo: {
        title: '示意：一条 bad case 的约束清单',
        instruction: '「修复登录页的报错，并确认测试通过。」',
        columns: { constraint: '约束', type: '类型', judge: '判定' },
        before: '原轨迹',
        after: '改写后',
        constraints: [
          { id: 'C1', text: '编辑文件前先读取该文件', type: '工具', judge: '代码', before: false },
          { id: 'C2', text: '修改代码后必须运行测试', type: '工具 · 条件', judge: '代码', before: false },
          { id: 'C3', text: '测试失败时不得宣称已完成', type: '语义 · 条件', judge: 'LLM', before: false },
          { id: 'C4', text: '不删除与任务无关的文件', type: '语义', judge: '混合', before: true },
          { id: 'C5', text: '最终回复使用中文', type: '格式', judge: '代码', before: true },
        ],
        outputs: ['改写 SFT', '偏好对', '负样本'],
      },
    },
    assistant: {
      eyebrow: '05 · 链路分析助手',
      heading: '不是把轨迹塞进提示词，而是一个取证 harness',
      lead: '模型手里只有一组只读工具，必须自己翻原文、搜关键词，再带着步号回答「为什么只得 3 分、从哪一步开始出问题」。',
      tools: ['overview', 'list_steps', 'get_step', 'search', 'get_conversation', 'get_prompt', 'glossary'],
      rules: [
        { title: '没看全就说明', text: '每次返回都带分页标记；断言「没做过某事」前必须先搜索。' },
        { title: '引用自检', text: '引用不存在的步号，或没读原文就下结论，回答上方会出现告警。' },
        { title: '三重预算', text: '最多 14 轮工具调用、22 万字返回、210 秒；预算耗尽就用已有证据作答，并标注未核实项。' },
      ],
    },
    footer: '页面示例均为脱敏或合成数据，不包含内部系统界面与业务数据。',
  },
  en: {
    pageTitle: 'Agent Trajectory Analysis Platform — Song Yue',
    back: '← Back to home',
    langToggle: '中文',
    hero: {
      badge: 'Built solo',
      title: 'Agent Trajectory Analysis Platform',
      summary: 'Turning every agent trajectory into evidence you can read, compare and attribute — and every failure into training data.',
      role: 'Trace parsing, error-analysis operators, data feedback and the front end — all designed and built by me.',
      stats: [
        { value: '97', label: 'Error-analysis operators' },
        { value: '41 / 56', label: 'Rule-based / LLM-based' },
        { value: '11', label: 'Failure categories' },
        { value: '6', label: 'Feedback destinations' },
      ],
    },
    warehouse: {
      eyebrow: '01 · From chaos to structure',
      heading: 'Three feedback streams, one four-layer warehouse',
      lead: 'Raw trajectories are not meant for humans: they are gateway logs written call by call — dozens of fields, deep nesting and content repeated over and over. The platform’s first job is to break them into a clean, queryable structure.',
      sourcesTitle: 'Sources',
      sources: [
        { title: 'WorkBuddy feedback', text: 'Real sessions from the office agent' },
        { title: 'CodeBuddy feedback', text: 'Real sessions from the coding agent' },
        { title: 'Internal artifacts', text: 'Eval delivery packages and human ratings' },
      ],
      chaosTitle: 'How messy the raw data is',
      chaos: [
        'One line per model call, 97 fields per line',
        'modelRequest / modelResponse are JSON nested inside strings',
        'Every line repeats the whole conversation so far — a growing snowball',
        'User messages are wrapped in <user_info>, <rules> and other environment shells',
        'Long histories get folded into a single <cb_summary>',
        'Main-agent and sub-agent calls are interleaved in one log',
      ],
      lanes: ['SP', 'User Query', 'Assistant', 'Tool'],
      captions: {
        chaos: 'Raw log: one line per call, messages repeated, shells mixed with content',
        structured: 'Split by role into four lanes, laid out in true call order',
      },
      toggle: { toStructure: 'Decompose', toChaos: 'Back to raw log' },
      fixesLabel: 'Fixes',
      actions: ['Retrieve', 'Plan', 'Change', 'Execute', 'Verify'],
      layers: [
        {
          code: 'ODS',
          viz: 'ods',
          name: 'Raw layer · ingest as-is',
          text: 'All three sources land as NDJSON, one line per model call, every original field kept untouched — so any conclusion can be traced back to the source.',
          schema: 'conversationId · conversationRequestId · requestId · startTime · modelRequest · modelResponse …',
          fixes: 'Mixed sources and formats',
        },
        {
          code: 'DWD',
          viz: 'dwd',
          name: 'Detail layer · parse and de-duplicate',
          text: 'Unpack the nested JSON; keep only the last line per turn and recover increments by diffing adjacent lines; split by role into SP / User Query / Assistant / Tool, strip environment shells, and match each tool result to its call by tool_call_id.',
          schema: 'message(role, content, reasoning, tool_calls[], tool_call_id)',
          fixes: 'Nested JSON, snowballing messages, shells',
        },
        {
          code: 'DWS',
          viz: 'dws',
          name: 'Summary layer · assemble the structure',
          text: 'Chain session, turn and request IDs into a four-level trace → turn → generation → tool tree; detect context compression, sub-agent dispatch, and parallel versus serial calls.',
          schema: 'trace ▸ turn ▸ generation ▸ tool',
          fixes: 'Compression gaps, interleaved agents',
        },
        {
          code: 'ADS',
          viz: 'ads',
          name: 'Application layer · ready for analysis',
          text: 'Behavior profiles (retrieve, plan, change, execute, verify), temporal patterns, verdicts from 97 operators, bad-case review and feedback exports.',
          schema: 'profile · pattern · operator_hits · badcase · export.jsonl',
          fixes: 'No view of how models work or where they fail',
        },
      ],
    },
    operators: {
      eyebrow: '02 · Error-analysis operators',
      heading: '97 pluggable operators — each one must show its evidence',
      lead: 'Each operator reads one trajectory or one task and answers a single question: did this specific failure happen? Rules handle what code can decide; only semantic questions go to an LLM.',
      output: [
        { label: 'Hit', text: 'hit / miss / undecidable' },
        { label: 'Severity', text: 'decides whether it enters review' },
        { label: 'Evidence', text: 'step numbers and raw tool output' },
      ],
      groupsTitle: 'Categories · operator count',
      groups: [
        { name: 'Decisions & planning', n: 22, desc: 'Unverified premises, unclarified ambiguity, silent downgrades, persisting with failed routes' },
        { name: 'Tool use', n: 15, desc: 'Nonexistent tools, bad arguments, parse failures, unrecovered edit failures' },
        { name: 'Completion & delivery', n: 14, desc: 'Unfinished runs, empty replies, missing deliverables, overstated completion' },
        { name: 'Execution', n: 12, desc: 'Evidence ignored, counter-evidence dismissed, plan and action diverge' },
        { name: 'Understanding & verification', n: 11, desc: 'Intent mismatch, goal drift, missed requirements, unverified code changes' },
        { name: 'Text & language', n: 6, desc: 'Garbled text, punctuation floods, blank blocks, wrong reply language' },
        { name: 'Repetition & loops', n: 5, desc: 'Redoing work verbatim, repeated calls, looping without exit' },
        { name: 'Protocol leakage', n: 4, desc: 'think / tool-call tags leaking into replies' },
        { name: 'Facts & grounding', n: 4, desc: 'Fabrication, conclusions without evidence, calculation and domain-rule errors' },
        { name: 'Environment', n: 3, desc: 'Cancelled tools and sandbox errors — not blamed on the model by default' },
        { name: 'Overall score', n: 1, desc: 'Weighted quality across completion, verification, efficiency, recovery and delivery' },
      ],
      views: {
        title: 'One set of operators, three lenses',
        items: [
          { title: 'By nature', text: 'Which mechanism failed — for attribution' },
          { title: 'By detection layer', text: 'Where it was caught — decides whether data is fixed or filtered' },
          { title: 'By stage', text: 'Understand → retrieve → plan → change / execute → verify → deliver — shows which capability to train' },
        ],
      },
      calibration: {
        title: 'Calibration: operators are tested against human ratings',
        formula: 'Lift = hit rate on low-scored traces ÷ hit rate on high-scored traces',
        text: 'Only operators that fire often on low scores and rarely on high scores are trusted. Lift below 1.5 is flagged, and LLM operators must pass calibration before use.',
      },
    },
    loop: {
      eyebrow: '03 · Measure → Review → Feed back',
      heading: 'Operators find candidates; people confirm the verdict',
      steps: [
        { title: 'Measure', text: 'Funnels, signal × model heatmaps, operator calibration and task health: all-fail, highly discriminative or saturated.' },
        { title: 'Review', text: 'Task, human ratings and operator evidence in one place to settle attribution and failure mode. Reviews are stored separately, so re-running operators never overwrites human judgment.' },
        { title: 'Feed back', text: 'Package by destination — training sets (negatives, preference pairs, rewritten SFT) or eval sets (capability, regression) — exported as JSONL.' },
      ],
      causesTitle: 'Attributed to',
      causes: ['Model', 'Task', 'Grader', 'Harness'],
    },
    sft: {
      eyebrow: '04 · Bad case → SFT',
      heading: 'Inspired by AgentIF: rewriting failures into verifiable training data',
      lead: 'AgentIF breaks long agentic instructions into atomic constraints, each with a code, LLM or hybrid evaluator. I run the idea in reverse: find which constraints a bad case violated, then keep only rewrites that pass every check.',
      steps: [
        { title: 'Extract constraints', text: 'Split the SP, tool specs and user request into atomic constraints — formatting, semantic and tool — including conditional and example-based ones.' },
        { title: 'Locate violations', text: 'Use operator evidence to align each bad case with the violated constraints and the failing step.' },
        { title: 'Rewrite', text: 'Keep the context before the failure and rewrite from the failing step so the trajectory satisfies every constraint.' },
        { title: 'Verify each', text: 'Re-check every constraint with its own evaluator. Keep only if all pass; drop it if any fails.' },
        { title: 'Export', text: 'Rewrites become SFT samples, original and rewrite form preference pairs, exported as JSONL.' },
      ],
      demo: {
        title: 'Example: the constraint checklist of one bad case',
        instruction: '"Fix the error on the login page and make sure the tests pass."',
        columns: { constraint: 'Constraint', type: 'Type', judge: 'Judge' },
        before: 'Original',
        after: 'Rewritten',
        constraints: [
          { id: 'C1', text: 'Read a file before editing it', type: 'Tool', judge: 'Code', before: false },
          { id: 'C2', text: 'Run tests after changing code', type: 'Tool · Conditional', judge: 'Code', before: false },
          { id: 'C3', text: 'Never claim done when tests fail', type: 'Semantic · Conditional', judge: 'LLM', before: false },
          { id: 'C4', text: 'Do not delete unrelated files', type: 'Semantic', judge: 'Hybrid', before: true },
          { id: 'C5', text: 'Reply in the user’s language', type: 'Formatting', judge: 'Code', before: true },
        ],
        outputs: ['Rewritten SFT', 'Preference pair', 'Negative sample'],
      },
    },
    assistant: {
      eyebrow: '05 · Trace analysis assistant',
      heading: 'Not a prompt stuffed with a trace — an evidence-gathering harness',
      lead: 'The model only has read-only tools. It must open the raw trace and search it itself, then answer "why only 3 points, and where did it go wrong?" with step numbers.',
      tools: ['overview', 'list_steps', 'get_step', 'search', 'get_conversation', 'get_prompt', 'glossary'],
      rules: [
        { title: 'Say when unseen', text: 'Every response carries paging markers; before claiming something never happened, it must search.' },
        { title: 'Citation self-check', text: 'Citing a nonexistent step, or concluding without reading the raw trace, raises a warning above the answer.' },
        { title: 'Triple budget', text: 'At most 14 tool rounds, 220k characters and 210 seconds; when exhausted, it answers with what it has and marks unverified points.' },
      ],
    },
    footer: 'All examples on this page are anonymized or synthetic and contain no internal interfaces or business data.',
  },
};
