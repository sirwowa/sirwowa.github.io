import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createApp } from '../server.mjs';
import { mapDetection } from '../cardsight.mjs';

const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1kAAAAASUVORK5CYII=';
const card={player:'Patrick Mahomes',sport:'American Football',year:'2017',set:'Panini Prizm',quantity:2,purchasePrice:10.50,marketValue:25,image:png};
async function fixture(t, options={}) {
  const dir=mkdtempSync(path.join(tmpdir(),'sideline-api-'));
  const server=createApp({dataDir:dir,...options});server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(async()=>{if(server.listening)await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});});
  const base=`http://127.0.0.1:${server.address().port}`;
  const call=async(route,method='GET',data,headers={})=>{const res=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...headers},...(data===undefined?{}:{body:JSON.stringify(data)})});return{status:res.status,body:await res.json()};};
  return{call,base,server,dir};
}
test('CRUD stores photos, decimal amounts, IDs and updates without losing data',async t=>{
  const{call}=await fixture(t);const created=await call('/api/cards','POST',card);
  assert.equal(created.status,201);assert.equal(created.body.image,png);assert.equal(created.body.purchasePrice,10.5);
  const id=created.body.id;
  assert.equal((await call('/api/cards')).body.length,1);
  assert.equal((await call(`/api/cards/${id}`,'PUT',{...card,player:'Stephen Curry',sport:'Basketball',favorite:true})).body.favorite,true);
  assert.equal((await call('/api/cards')).body[0].player,'Stephen Curry');
  assert.equal((await call(`/api/cards/${id}`,'DELETE',{})).status,200);
  assert.deepEqual((await call('/api/cards')).body,[]);
  assert.equal((await call(`/api/cards/${id}`,'PUT',card)).status,404);
});
test('rejects invalid amounts, quantities, image payloads and missing player',async t=>{
  const{call}=await fixture(t);
  for(const change of [{player:''},{marketValue:-1},{marketValue:'10'},{quantity:1.5},{sport:'NFL'},{year:'yesterday'},{image:'data:image/svg+xml;base64,abc'},{image:'data:image/png;base64,YWJjZA=='}])assert.equal((await call('/api/cards','POST',{...card,...change})).status,400);
  assert.deepEqual((await call('/api/cards')).body,[]);
});
test('backup import is repeatable and rejects a bad batch atomically',async t=>{
  const{call}=await fixture(t);await call('/api/cards','POST',card);
  const exported=(await call('/api/export')).body;
  assert.equal(exported.cards[0].image,png);
  const importData={...exported,cards:[{...exported.cards[0],id:'new-id'}]};
  assert.deepEqual((await call('/api/import','POST',importData)).body,{imported:1,skipped:0});
  assert.deepEqual((await call('/api/import','POST',importData)).body,{imported:0,skipped:1});
  const bad={...exported,cards:[{...card,id:'valid-new-id'},{...card,id:'bad-id',player:''}]};
  assert.equal((await call('/api/import','POST',bad)).status,400);
  assert.equal((await call('/api/cards')).body.length,2);
});
test('database survives a server restart',async t=>{
  const{call,dir,server}=await fixture(t);await call('/api/cards','POST',card);
  await new Promise(resolve=>server.close(resolve));
  const next=createApp({dataDir:dir});next.listen(0,'127.0.0.1');await once(next,'listening');
  const response=await fetch(`http://127.0.0.1:${next.address().port}/api/cards`);
  assert.equal((await response.json())[0].player,card.player);
  await new Promise(resolve=>next.close(resolve));
});
test('rejects cross-origin writes and non-JSON content',async t=>{
  const{call}=await fixture(t);
  assert.equal((await call('/api/cards','POST',card,{'Origin':'https://foreign.example'})).status,403);
  assert.equal((await call('/api/cards','POST',card,{'Content-Type':'text/plain'})).status,415);
});
test('server forwards image bytes to documented endpoint and maps detected NFL fields',async t=>{
  let requests=0;
  const{call}=await fixture(t,{cardsightKey:'test-only-key',fetcher:async(url,opts)=>{
    requests++;assert.equal(url,'https://api.cardsight.ai/v1/identify/card/football');
    assert.equal(opts.headers['X-API-Key'],'test-only-key');assert.equal(opts.headers['Content-Type'],'image/png');assert.ok(Buffer.isBuffer(opts.body));
    return new Response(JSON.stringify({success:true,detectedCount:1,identifiedCount:1,detections:[{confidence:'High',card:{id:'5cfbf9b8-d408-4616-93e0-c28893400f13',name:'Patrick Mahomes II',year:'2017',number:'24',releaseName:'Panini Prizm',setName:'Premier Jerseys',parallelSuggestions:[{name:'Silver'}]},grading:{company:{name:'PSA'},grade:{value:'10'}}}]}));
  }});
  const result=await call('/api/identify','POST',{image:png,segment:'football'});
  assert.equal(requests,1);assert.equal(result.status,200);assert.equal(result.body.detections[0].player,'Patrick Mahomes II');assert.equal(result.body.detections[0].grade,'10');assert.equal(result.body.detections[0].sport,'American Football');
  assert.equal((await call('/api/status')).body.scanAvailable,true);
  assert.ok(!JSON.stringify((await call('/api/status')).body).includes('test-only-key'));
});
test('recognition handles no matches, invalid segment, rate limits and missing key',async t=>{
  const missing=await fixture(t,{cardsightKey:''});
  assert.equal((await missing.call('/api/identify','POST',{image:png,segment:'basketball'})).status,503);
  const limited=await fixture(t,{cardsightKey:'test-key',fetcher:async()=>new Response('{}',{status:429})});
  assert.equal((await limited.call('/api/identify','POST',{image:png,segment:'basketball'})).status,429);
  const empty=await fixture(t,{cardsightKey:'test-key',fetcher:async()=>new Response(JSON.stringify({success:false,detections:[],identifiedCount:0}))});
  assert.deepEqual((await empty.call('/api/identify','POST',{image:png,segment:'basketball'})).body.detections,[]);
  assert.equal((await empty.call('/api/identify','POST',{image:png,segment:'invalid'})).status,400);
});
test('set-only detection leaves player blank and indicates incomplete match',()=>{
  const mapped=mapDetection({confidence:'Low',card:{setId:'set',setName:'Fleer',year:'1986'}},'basketball');
  assert.equal(mapped.player,'');assert.equal(mapped.matchLevel,'set');assert.equal(mapped.sport,'Basketball');
});
test('NBA catalog search encodes query and maps response without exposing key',async t=>{
  const{call}=await fixture(t,{cardsightKey:'test-key',fetcher:async url=>{
    const parsed=new URL(url);assert.equal(parsed.pathname,'/v1/catalog/search');assert.equal(parsed.searchParams.get('segment'),'Basketball');assert.equal(parsed.searchParams.get('q'),'Curry & Prizm');
    return new Response(JSON.stringify({results:[{type:'card',id:'5cfbf9b8-d408-4616-93e0-c28893400f13',name:'Stephen Curry',segmentName:'Basketball',cardNumber:'30',year:'2024'}],total_count:1}));
  }});
  const result=await call('/api/catalog','POST',{query:'Curry & Prizm',segment:'basketball'});
  assert.equal(result.body.results[0].player,'Stephen Curry');assert.equal(result.body.results[0].number,'30');assert.equal(result.body.results[0].sport,'Basketball');
});
test('serves app with CSP and never serves private files or environment',async t=>{
  const{base}=await fixture(t);
  const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(home.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.match(await home.text(),/Sideline/);
  for(const url of ['/.env','/data/collection.sqlite','/server.mjs','/.git/config'])assert.equal((await fetch(base+url)).status,404);
});
