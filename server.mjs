import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requestCardsight, mapDetection, mapSearch, CardsightError } from './cardsight.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const sports = ['Basketball', 'Fußball', 'American Football', 'Baseball', 'Eishockey', 'Andere'];
const conditions = ['Unbewertet', 'Mint', 'Near Mint', 'Excellent', 'Good', 'Fair'];
const statuses = ['Sammlung', 'Wunschliste', 'Zum Verkauf'];
class InputError extends Error {}
function text(value, max = 200) {
  if (typeof value !== 'string' || value.length > max) throw new InputError('Ein Textfeld ist ungültig oder zu lang.');
  return value.trim();
}
function money(value) {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9) throw new InputError('Bitte einen gültigen Betrag zwischen 0 und 1 Milliarde eingeben.');
  return Math.round(value * 100) / 100;
}
function image(value) {
  if (!value) return '';
  if (typeof value !== 'string' || value.length > 7_000_000) throw new InputError('Das Bild ist zu groß (maximal 5 MB).');
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new InputError('Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt.');
  const bytes = Buffer.from(match[2], 'base64');
  const valid = match[1] === 'jpeg' ? bytes.subarray(0, 3).equals(Buffer.from([255,216,255])) : match[1] === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
  if (!valid || bytes.length > 5 * 1024 * 1024) throw new InputError('Das Bildformat ist ungültig oder die Datei ist größer als 5 MB.');
  return value;
}
export function validateCard(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Ungültige Karte.');
  const card = {};
  for (const key of ['player','team','set','number','parallel','grader','grade']) card[key] = text(input[key] ?? '');
  card.notes = text(input.notes ?? '', 4000);
  card.cardsightId = text(input.cardsightId ?? '',80);
  if(card.cardsightId && !/^[a-f0-9-]{36}$/i.test(card.cardsightId)) throw new InputError('Ungültige Cardsight-Karten-ID.');
  if (!card.player) throw new InputError('Bitte einen Spielernamen eingeben.');
  card.year = text(input.year ?? '', 9);
  if (card.year && !/^\d{4}(?:[-/]\d{2,4})?$/.test(card.year)) throw new InputError('Jahr bitte als 2024 oder 2024/25 eingeben.');
  for (const [key, allowed, fallback] of [['sport',sports,'Basketball'],['condition',conditions,'Unbewertet'],['status',statuses,'Sammlung']]) {
    card[key] = input[key] ?? fallback;
    if (!allowed.includes(card[key])) throw new InputError(`Ungültiges Feld: ${key}.`);
  }
  card.purchasePrice = money(input.purchasePrice);
  card.marketValue = money(input.marketValue);
  card.quantity = input.quantity ?? 1;
  if (!Number.isInteger(card.quantity) || card.quantity < 1 || card.quantity > 10000) throw new InputError('Anzahl muss zwischen 1 und 10.000 liegen.');
  card.favorite = input.favorite === true;
  card.image = image(input.image);
  return card;
}
async function body(req, limit = 8_000_000) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit) throw new InputError('Die Anfrage ist zu groß.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new InputError('Ungültiges JSON.'); }
}
export function createApp({ dataDir = process.env.DATA_DIR || path.join(root, 'data'), cardsightKey = process.env.CARDSIGHT_API_KEY, fetcher = fetch } = {}) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'collection.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, data TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL);');
  const map = row => ({...JSON.parse(row.data), id:row.id, createdAt:row.created, updatedAt:row.updated});
  const list = () => db.prepare('SELECT * FROM cards ORDER BY created DESC, id').all().map(map);
  const get = id => { const row = db.prepare('SELECT * FROM cards WHERE id=?').get(id); return row ? map(row) : null; };
  const insert = card => { const id=randomUUID(), now=new Date().toISOString(); db.prepare('INSERT INTO cards VALUES (?,?,?,?)').run(id,JSON.stringify(card),now,now); return get(id); };
  const assets = {'/':['public/index.html','text/html; charset=utf-8'], '/app.js':['public/app.js','text/javascript; charset=utf-8'], '/capture.js':['public/capture.js','text/javascript; charset=utf-8'], '/style.css':['public/style.css','text/css; charset=utf-8'], '/favicon.svg':['public/favicon.svg','image/svg+xml']};
  const server = http.createServer(async (req,res) => {
    const send = (status, data) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!['GET','HEAD'].includes(req.method)) {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return send(403,{error:'Zugriff von einer fremden Website abgelehnt.'});
        if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(415,{error:'Content-Type application/json ist erforderlich.'});
      }
      if (req.method === 'GET' && url.pathname === '/api/status') return send(200,{ok:true,scanAvailable:!!cardsightKey,scanMessage:cardsightKey?'Bereit für NFL und NBA.':'Bitte CARDSIGHT_API_KEY sicher auf dem Server hinterlegen. Manuelle Erfassung ist bereits möglich.',currency:'EUR'});
      if (req.method === 'POST' && url.pathname === '/api/identify') {
        const input=await body(req);
        if(!['football','basketball'].includes(input.segment))throw new InputError('Bitte NFL oder NBA wählen.');
        const photo=image(input.image);if(!photo)throw new InputError('Bitte zuerst ein Kartenfoto wählen.');
        const mime=photo.slice(5,photo.indexOf(';')), bytes=Buffer.from(photo.split(',')[1],'base64');
        const result=await requestCardsight(`/v1/identify/card/${input.segment}`,{key:cardsightKey,method:'POST',body:bytes,contentType:mime,fetcher});
        if(typeof result.success!=='boolean')throw new CardsightError('Cardsight hat eine unerwartete Antwort gesendet.');
        const detections=(result.detections || []).slice(0,10).map(d=>mapDetection(d,input.segment)).filter(d=>d.matchLevel!=='none');
        return send(200,{detections,detectedCount:result.detectedCount??0,identifiedCount:result.identifiedCount??detections.length});
      }
      if (req.method === 'POST' && url.pathname === '/api/catalog') {
        const input=await body(req,10000);const q=text(input.query ?? '',200);
        if(q.length<2)throw new InputError('Bitte mindestens zwei Suchzeichen eingeben.');
        if(!['football','basketball'].includes(input.segment))throw new InputError('Bitte NFL oder NBA wählen.');
        const query=new URLSearchParams({q,type:'card',take:'12',segment:input.segment==='football'?'Football':'Basketball'});
        const result=await requestCardsight(`/v1/catalog/search?${query}`,{key:cardsightKey,fetcher});
        if(!Array.isArray(result.results))throw new CardsightError('Cardsight hat eine unerwartete Antwort gesendet.');
        return send(200,{results:result.results.filter(c=>c.type==='card').map(mapSearch),total:result.total_count});
      }
      if (req.method === 'GET' && url.pathname === '/api/cards') return send(200,list());
      if (req.method === 'GET' && url.pathname === '/api/export') {
        res.setHeader('Content-Disposition','attachment; filename="sideline-sammlung.json"');
        return send(200,{format:'sideline',version:1,exportedAt:new Date().toISOString(),cards:list()});
      }
      if (req.method === 'POST' && url.pathname === '/api/cards') return send(201,insert(validateCard(await body(req))));
      if (req.method === 'POST' && url.pathname === '/api/import') {
        const input = await body(req,60_000_000);
        if (input.format !== 'sideline' || input.version !== 1 || !Array.isArray(input.cards) || input.cards.length > 1000) throw new InputError('Bitte ein gültiges Sideline-Backup mit maximal 1.000 Einträgen wählen.');
        const cards = input.cards.map(validateCard);
        // Validate every row before committing anything. Preserve IDs for repeatable backup import.
        const ids = input.cards.map(c => c.id || randomUUID());
        if (ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) || new Set(ids).size !== ids.length) throw new InputError('Ungültige oder doppelte Karten-IDs im Backup.');
        let imported=0, skipped=0;
        db.exec('BEGIN');
        try {
          for (let i=0;i<cards.length;i++) {
            if (get(ids[i])) { skipped++; continue; }
            const now = new Date().toISOString();
            db.prepare('INSERT INTO cards VALUES (?,?,?,?)').run(ids[i],JSON.stringify(cards[i]),now,now); imported++;
          }
          db.exec('COMMIT');
        } catch(e) { db.exec('ROLLBACK'); throw e; }
        return send(200,{imported,skipped});
      }
      const match = /^\/api\/cards\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
      if (match && ['PUT','DELETE'].includes(req.method)) {
        if (!get(match[1])) return send(404,{error:'Karte nicht gefunden.'});
        if (req.method==='DELETE') { db.prepare('DELETE FROM cards WHERE id=?').run(match[1]); return send(200,{ok:true}); }
        const card=validateCard(await body(req));
        db.prepare('UPDATE cards SET data=?, updated=? WHERE id=?').run(JSON.stringify(card),new Date().toISOString(),match[1]);
        return send(200,get(match[1]));
      }
      if (['GET','HEAD'].includes(req.method) && assets[url.pathname]) {
        const [file,mime]=assets[url.pathname]; const bytes=readFileSync(path.join(root,file));
        res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'}); return res.end(req.method==='HEAD' ? undefined : bytes);
      }
      return send(404,{error:'Nicht gefunden.'});
    } catch(e) { if (!(e instanceof InputError) && !(e instanceof CardsightError)) console.error('Request failed:',e.name); return send(e instanceof InputError ? 400 : e instanceof CardsightError ? e.status : 500,{error:e instanceof InputError || e instanceof CardsightError ? e.message : 'Ein Serverfehler ist aufgetreten.'}); }
  });
  server.once('close',() => db.close());
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server=createApp();
  const host=process.env.HOST || '127.0.0.1', port=Number(process.env.PORT || 3000);
  server.listen(port,host,()=>console.log(`Sideline läuft auf ${host}:${port}. Daten: ${process.env.DATA_DIR || path.join(root,'data')}`));
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(()=>process.exit(0)));
}
