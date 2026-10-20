import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

export function offlinePlugin(): Plugin {
  return {
    name: 'geekcode-offline',
    async closeBundle() {
      const files: string[] = [];
      async function walk(directory: string) {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const file = path.join(directory, entry.name);
          if (entry.isDirectory()) await walk(file);
          else files.push(path.relative('dist', file).split(path.sep).join('/'));
        }
      }
      await walk('dist');
      const hash = createHash('sha256');
      for (const file of files) hash.update(await readFile(path.join('dist', file)));
      const cache = `geekcode-app-${hash.digest('hex').slice(0, 12)}`;
      const script = `
const APP_CACHE=${JSON.stringify(cache)};
const PREFIX='geekcode-app-';
const PYTHON_CACHE='geekcode-python-v0.27.7';
const FILES=${JSON.stringify(['./', ...files.map((file) => `./${file}`)])};
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(APP_CACHE);
    for(const file of FILES){
      const response=await fetch(new URL(file,self.registration.scope),{cache:'reload'});
      if(!response.ok)throw new Error('Offline asset failed: '+file);
      await cache.put(new URL(file,self.registration.scope),response);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==APP_CACHE)await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const python=url.href.startsWith('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/');
  const local=url.origin===self.location.origin&&url.href.startsWith(self.registration.scope);
  if(!local&&!python)return;
  event.respondWith((async()=>{
    const cache=await caches.open(python?PYTHON_CACHE:APP_CACHE);
    const hit=await cache.match(event.request,{ignoreVary:true});
    if(hit)return hit;
    try{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    }catch(error){
      if(local&&event.request.mode==='navigate'){
        const shell=await cache.match(new URL('./index.html',self.registration.scope));
        if(shell)return shell;
      }
      throw error;
    }
  })());
});
`;
      await writeFile(path.join('dist', 'sw.js'), script);
      console.log(`Offline manifest: ${files.length} assets, cache ${cache}`);
    },
  };
}
