import type { Coach, CareerMeta, Lesson, Problem, Track } from '../content/schema';

export function validateCoach(coach: Coach, reference: string[] = []): string[] {
  const errors: string[] = [];
  if (coach.stages.length < 9 || coach.stuck.length < 4 || !coach.prerequisites.length)
    errors.push('Coach stages, stuck ladder, or prerequisites incomplete.');
  const earlyText = [
    ...coach.stages
      .slice(0, 6)
      .flatMap((stage) => [stage.question, ...stage.followups.map((f) => f.question)]),
    ...coach.stuck.slice(0, 3),
  ]
    .join('\n')
    .toLowerCase();
  for (const term of coach.forbiddenTerms)
    if (earlyText.includes(term.toLowerCase()))
      errors.push(`Early coach leaks forbidden term: ${term}`);
  const allText = [...coach.stages.map((s) => s.question), ...coach.stuck].join('\n');
  if (/```|function\s+\w+\s*\(|def\s+\w+\s*\(|return\s+[{}[\]]/.test(allText))
    errors.push('Coach contains solution-like code.');
  for (const source of reference) {
    const normalized = source.replace(/\s+/g, '').toLowerCase();
    if (normalized.length > 35 && allText.replace(/\s+/g, '').toLowerCase().includes(normalized))
      errors.push('Coach contains reference solution.');
  }
  for (const stage of coach.stages)
    if (!stage.question || !stage.insights.length || !stage.followups.length)
      errors.push(`Incomplete coach stage ${stage.id}`);
  return errors;
}
function careerErrors(meta: CareerMeta): string[] {
  return meta.skills.length &&
    meta.keywords.length &&
    meta.questions.length >= 3 &&
    meta.outline &&
    meta.projects.length
    ? []
    : ['Career metadata incomplete.'];
}
export function validateCatalog(problems: Problem[], lessons: Lesson[], tracks: Track[]): string[] {
  const errors: string[] = [];
  const ids = [...problems, ...lessons].map((item) => item.id);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate content identifiers.');
  if (
    problems.length < 150 ||
    lessons.length < 40 ||
    lessons.reduce((n, l) => n + l.cards.length, 0) < 200
  )
    errors.push('Launch content thresholds not met.');
  for (const track of tracks)
    errors.push(...careerErrors(track.career).map((e) => `${track.id}: ${e}`));
  for (const item of [...problems, ...lessons]) {
    errors.push(...careerErrors(item.career).map((e) => `${item.id}: ${e}`));
    errors.push(
      ...validateCoach(item.coach, 'reference' in item ? Object.values(item.reference) : []).map(
        (e) => `${item.id}: ${e}`,
      ),
    );
    for (const prerequisite of item.coach.prerequisites)
      if (!lessons.some((l) => l.id === prerequisite))
        errors.push(`${item.id}: broken prerequisite ${prerequisite}`);
  }
  for (const problem of problems) {
    if (
      !problem.tests.length ||
      !problem.description ||
      !problem.editorial ||
      problem.hints.length !== 3
    )
      errors.push(`${problem.id}: incomplete problem.`);
    for (const language of problem.languages)
      if (problem.reference[language] === undefined || problem.starter[language] === undefined)
        errors.push(`${problem.id}: missing ${language} implementation.`);
    for (const hint of problem.hints)
      if (
        problem.coach.forbiddenTerms.some((term) => hint.toLowerCase().includes(term.toLowerCase()))
      )
        errors.push(`${problem.id}: hint leakage.`);
  }
  for (const lesson of lessons) {
    if (
      lesson.body.length < 700 ||
      !lesson.quick.answer ||
      lesson.cards.length < 5 ||
      lesson.diagram.length < 3
    )
      errors.push(`${lesson.id}: incomplete lesson.`);
    for (const id of lesson.related)
      if (!problems.some((p) => p.id === id))
        errors.push(`${lesson.id}: broken related problem ${id}`);
  }
  return errors;
}
