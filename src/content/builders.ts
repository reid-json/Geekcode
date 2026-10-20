import {
  career,
  coach,
  slug,
  type Case,
  type Difficulty,
  type Problem,
  type TrackId,
} from './schema';

export interface CodeSeed {
  title: string;
  topic: string;
  prompt: string;
  js: string;
  py: string;
  cases: [unknown[], unknown][];
  cost: [string, string];
  insight: string;
  difficulty?: Difficulty;
  kind?: Problem['kind'];
}
export function codeProblem(seed: CodeSeed, track: TrackId = 'dsa'): Problem {
  const id = slug(seed.title);
  return {
    id,
    title: seed.title,
    topic: seed.topic,
    track,
    kind: seed.kind ?? 'code',
    difficulty: seed.difficulty ?? 'Medium',
    description: `${seed.prompt}\n\nImplement \`solve(...args)\` and return the result; do not read stdin. Inputs are JSON values. Do not mutate inputs unless explicitly permitted.`,
    languages: ['javascript', 'typescript', 'python'],
    starter: {
      javascript: 'function solve(...args) {\n  // Write your implementation here.\n}\n',
      typescript:
        'function solve(...args: unknown[]): unknown {\n  // Write your implementation here.\n}\n',
      python: 'def solve(*args):\n    pass\n',
    },
    reference: {
      javascript: `function solve${seed.js}`,
      typescript: `function solve${seed.js}`,
      python: `def solve${seed.py}`,
    },
    tests: seed.cases.map(([args, expected], i): Case => ({
      args,
      expected,
      hidden: i > 1,
      label: i > 1 ? `Boundary ${i - 1}` : `Example ${i + 1}`,
    })),
    complexity: { time: seed.cost[0], space: seed.cost[1] },
    hints: [
      'Which part of your hand-worked example repeats?',
      'What fact from the previous step could you reuse?',
      'Which single condition tells you a decision is safe?',
    ],
    editorial: `## Key insight\n${seed.insight}\n\n## Compare approaches\nStart with an exhaustive enumeration of valid candidates; it is a useful correctness oracle for small inputs, but can repeat work. The reference implementation avoids that repetition or bounds the explored states. Compare both on the smallest input and on equal values before measuring runtime.\n\n## Complexity\nTime: **${seed.cost[0]}**. Extra space: **${seed.cost[1]}**. Count input-dependent containers and recursion frames, not just local variables.\n\n## Pitfalls\nCheck empty inputs, duplicate values, inclusive boundaries, and whether the result needs stable ordering. Passing examples alone is not proof of correctness.`,
    coach: coach(seed.topic, `lesson-${slug(seed.topic)}`, [seed.topic]),
    career: career(seed.topic, track),
    prerequisites: [],
  };
}
