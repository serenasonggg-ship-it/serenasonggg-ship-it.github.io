export type Lang = 'zh' | 'en';

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  unit?: string;
  description: string;
  highlights?: { label: string; headline: string; detail: string }[];
};

export type OtherExperience = {
  org: string;
  unit?: string;
  title: string;
  description: string;
  tags?: string[];
};

export type Achievement = {
  metric: string;
  title: string;
  description: string;
  link?: string;
};

export type Content = {
  pageTitle: string;
  nav: { about: string; timeline: string; achievements: string; contact: string };
  langToggle: string;
  hero: {
    greeting: string;
    name: string;
    roles: string[];
    tagline: string;
    location: string;
    scroll: string;
  };
  timeline: {
    heading: [string, string];
    items: TimelineItem[];
  };
  other: {
    heading: string;
    items: OtherExperience[];
  };
  achievements: {
    heading: [string, string];
    summary: string;
    cta: string;
    items: Achievement[];
  };
};

export const email = 'xxsongtz@163.com';

export const content: Record<Lang, Content> = {
  zh: {
    pageTitle: '宋月 — 个人主页',
    nav: { about: '关于我', timeline: '经历', achievements: '成果', contact: '联系我' },
    langToggle: 'EN',
    hero: {
      greeting: '你好，我是',
      name: '宋月',
      roles: ['大模型评测专家', 'AI Agent 架构师', 'AI 产品经理'],
      tagline: '站在科技与人文的交叉路口。',
      location: '中国 · 深圳 / 北京',
      scroll: '向下滚动',
    },
    timeline: {
      heading: ['我的', '经历'],
      items: [
        {
          period: '2026.04 — 至今',
          title: '大模型评测 · Agent 轨迹分析',
          org: '腾讯',
          unit: 'TEG · 基础模型部',
          description: '让 Agent 的每一次失败，都成为模型进化的线索。',
          highlights: [
            {
              label: '轨迹分析',
              headline: '从 0 到 1 搭建 Agent 轨迹分析平台',
              detail: '覆盖轨迹可视化、多轮评测、LLM-as-a-Judge 失败模式挖掘与数据回流，已接入 CodeBuddy、WorkBuddy 等产品线。',
            },
            {
              label: 'Benchmark',
              headline: '主导金融、经济、Coding 领域 Benchmark 建设',
              detail: '覆盖前端 Web / 3D 等场景，打通 Taxonomy 设计、Rubric 评分到 Agent-as-Judge 自动化评测全链路。',
            },
            {
              label: '模型评测',
              headline: '负责混元 3 Preview 至混元 4 版本评测',
              detail: '输出版本间能力对比，为模型迭代提供可量化的决策依据。',
            },
          ],
        },
        {
          period: '2024 — 至今',
          title: '硕士 · 计算传播（主修）· 金融（辅修）',
          org: '北京大学',
          description: '人机交互（HCI）方向，研究人与 AI 如何彼此塑造。',
          highlights: [
            {
              label: '已发表',
              headline: '2 篇 CSCW 论文（CCF-A）',
              detail: '审计大模型在科研知识中介中的开放获取偏向；揭示 AI 编程工具与开源参与门槛之间的悖论。',
            },
            {
              label: '在投',
              headline: 'CHI、New Media & Society 各 1 篇',
              detail: '研究 AI 评论如何影响创作者的持续产出；审计文生图模型在性暴力叙事中对受害者形象的偏见。',
            },
          ],
        },
        {
          period: '2020 — 2024',
          title: '测试开发工程师',
          org: 'Veeva Systems',
          unit: 'Global CRM',
          description: '在跨国团队中，为全球医药行业的 CRM 守住质量底线。',
          highlights: [
            {
              label: '跨国协作',
              headline: '与全球团队协同交付 Global CRM',
              detail: '覆盖 Salesforce 平台与企业微信集成两条产品线，服务 20+ 家全球医药企业。',
            },
            {
              label: '质量工程',
              headline: '负责前后端自动化测试、性能测试与日志排查',
              detail: '编写测试脚本、建立性能基线、定位线上问题，保障多时区协作下的稳定发布。',
            },
            {
              label: '项目交付',
              headline: '获 2024 年 Veeva 重点项目管理奖',
              detail: '推进 MSD 与企业微信集成项目，协调多职能角色，发布周期缩短 40%。',
            },
          ],
        },
      ],
    },
    other: {
      heading: '其他经历',
      items: [
        {
          org: '华泰证券',
          unit: '研究所 · 电子组',
          title: '电子行业研究员（实习）',
          description: '在产业周期里，寻找硬科技的确定性。',
          tags: ['半导体', '人形机器人'],
        },
        {
          org: '腾讯',
          unit: 'IEG · Global',
          title: '项目管理 PMO（实习）',
          description: '让跨区域的游戏项目，按节奏落地。',
          tags: ['全球化', '项目管理'],
        },
      ],
    },
    achievements: {
      heading: ['代表', '成果'],
      summary:
        '我关注 AI 如何改变人获取知识与协作的方式：在工业界搭建大模型评测体系，在学术界用算法审计与实证研究检验 AI 的社会影响。',
      cta: '联系我',
      items: [
        {
          metric: 'CSCW',
          title: 'Do LLMs Read for Free? Auditing the Open Access Bias in AI-Mediated Science',
          description: '已发表 · CCF-A。审计大模型在科研知识中介中对开放获取文献的系统性偏向。',
        },
        {
          metric: 'CSCW',
          title:
            'The Productivity-Entry Paradox: AI Coding Tools Boost Output but Do Not Lower Barriers to Open-Source Contribution',
          description: '已发表 · CCF-A。发现 AI 编程工具提升了开发者产出，却没有降低新人参与开源的门槛。',
        },
        {
          metric: 'ICLR',
          title:
            'Belief Elicitation Is an Intervention: Measuring and Manufacturing Belief-Action Consistency in Language Models',
          description: '在投 · CCF-A。揭示「询问模型信念」本身即是一种干预，并提出度量与塑造语言模型信念—行动一致性的方法。',
        },
        {
          metric: 'CHI',
          title:
            'Human Comments Sustain; AI Comments Suppress: Source-Disaggregated Feedback and Content Production on an AI-Native Social Platform',
          description: '在投 · CCF-A。区分评论来源，研究 AI 原生社交平台上人类评论与 AI 评论对创作者持续产出的不同影响。',
        },
        {
          metric: 'NM&S',
          title:
            'Re-symbolizing Victim Trauma in Sexual Violence: A Prompt Engineering Approach to Understanding Bias in AI-powered Text-to-Image Technologies?',
          description: '在投 · New Media & Society。以提示工程方法审计文生图模型在性暴力叙事中对受害者形象的偏见。',
        },
        {
          metric: 'arXiv',
          title:
            'SpaceAct: Benchmarking 3D Spatial and Temporal Reasoning via Closed-Loop Action and Active Perception',
          description: '在投 · arXiv 预印本。构建闭环动作与主动感知下的 3D 空间与时间推理 Benchmark。',
        },
      ],
    },
  },
  en: {
    pageTitle: 'Song Yue — Portfolio',
    nav: { about: 'ABOUT', timeline: 'TIMELINE', achievements: 'ACHIEVEMENTS', contact: 'GET IN TOUCH' },
    langToggle: '中文',
    hero: {
      greeting: "Hi, I'm",
      name: 'Song Yue',
      roles: ['LLM Evaluation Specialist', 'AI Agent Architect', 'AI Product Manager'],
      tagline: 'Standing at the crossroads of technology and the humanities.',
      location: 'Shenzhen / Beijing, China',
      scroll: 'scroll',
    },
    timeline: {
      heading: ['My journey', 'so far'],
      items: [
        {
          period: 'Apr 2026 — Present',
          title: 'LLM Evaluation · Agent Trajectory Analysis',
          org: 'Tencent',
          unit: 'TEG · Foundation Model Department',
          description: 'Turning how agents fail into how models improve.',
          highlights: [
            {
              label: 'Trajectory',
              headline: 'Agent trajectory analysis platform, built from scratch',
              detail: 'Covers trajectory visualization, multi-turn evaluation, LLM-as-a-Judge failure-mode mining and data feedback; adopted by CodeBuddy, WorkBuddy and more.',
            },
            {
              label: 'Benchmarks',
              headline: 'Benchmark lead for finance, economics and coding',
              detail: 'Including front-end Web / 3D, spanning taxonomy design, rubric scoring and fully automated Agent-as-Judge evaluation.',
            },
            {
              label: 'Releases',
              headline: 'Release evaluation owner, Hunyuan 3 Preview to Hunyuan 4',
              detail: 'Delivered cross-version capability comparisons that turn model iteration into measurable decisions.',
            },
          ],
        },
        {
          period: '2024 — Present',
          title: 'M.S. · Computational Communication (Major) · Finance (Minor)',
          org: 'Peking University',
          description: 'HCI research on how people and AI shape each other.',
          highlights: [
            {
              label: 'Published',
              headline: '2 papers at CSCW (CCF-A)',
              detail: 'Auditing open-access bias in AI-mediated science; uncovering the productivity-entry paradox of AI coding tools in open source.',
            },
            {
              label: 'In review',
              headline: 'One each at CHI and New Media & Society',
              detail: 'How AI comments shape creators’ sustained output; how text-to-image models portray victims in sexual-violence narratives.',
            },
          ],
        },
        {
          period: '2020 — 2024',
          title: 'Software Development Engineer in Test',
          org: 'Veeva Systems',
          unit: 'Global CRM',
          description: 'Guarding quality for a global life-sciences CRM, across borders and time zones.',
          highlights: [
            {
              label: 'Global team',
              headline: 'Global CRM delivery across worldwide teams',
              detail: 'Across the Salesforce platform and WeCom integration, serving 20+ global pharmaceutical companies.',
            },
            {
              label: 'Quality',
              headline: 'Front-end and back-end test automation, performance testing and log analysis',
              detail: 'Wrote test suites, set performance baselines and traced production issues to keep releases stable across time zones.',
            },
            {
              label: 'Delivery',
              headline: 'Veeva Key Project Management Award, 2024',
              detail: 'Drove the MSD × WeCom integration across multiple functions, cutting the release cycle by 40%.',
            },
          ],
        },
      ],
    },
    other: {
      heading: 'Also',
      items: [
        {
          org: 'Huatai Securities',
          unit: 'Research Institute · Electronics',
          title: 'Equity Research Intern',
          description: 'Seeking conviction in hard tech through the industry cycle.',
          tags: ['Semiconductors', 'Humanoid robots'],
        },
        {
          org: 'Tencent',
          unit: 'IEG · Global',
          title: 'PMO Intern',
          description: 'Keeping cross-regional game projects on cadence.',
          tags: ['Globalization', 'Program management'],
        },
      ],
    },
    achievements: {
      heading: ['Selected', 'achievements'],
      summary:
        'I study how AI reshapes the way people access knowledge and collaborate — building LLM evaluation systems in industry, and testing AI’s social impact through algorithmic audits and empirical research in academia.',
      cta: 'Get in touch',
      items: [
        {
          metric: 'CSCW',
          title: 'Do LLMs Read for Free? Auditing the Open Access Bias in AI-Mediated Science',
          description: 'Published · CCF-A. Audits how LLMs systematically favor open-access literature when mediating scientific knowledge.',
        },
        {
          metric: 'CSCW',
          title:
            'The Productivity-Entry Paradox: AI Coding Tools Boost Output but Do Not Lower Barriers to Open-Source Contribution',
          description: 'Published · CCF-A. Shows that AI coding tools raise developer output without lowering the barrier for newcomers to open source.',
        },
        {
          metric: 'ICLR',
          title:
            'Belief Elicitation Is an Intervention: Measuring and Manufacturing Belief-Action Consistency in Language Models',
          description: 'Under review · CCF-A. Shows that asking a model what it believes is itself an intervention, and introduces methods to measure and shape belief-action consistency in language models.',
        },
        {
          metric: 'CHI',
          title:
            'Human Comments Sustain; AI Comments Suppress: Source-Disaggregated Feedback and Content Production on an AI-Native Social Platform',
          description: 'Under review · CCF-A. Separates feedback by source to study how human and AI comments differently shape creators’ sustained output on an AI-native social platform.',
        },
        {
          metric: 'NM&S',
          title:
            'Re-symbolizing Victim Trauma in Sexual Violence: A Prompt Engineering Approach to Understanding Bias in AI-powered Text-to-Image Technologies?',
          description: 'Under review · New Media & Society. Uses prompt engineering to audit how text-to-image models portray victims in sexual-violence narratives.',
        },
        {
          metric: 'arXiv',
          title:
            'SpaceAct: Benchmarking 3D Spatial and Temporal Reasoning via Closed-Loop Action and Active Perception',
          description: 'Under review · arXiv preprint. A benchmark for 3D spatial and temporal reasoning through closed-loop action and active perception.',
        },
      ],
    },
  },
};
