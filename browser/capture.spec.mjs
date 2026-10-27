import { test,expect } from '@playwright/test';
const recognized={player:'Patrick Mahomes',sport:'American Football',set:'Panini Prizm',year:'2017',number:'24',parallel:'',grader:'',grade:'',cardsightId:'5cfbf9b8-d408-4616-93e0-c28893400f13',confidence:'High',matchLevel:'card'};
test.beforeEach(async({page,request})=>{
  for(const card of await(await request.get('/api/cards')).json())await request.delete(`/api/cards/${card.id}`,{data:{}});
  await page.route('**/api/status',r=>r.fulfill({json:{ok:true,scanAvailable:true}}));
});
test('live camera shows frame, crops, animates, auto-saves and stops its tracks',async({page})=>{
  await page.addInitScript(()=>{
    window.cameraTrack=null;
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#349852';ctx.fillRect(0,0,1280,720);
      const stream=canvas.captureStream(10);window.cameraTrack=stream.getVideoTracks()[0];return stream;
    }});
  });
  let release;const responseGate=new Promise(resolve=>release=resolve);
  await page.route('**/api/identify',async r=>{await responseGate;await r.fulfill({json:{detections:[recognized]}});});
  await page.goto('/#scan');await page.getByRole('button',{name:'Kamera öffnen',exact:true}).click();
  await expect(page.locator('video')).toBeVisible();await expect(page.locator('.capture-frame')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.querySelector('video')?.videoWidth)).toBe(1280);
  await page.getByRole('button',{name:'Fotografieren & erkennen',exact:true}).click();
  await expect(page.locator('.scan-beam')).toBeVisible();await expect(page.getByText('Deine Karte wird erkannt …')).toBeVisible();
  expect(await page.evaluate(()=>window.cameraTrack.readyState)).toBe('ended');
  release();await expect(page.getByText('Erkannt & gespeichert',{exact:true})).toBeVisible();await expect(page.locator('.scan-success-icon')).toBeVisible();
  const stored=await(await page.request.get('/api/cards')).json();expect(stored).toHaveLength(1);expect(stored[0].player).toBe('Patrick Mahomes');
  const dimensions=await page.evaluate(async image=>{const img=new Image();img.src=image;await img.decode();return[img.naturalWidth,img.naturalHeight];},stored[0].image);
  expect(dimensions[0]/dimensions[1]).toBeCloseTo(5/7,2);
  await page.locator('[data-nav=collection]').click();await expect(page.getByAltText('Karte von Patrick Mahomes')).toHaveAttribute('src',stored[0].image);
});
test('uploaded photo can be cropped so the saved image excludes the background',async({page})=>{
  await page.route('**/api/identify',r=>r.fulfill({json:{detections:[recognized]}}));
  await page.goto('/#scan');
  const base64=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=1000;const x=c.getContext('2d');x.fillStyle='#ee2222';x.fillRect(0,0,800,1000);x.fillStyle='#2244ee';x.fillRect(100,80,600,840);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('#scan-file').setInputFiles({name:'card-background.png',mimeType:'image/png',buffer:Buffer.from(base64,'base64')});
  await expect(page.locator('.capture-frame')).toBeVisible();
  await page.locator('[data-adjust=zoom]').fill('1.2');
  await page.getByRole('button',{name:'Zuschnitt übernehmen & erkennen',exact:true}).click();
  await expect(page.getByText('Erkannt & gespeichert',{exact:true})).toBeVisible();
  const stored=await(await page.request.get('/api/cards')).json();expect(stored).toHaveLength(1);
  const corners=await page.evaluate(async image=>{const i=new Image();i.src=image;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return[[2,2],[c.width-3,2],[2,c.height-3],[c.width-3,c.height-3]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data));},stored[0].image);
  for(const[r,g,b]of corners){expect(b).toBeGreaterThan(200);expect(r).toBeLessThan(70);}
});
test('camera permission denial and uncertain recognition never save an automatic entry',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('denied','NotAllowedError');}}));
  await page.route('**/api/identify',r=>r.fulfill({json:{detections:[{...recognized,confidence:'Low'}]}}));
  await page.goto('/#scan');await page.getByRole('button',{name:'Kamera öffnen',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Kamerazugriff abgelehnt'})).toBeVisible();
  await page.locator('#scan-file').setInputFiles({name:'card.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1kAAAAASUVORK5CYII=','base64')});
  await page.getByRole('button',{name:'Zuschnitt übernehmen & erkennen',exact:true}).click();await expect(page.getByText('Geringe Sicherheit')).toBeVisible();
  expect(await(await page.request.get('/api/cards')).json()).toHaveLength(0);
  await page.getByRole('button',{name:'In Sammlung speichern',exact:true}).click();await expect(page.getByText('Erkannt & gespeichert',{exact:true})).toBeVisible();expect(await(await page.request.get('/api/cards')).json()).toHaveLength(1);
});
