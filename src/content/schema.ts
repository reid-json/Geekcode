export const trackIds = ['dsa', 'syntax', 'devops', 'ai', 'sql', 'systems'] as const;
export type TrackId = (typeof trackIds)[number];
export type Language = 'javascript' | 'typescript' | 'python' | 'sql' | 'java' | 'yaml' | 'text';
export type Mode = 'guided' | 'practice' | 'interview';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Kind =
  | 'code'
  | 'predict'
  | 'repair'
  | 'choice'
  | 'multi-select'
  | 'config'
  | 'design'
  | 'order'
  | 'refactor'
  | 'fill';
export interface CareerMeta {
  skills: string[];
  keywords: string[];
  questions: string[];
  outline: string;
  projects: { title: string; scope: string; stack: string; readme: string }[];
}
export interface CoachStage {
  id: string;
  question: string;
  insights: string[][];
  followups: { missing: string; question: string }[];
}
export interface Coach {
  stages: CoachStage[];
  stuck: string[];
  forbiddenTerms: string[];
  prerequisites: string[];
}
export interface Case {
  args: unknown[];
  expected: unknown;
  hidden?: boolean;
  label?: string;
}
export interface Rule {
  label: string;
  pattern?: string;
  notPattern?: string;
  path?: string;
  equals?: unknown;
}
export interface Problem {
  id: string;
  title: string;
  track: TrackId;
  topic: string;
  difficulty: Difficulty;
  kind: Kind;
  description: string;
  languages: Language[];
  starter: Partial<Record<Language, string>>;
  reference: Partial<Record<Language, string>>;
  tests: Case[];
  hints: string[];
  complexity: { time: string; space: string };
  editorial: string;
  coach: Coach;
  career: CareerMeta;
  rules?: Rule[];
  choices?: string[];
  answer?: string[];
  seed?: string;
  packages?: string[];
  prerequisites: string[];
}
export interface Lesson {
  id: string;
  title: string;
  track: TrackId;
  topic: string;
  minutes: number;
  body: string;
  diagram: string[];
  cards: { front: string; back: string }[];
  quick: {
    scenario: string;
    prediction: string;
    explanation: string;
    challenge: string;
    answer: string;
  };
  coach: Coach;
  career: CareerMeta;
  related: string[];
  prerequisites: string[];
}
export interface Track {
  id: TrackId;
  title: string;
  short: string;
  code: string;
  color: string;
  description: string;
  career: CareerMeta;
}

export const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function career(topic: string, track: TrackId): CareerMeta {
  const projects: Record<TrackId, CareerMeta['projects']> = {
    dsa: [
      {
        title: 'Pathfinding workbench',
        scope: 'Compare explored states, path length, and measured runtime on editable graphs.',
        stack: 'TypeScript, SVG, Vitest',
        readme: 'Document invariants, complexity, benchmark inputs, and reproducible tests.',
      },
    ],
    syntax: [
      {
        title: 'Cross-language collection cookbook',
        scope:
          'Implement equivalent transformations and edge-case tests in Java, Python, and TypeScript.',
        stack: 'Java, Python, TypeScript',
        readme: 'Include semantic differences, error cases, and repeatable test commands.',
      },
    ],
    devops: [
      {
        title: 'Reproducible delivery lab',
        scope:
          'Containerize a small app, build a CI pipeline, and document rollback and recovery drills.',
        stack: 'Docker, GitHub Actions, Kubernetes',
        readme: 'Include deployment manifests, threat assumptions, health checks, and a runbook.',
      },
    ],
    ai: [
      {
        title: 'Grounded retrieval evaluation lab',
        scope:
          'Build a retriever over public documents and measure retrieval recall and citation support on a held-out set.',
        stack: 'Python, NumPy, SQLite',
        readme: 'Describe dataset provenance, baselines, failure analysis, and measured results.',
      },
    ],
    sql: [
      {
        title: 'Query performance notebook',
        scope: 'Model an order database and compare query plans before and after indexing.',
        stack: 'SQLite, Python',
        readme:
          'Include schema, seed generator, transactions, EXPLAIN output, and repeatable timings.',
      },
    ],
    systems: [
      {
        title: 'Rate-limited job service',
        scope:
          'Build a bounded queue with idempotency keys, backpressure, retries, and observable failure modes.',
        stack: 'TypeScript, Redis, Docker',
        readme: 'Document capacity estimates, consistency decisions, load tests, and tradeoffs.',
      },
    ],
  };
  return {
    skills: [topic],
    keywords: [topic, track === 'ai' ? 'AI/ML evaluation' : track],
    questions: [
      `What invariant makes ${topic} reliable?`,
      `When would ${topic} fail or become expensive?`,
      `How would you test ${topic} at its boundaries?`,
    ],
    outline: `State the goal, explain ${topic} using a concrete practice example, identify a tradeoff, and describe an edge-case test. Distinguish practice from production experience.`,
    projects: projects[track],
  };
}

export function coach(topic: string, prerequisite: string, forbidden: string[] = []): Coach {
  return {
    forbiddenTerms: forbidden,
    prerequisites: [prerequisite],
    stages: [
      {
        id: 'understand',
        question:
          'In your own words, what are the inputs, the required output, and one boundary case?',
        insights: [
          ['input', 'given', 'receive'],
          ['output', 'return', 'result'],
          ['empty', 'single', 'zero', 'boundary', 'missing'],
        ],
        followups: [
          {
            missing: 'boundary',
            question: 'What is the smallest legal input, and what should happen to it?',
          },
        ],
      },
      {
        id: 'trace',
        question: 'Work through the first example by hand. What changes after each step?',
        insights: [
          ['first', 'step', 'start'],
          ['then', 'next', 'after'],
        ],
        followups: [
          { missing: 'step', question: 'Write the state before and after just the first step.' },
        ],
      },
      {
        id: 'baseline',
        question:
          'Describe a direct approach, even if it repeats work. How many steps could it take?',
        insights: [
          ['each', 'every', 'all'],
          ['time', 'steps', 'o(', 'operations'],
        ],
        followups: [
          {
            missing: 'time',
            question: 'If the input doubled, about how much more work would that approach do?',
          },
        ],
      },
      {
        id: 'bottleneck',
        question:
          'Which question does your approach answer repeatedly? What could you remember between steps?',
        insights: [['repeat', 'again', 'reuse', 'remember', 'store', 'cache']],
        followups: [
          {
            missing: 'repeat',
            question: 'Circle two steps that recompute the same fact. What is that fact?',
          },
        ],
      },
      {
        id: 'discover',
        question:
          'What information must remain true after each step for the next decision to be safe?',
        insights: [['keep', 'true', 'invariant', 'maintain', 'state']],
        followups: [
          {
            missing: 'state',
            question: 'Describe the information you would keep, without choosing any code yet.',
          },
        ],
      },
      {
        id: 'plan',
        question:
          'Write your plan in plain steps. What happens with equal values, missing values, or the final item?',
        insights: [
          ['if', 'when'],
          ['return', 'result', 'finish', 'output'],
        ],
        followups: [
          {
            missing: 'finish',
            question: 'How will you know you are done, and what will you return?',
          },
        ],
      },
      {
        id: 'implement',
        question: 'Implement your plan in the editor. Which part will you test first?',
        insights: [['test', 'case', 'check', 'run']],
        followups: [
          {
            missing: 'test',
            question: 'Choose one input where a small mistake would be visible immediately.',
          },
        ],
      },
      {
        id: 'debug',
        question:
          'Trace a test input. At which step could the actual state first differ from your intended state?',
        insights: [['state', 'step', 'expected', 'actual', 'match']],
        followups: [
          {
            missing: 'state',
            question: 'Write one expected intermediate value and compare it with your output.',
          },
        ],
      },
      {
        id: 'reflect',
        question:
          'State time and extra-space costs and why. What would change for a million items?',
        insights: [
          ['time', 'o('],
          ['space', 'memory'],
        ],
        followups: [
          {
            missing: 'space',
            question: 'Which stored values grow with the input, rather than staying fixed?',
          },
        ],
      },
    ],
    stuck: [
      'Restate just the output requirement. What would a correct result look like for one tiny input?',
      'Try a smaller version with only two items. What decisions are possible?',
      'Mini-exercise: write a two-row table showing input, your current state, and the next decision. Which fact is missing?',
      `Pause and read the prerequisite lesson on ${topic}. Return with one rule in your own words.`,
    ],
  };
}
