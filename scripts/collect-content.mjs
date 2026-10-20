import { mkdir, readdir, writeFile } from 'node:fs/promises';
const imports = [];
const groups = { problems: [], lessons: [] };
for (const kind of Object.keys(groups)) {
  const directory = `content/${kind}`;
  await mkdir(directory, { recursive: true });
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
  for (const file of files) {
    const symbol = `item${imports.length}`;
    imports.push(`import ${symbol} from '../../${directory}/${file}';`);
    groups[kind].push(`${symbol} as ${kind === 'problems' ? 'Problem' : 'Lesson'}`);
  }
}
await writeFile(
  'src/content/extensions.ts',
  `import type { Lesson, Problem } from './schema';\n${imports.join('\n')}\nexport const extensionProblems: Problem[] = [${groups.problems.join(',')}];\nexport const extensionLessons: Lesson[] = [${groups.lessons.join(',')}];\n`,
);
