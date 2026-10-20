import { mkdir, writeFile } from 'node:fs/promises';
import { problems, lessons, tracks, flashcards } from '../src/content';
for (const [kind, items] of Object.entries({ problems, lessons, tracks })) {
  await mkdir(`public/content/${kind}`, { recursive: true });
  for (const item of items)
    await writeFile(`public/content/${kind}/${item.id}.json`, `${JSON.stringify(item, null, 2)}\n`);
}
await writeFile('public/content/flashcards.json', `${JSON.stringify(flashcards, null, 2)}\n`);
console.log(
  `Materialized ${problems.length} problems, ${lessons.length} lessons, ${flashcards.length} flashcards.`,
);
