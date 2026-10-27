import { test,expect } from '@playwright/test';
test.beforeEach(async({page,request})=>{
  for(const card of await (await request.get('/api/cards')).json())await request.delete(`/api/cards/${card.id}`,{data:{}});
});
test('add, filter, edit, persist, favorite, wishlist, backup and delete',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('heading',{name:'Deine Sammlung. Dein Spielfeld.'})).toBeVisible();
  await page.getByRole('button',{name:'Erste Karte hinzufügen'}).click();
  await page.getByLabel('Spielername').fill('Patrick Mahomes');await page.getByRole('combobox',{name:'Sportart',exact:true}).selectOption('American Football');
  await page.getByLabel('Jahr / Saison').fill('2017');await page.getByLabel('Set / Hersteller').fill('Panini Prizm');
  await page.getByLabel('Kaufpreis pro Karte').fill('10.50');await page.getByLabel('Marktwert pro Karte').fill('25');await page.getByLabel('Anzahl',{exact:true}).fill('2');
  await page.getByRole('button',{name:'Karte speichern'}).click();await expect(page.locator('#card-dialog')).not.toBeVisible();
  await expect(page.locator('.stat-value').first()).toHaveText('2');await expect(page.locator('.stat-value').nth(1)).toContainText('50,00');
  await page.locator('[data-nav=collection]').click();await page.getByRole('searchbox',{name:'Sammlung durchsuchen'}).fill('nonexistent');await expect(page.getByText('Kein Treffer für diese Auswahl.')).toBeVisible();
  await page.getByRole('searchbox',{name:'Sammlung durchsuchen'}).fill('Mahomes');await expect(page.locator('.collection-card')).toHaveCount(1);
  await page.getByRole('button',{name:'Als Favorit markieren'}).click();await expect(page.getByRole('button',{name:'Favorit entfernen'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Details zu Patrick Mahomes'}).click();await page.getByRole('button',{name:'Bearbeiten',exact:true}).click();
  await page.getByLabel('Spielername').fill('Stephen Curry');await page.getByRole('combobox',{name:'Sportart',exact:true}).selectOption('Basketball');await page.getByLabel('Ablage').selectOption('Wunschliste');
  await page.getByRole('button',{name:'Karte speichern'}).click();await expect(page.locator('#card-dialog')).not.toBeVisible();await page.locator('[data-nav=wishlist]').click();
  await page.getByRole('searchbox',{name:'Sammlung durchsuchen'}).fill('');await expect(page.getByRole('heading',{name:'Stephen Curry',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Stephen Curry',exact:true})).toBeVisible();
  await page.goto('/#settings');const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'Backup herunterladen'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('sideline-sammlung.json');
  await page.goto('/#wishlist');await page.getByRole('button',{name:'Details zu Stephen Curry'}).click();await page.getByRole('button',{name:'Löschen',exact:true}).click();await page.getByRole('button',{name:'Karte löschen',exact:true}).click();await expect(page.getByText('Wovon träumt deine Sammlung?')).toBeVisible();
  expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('photo identification auto-fills NFL and NBA fields and requires review before saving',async({page})=>{
  await page.route('**/api/status',r=>r.fulfill({json:{ok:true,scanAvailable:true}}));
  await page.route('**/api/identify',async r=>{
    const input=r.request().postDataJSON();expect(input.image).toContain('data:image/jpeg;base64,');
    await r.fulfill({json:{detections:[{player:input.segment==='football'?'Patrick Mahomes':'Stephen Curry',sport:input.segment==='football'?'American Football':'Basketball',set:'Panini Prizm',year:'2017',number:'24',parallel:'Silver',grader:'PSA',grade:'10',cardsightId:'5cfbf9b8-d408-4616-93e0-c28893400f13',confidence:'High',matchLevel:'card'}]}});
  });
  await page.goto('/#scan');await page.locator('#auto-save').uncheck();
  for(const sport of ['football','basketball']){
    if(sport==='basketball')await page.getByRole('button',{name:'NBA Basketball'}).click();
    await page.locator('#scan-file').setInputFiles({name:'card.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1kAAAAASUVORK5CYII=','base64')});
    await page.getByRole('button',{name:'Zuschnitt übernehmen & erkennen',exact:true}).click();await expect(page.getByText('Hohe Sicherheit')).toBeVisible();
    await page.locator('[data-action=pick-detection]').click();await expect(page.getByLabel('Spielername')).toHaveValue(sport==='football'?'Patrick Mahomes':'Stephen Curry');
    await expect(page.getByLabel('Set / Hersteller')).toHaveValue('Panini Prizm');await expect(page.getByLabel('Grading-Anbieter')).toHaveValue('PSA');
    await expect(page.getByRole('combobox',{name:'Sportart',exact:true})).toHaveValue(sport==='football'?'American Football':'Basketball');
    expect(await (await page.request.get('/api/cards')).json()).toHaveLength(0);
    await page.getByRole('button',{name:'Abbrechen',exact:true}).click();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
