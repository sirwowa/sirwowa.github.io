import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server.mjs';
const dir=mkdtempSync(path.join(tmpdir(),'sideline-browser-'));
const server=createApp({dataDir:dir,cardsightKey:''});server.listen(3101,'127.0.0.1');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{rmSync(dir,{recursive:true,force:true});process.exit(0);}));
