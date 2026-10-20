import { dsaProblems } from './dsa';
import { syntaxProblems } from './syntax';
import { devopsProblems } from './devops';
import { aiProblems } from './ai';
import { sqlProblems } from './sql';
import { systemsProblems } from './systems';
import { lessons } from './lessons';
import { extensionLessons, extensionProblems } from './extensions';
export { tracks } from './tracks';
export { lessons };
lessons.push(...extensionLessons);
export const problems = [
  ...dsaProblems,
  ...syntaxProblems,
  ...devopsProblems,
  ...aiProblems,
  ...sqlProblems,
  ...systemsProblems,
  ...extensionProblems,
];
for (const problem of problems) {
  const lesson =
    lessons.find((item) => item.topic === problem.topic && item.track === problem.track) ??
    lessons.find((item) => item.topic === problem.topic) ??
    lessons.find((item) => item.track === problem.track)!;
  problem.coach.prerequisites = [lesson.id];
  if (problem.tests[0]?.args.length && ['code', 'refactor'].includes(problem.kind)) {
    problem.coach.stages[1].question = `Work through the first example by hand: ${JSON.stringify(problem.tests[0].args)}. What changes after each step, and why does it lead to ${JSON.stringify(problem.tests[0].expected)}?`;
    problem.coach.stages[7].question =
      'Trace the first failing input shown in the test panel. At which step do expected and actual state diverge? If all tests pass, choose a boundary case and explain why it works.';
  }
  if (problem.kind === 'config' || problem.kind === 'design') {
    problem.coach.stages[0].question =
      'What outcome does this scenario require, what inputs or resources are available, and what failure boundary matters?';
    problem.coach.stages[4].question =
      'Which guarantee must remain true when an operation is retried, a dependency is unavailable, or two operations happen together?';
  }
  if (!lesson.related.includes(problem.id)) lesson.related.push(problem.id);
}
for (const track of ['dsa', 'syntax', 'devops', 'ai', 'sql', 'systems']) {
  const sequence = lessons.filter((lesson) => lesson.track === track);
  sequence.forEach((lesson, index) => {
    lesson.prerequisites = index > 0 ? [sequence[index - 1].id] : [];
  });
}
export const flashcards = lessons.flatMap((lesson) =>
  lesson.cards.map((card, i) => ({
    ...card,
    id: `${lesson.id}:card:${i}`,
    track: lesson.track,
    lessonId: lesson.id,
  })),
);
