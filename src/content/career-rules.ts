export const careerRules = {
  version: 1,
  milestones: { solves: [1, 10, 25, 50, 100, 150], levels: [5, 10, 20], streaks: [10, 30] },
  confidence: { solidMaxHints: 0, solidMaxStuck: 0, shakyMaxAssists: 3 },
  readiness: {
    mastery: 0.45,
    breadth: 0.2,
    independence: 0.2,
    timed: 0.15,
    decayDays: 120,
    minimumRecency: 0.25,
  },
  roles: {
    'Backend SWE': { dsa: 0.3, syntax: 0.15, devops: 0.1, ai: 0.05, sql: 0.2, systems: 0.2 },
    'DevOps/SRE': { dsa: 0.1, syntax: 0.1, devops: 0.4, ai: 0.05, sql: 0.1, systems: 0.25 },
    'ML/AI Engineer': { dsa: 0.15, syntax: 0.15, devops: 0.1, ai: 0.4, sql: 0.1, systems: 0.1 },
  },
  templates: {
    problemResume: 'Completed practice in {topic}; implemented and tested solutions in {language}.',
    lessonResume: 'Studied {topic} through structured continuing-education exercises.',
    reportDisclaimer:
      'Practice evidence only. These are local, self-reported learning records, not credentials or professional experience. Keyword rubric passes demonstrate coverage, not production design competence.',
  },
};
