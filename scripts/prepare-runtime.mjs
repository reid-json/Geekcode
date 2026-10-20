import { cp, mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

await mkdir('public/runtime/pyodide', { recursive: true });
for (const file of [
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]) {
  await cp(`node_modules/pyodide/${file}`, `public/runtime/pyodide/${file}`);
}
await mkdir('public/runtime/sql', { recursive: true });
await cp('node_modules/sql.js/dist/sql-wasm.wasm', 'public/runtime/sql/sql-wasm.wasm');
console.log('Local Python and SQLite WASM assets prepared.');

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
for (const size of [192, 512]) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const px = x / size,
        py = y / size;
      const border =
        px > 0.14 &&
        px < 0.86 &&
        py > 0.22 &&
        py < 0.8 &&
        (px < 0.18 || px > 0.82 || py < 0.26 || py > 0.76);
      const chevron = px > 0.27 && px < 0.44 && Math.abs(Math.abs(py - 0.51) - (px - 0.27)) < 0.025;
      const underscore = px > 0.49 && px < 0.7 && py > 0.64 && py < 0.68;
      const color = border || chevron || underscore ? [181, 243, 108] : [12, 18, 20];
      const at = y * (size * 4 + 1) + 1 + x * 4;
      raw[at] = color[0];
      raw[at + 1] = color[1];
      raw[at + 2] = color[2];
      raw[at + 3] = 255;
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  await writeFile(`public/icon-${size}.png`, png);
}
