import { problems, lessons, tracks } from '../content';
import type { Language, Mode, Problem, TrackId } from '../content/schema';
import { careerRules } from '../content/career-rules';
import { dayKey, independence, levelFor, readiness, streak, xpFor } from './learning';
import type { LearningEntry, Progress, Report } from './model';

export function reportBody(progress: Progress, track?: TrackId): string {
  const entries = progress.log.filter((e) => !e.hidden && (!track || e.track === track));
  const solid = entries.filter((e) => e.confidence === 'solid' && e.sourceType === 'problem');
  const pool = problems.filter((p) => !track || p.track === track);
  const solved = pool.filter((p) => progress.solved[p.id]);
  const attempts = progress.attempts.filter((a) => !track || a.track === track);
  const languages = [...new Set(attempts.filter((a) => a.passed).map((a) => a.language))];
  const topics = [
    ...new Set(solid.map((e) => problems.find((p) => p.id === e.source)?.topic).filter(Boolean)),
  ];
  const noHints = solved.filter((p) =>
    attempts.some((a) => a.problemId === p.id && a.passed && !a.hints && !a.stuck),
  ).length;
  const scope = track ? tracks.filter((t) => t.id === track) : tracks;
  const suggestions = [
    ...new Map(scope.flatMap((t) => t.career.projects).map((p) => [p.title, p])).values(),
  ];
  return `# ${track ? tracks.find((t) => t.id === track)?.short : 'Geekcode'} practice evidence\n\n${careerRules.templates.reportDisclaimer}\n\n## Demonstrated activity\n- ${solved.length} exercises passed; ${noHints} passed without hints/stuck events.\n- ${attempts.length} submissions; ${attempts.length ? Math.round((100 * attempts.filter((a) => a.passed).length) / attempts.length) : 0}% submission pass rate.\n- Languages/formats: ${languages.join(', ') || 'No submitted evidence yet'}.\n- Difficulty: ${['Easy', 'Medium', 'Hard'].map((d) => `${d} ${solved.filter((p) => p.difficulty === d).length}`).join(', ')}.\n- Independence: ${independence(attempts)}% (recent pass quality, not a professional certification).\n\n## Resume drafts — continuing education / practice\n${solid.length ? [`- Completed ${solid.length} independently evidenced practice exercises covering ${topics.join(', ')}.`, ...solid.slice(0, 4).map((e) => `- ${e.resume}`)].join('\n') : 'No independent problem-solving evidence yet. Lesson completion alone is excluded from demonstrated-skill resume suggestions.'}\n\nDetailed variant: Practiced boundary-case testing and explained tradeoffs across ${solid.length} independently evidenced exercises. Add project measurements only after measuring them: improved [X] by [X] in a documented personal project.\n\n## Skills keywords supported by independent solves\n${topics.join(', ') || 'Keep practicing; no solid solve evidence yet.'}\n\n## Interview talking points and evidence\n${
    solid
      .slice(-10)
      .map(
        (e) =>
          `### ${e.title}\n${e.interview}\nEvidence: ${e.evidence}\n${
            problems
              .find((p) => p.id === e.source)
              ?.career.questions.map((q) => `- ${q}`)
              .join('\n') ?? ''
          }\nOutline: ${problems.find((p) => p.id === e.source)?.career.outline ?? ''}`,
      )
      .join('\n\n') || 'Solve exercises and capture your own reasoning to populate this section.'
  }\n\n## Portfolio ideas — not completed projects\n${suggestions
    .slice(0, 3)
    .map(
      (p) =>
        `### ${p.title}\nScope: ${p.scope}\nStack: ${p.stack}\nREADME: ${p.readme}\nFuture bullet, only after building: Built a personal ${p.title.toLowerCase()} and documented measured [X] results.`,
    )
    .join(
      '\n\n',
    )}\n\n## Gaps and next steps\n${scope.map((t) => `- ${t.short}: readiness ${readiness(progress, problems, t.id)}%. ${problems.filter((p) => p.track === t.id && !progress.solved[p.id]).length} exercises remain. Review assisted solves and add timed evidence before inferring readiness.`).join('\n')}\n\n## Readiness calculation\nRecency × (45% solved coverage + 20% topic breadth + 20% recent independence + 15% timed pass rate). Recency decays over 120 days to a 25% floor; no timed evidence contributes zero timed credit. Target-role weights affect only the overall score.`;
}
export function addMilestones(progress: Progress): Report[] {
  const added: Report[] = [];
  const save = (id: string, title: string, track?: TrackId) => {
    if (progress.reports.some((r) => r.id === id)) return;
    const report = {
      id,
      title,
      track,
      date: new Date().toISOString(),
      body: reportBody(progress, track),
    };
    progress.reports.push(report);
    added.push(report);
  };
  const count = Object.keys(progress.solved).length;
  for (const n of careerRules.milestones.solves)
    if (count >= n) save(`solves-${n}`, `${n} solve${n === 1 ? '' : 's'} reached`);
  for (const n of careerRules.milestones.levels)
    if (levelFor(progress.xp).level >= n) save(`level-${n}`, `Level ${n} reached`);
  for (const n of careerRules.milestones.streaks)
    if (streak(progress) >= n) save(`streak-${n}`, `${n}-day streak reached`);
  for (const track of tracks) {
    const pool = problems.filter((p) => p.track === track.id);
    if (
      (pool.filter((p) => progress.solved[p.id]).length / pool.length) * 100 >=
      progress.settings.milestoneThreshold
    )
      save(`track-${track.id}`, `${track.short} mastery milestone`, track.id);
    for (const topic of new Set(pool.map((p) => p.topic))) {
      const cluster = pool.filter((p) => p.topic === topic);
      if (cluster.length > 1 && cluster.every((p) => progress.solved[p.id]))
        save(`topic-${track.id}-${topic}`, `${topic} cluster complete`, track.id);
    }
  }
  return added;
}
function touch(progress: Progress) {
  const today = dayKey();
  progress.activity[today] = (progress.activity[today] ?? 0) + 1;
}
export function completeProblem(
  progress: Progress,
  problem: Problem,
  result: { passed: boolean; language: Language; mode: Mode; elapsed: number; runtime: number },
): { xp: number; reports: Report[] } {
  const help = progress.help[problem.id] ?? { hints: 0, stuck: 0 };
  const firstTry = !progress.attempts.some((a) => a.problemId === problem.id);
  const xp =
    result.passed && !progress.solved[problem.id]
      ? xpFor(problem.difficulty, help.hints, firstTry, result.mode)
      : 0;
  const date = new Date().toISOString();
  progress.attempts.push({
    id: crypto.randomUUID(),
    problemId: problem.id,
    track: problem.track,
    date,
    ...result,
    ...help,
    xp,
  });
  progress.xp += xp;
  touch(progress);
  if (result.passed) {
    progress.solved[problem.id] = date;
    const confidence =
      help.hints <= careerRules.confidence.solidMaxHints &&
      help.stuck <= careerRules.confidence.solidMaxStuck
        ? 'solid'
        : help.hints + help.stuck <= careerRules.confidence.shakyMaxAssists
          ? 'shaky'
          : 'needs review';
    const reasoning = progress.notes
      .filter((n) => n.context === problem.id && n.tags.includes('reasoning'))
      .map((n) => n.body)
      .join('\n');
    const entry: LearningEntry = {
      id: `problem-${problem.id}`,
      source: problem.id,
      sourceType: 'problem',
      track: problem.track,
      title: problem.title,
      learned: `Practiced ${problem.topic}; ${problem.kind === 'code' || problem.kind === 'refactor' ? 'returned correct outputs on the authored tests' : 'passed an authored static coverage/answer rubric'}.`,
      interview:
        reasoning ||
        `In a practice exercise, I worked through ${problem.title}, tested edge cases, and checked the result. I would explain the invariant and limitations before claiming production expertise.`,
      resume: careerRules.templates.problemResume
        .replace('{topic}', problem.topic)
        .replace('{language}', result.language),
      evidence: `#/problem/${problem.id} · ${result.language} · ${help.hints} hints · ${help.stuck} stuck events · ${progress.attempts.filter((a) => a.problemId === problem.id).length} submissions · ${date}`,
      confidence,
      date,
      promoted: false,
      hidden: false,
    };
    if (problem.kind === 'design' || problem.kind === 'config' || problem.answer)
      entry.resume = `Completed authored ${problem.kind} practice on ${problem.topic} (${result.language}); checked against a limited coverage/answer rubric.`;
    const existing = progress.log.findIndex((e) => e.id === entry.id);
    if (existing < 0) progress.log.push(entry);
    else {
      entry.promoted = progress.log[existing].promoted;
      entry.hidden = progress.log[existing].hidden;
      progress.log[existing] = entry;
    }
    progress.help[problem.id] = { hints: 0, stuck: 0 };
    if (!progress.notes.some((n) => n.context === problem.id && n.tags.includes('reflection')))
      progress.notes.push({
        id: crypto.randomUUID(),
        title: `Reflection: ${problem.title}`,
        body: '## Key insight in my words\n\n## What tripped me up\n\n## How I will recognize it next time\n',
        tags: ['reflection', problem.topic],
        track: problem.track,
        context: problem.id,
        created: date,
        updated: date,
        pinned: false,
      });
  }
  const reports = addMilestones(progress);
  if (result.mode === 'interview') {
    const id = crypto.randomUUID();
    const report = {
      id,
      title: `Interview debrief: ${problem.title}`,
      track: problem.track,
      date,
      body: `# Timed practice debrief\n\n${result.passed ? 'Passed all authored checks.' : 'Did not pass all authored checks.'} Time: ${(result.elapsed / 60000).toFixed(1)} minutes. Language: ${result.language}.\n\nReview: ${problem.topic}. Trace the first mismatch and explain the invariant aloud. Timed rubric tasks assess coverage only, not actual infrastructure execution.\n\n${reportBody(progress, problem.track)}`,
    };
    progress.reports.push(report);
    reports.push(report);
  }
  return { xp, reports };
}
export function completeLesson(progress: Progress, id: string, quick = false, words = ''): boolean {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`Lesson not found: ${id}`);
  const completed = quick ? progress.completedQuick : progress.completedLessons;
  if (completed.includes(id)) return false;
  completed.push(id);
  progress.xp += quick ? 20 : 15;
  touch(progress);
  const date = new Date().toISOString();
  progress.log.push({
    id: `${quick ? 'quick' : 'lesson'}-${id}`,
    source: id,
    sourceType: quick ? 'quick' : 'lesson',
    track: lesson.track,
    title: lesson.title,
    learned: `${quick ? 'Explored through prediction and self-explanation' : 'Studied'} ${lesson.topic}.`,
    interview:
      words ||
      `I studied ${lesson.topic} in a structured lesson. I still need solving evidence to demonstrate independent application.`,
    resume: careerRules.templates.lessonResume.replace('{topic}', lesson.topic),
    evidence: `#/lesson/${id} · ${date} · ${quick ? 'Quick Learn self-check' : 'Reading completion; no solve claim'}`,
    confidence: 'needs review',
    date,
    promoted: false,
    hidden: false,
  });
  addMilestones(progress);
  return true;
}
