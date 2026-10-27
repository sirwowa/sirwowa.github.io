import { CardCapture } from './capture.js';
const paths = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  cards:'<rect x="7" y="3" width="13" height="17" rx="2"/><path d="M4 7H3v13a2 2 0 0 0 2 2h11M11 8h5M11 12h5M11 16h3"/>',
  scan:'<path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M3 12h18"/>',
  heart:'<path d="m12 21-8-7C-3 7 6-1 12 6 18-1 27 7 20 14Z"/>',
  settings:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3h3l2 3 3-1 1-3 3-1 2-3-2-2 1-3-2-3h-3l-2-3Z"/><circle cx="11.5" cy="12" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>', arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  wallet:'<path d="M20 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h15V8H5a3 3 0 0 1 0-6"/><path d="M20 12h-6v5h6m-4-2.5h.01"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z"/>',
  camera:'<path d="m8 5 1-2h6l1 2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.5 5.5c8 2 8 11 13 13M18.5 5.5c-8 2-8 11-13 13"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15Zm0 0 1-5"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.cards}</svg>`;
function icons(scope=document) { scope.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon)); }
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = value => value === null || value === undefined ? '—' : new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
const count = value => new Intl.NumberFormat('de-DE').format(value);
const labels={overview:'Übersicht',collection:'Meine Sammlung',scan:'Karte erfassen',wishlist:'Wunschliste',settings:'Einstellungen'};
let cards=[], status={}, loadError='', route='overview', editingId=null, formImage='', scanImage='', deleteId=null;
let filter={query:'',sport:'',sort:'newest',favorite:false};
let toastTimer;
let scanPhase='idle',savedScanId=null,autoSave=true,scanOperation=0;
try{autoSave=localStorage.getItem('sideline-auto-save')!=='false';}catch{}
const capture=new CardCapture({canRecognize:()=>!!status.scanAvailable,onError:message=>toast(message,true),onPhoto:async(photo,recognize)=>{scanOperation++;scanImage=photo;scanResults=[];savedScanId=null;scanPhase='idle';render();if(recognize)await actions.identify();}});
let segment='football', scanResults=[], scanBusy=false, catalogResults=[];
function toast(message,error=false) { const t=$('#toast'); t.textContent=message; t.classList.toggle('error',error); t.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.hidden=true,5000); }
async function api(url,options={}) {
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...options.headers}});
  const result=await response.json();
  if(!response.ok) throw new Error(result.error || 'Die Anfrage konnte nicht abgeschlossen werden.');
  return result;
}
async function refresh() { cards=await api('/api/cards'); $('#nav-count').textContent=count(cards.filter(c=>c.status!=='Wunschliste').reduce((sum,c)=>sum+c.quantity,0)); }
const actionButton=(action,label,kind='button-dark',name='plus')=>`<button class="button ${kind}" data-action="${action}">${icon(name)}${label}</button>`;
function heading(title,subtitle,extra='') { return `<div class="page-heading"><div><span class="eyebrow">DEIN SPIEL. DEINE GESCHICHTE.</span><h1>${title}</h1><p>${subtitle}</p></div>${extra}</div>`; }
function empty(title,description,action='add',label='Erste Karte hinzufügen',symbol='cards') { return `<div class="empty-state"><div class="empty-icon">${icon(symbol)}</div><h3>${title}</h3><p>${description}</p>${actionButton(action,label,'button-dark','plus')}</div>`; }
function placeholder(c) { const initials=c.player.split(/\s+/).slice(0,2).map(s=>s[0]).join(''); return `<div class="card-placeholder">${icon('ball')}<strong>${esc(initials)}</strong><small>${esc(c.sport)}${c.number?' · '+esc(c.number):''}</small></div>`; }
function cardTile(c) { return `<article class="collection-card"><button class="favorite-button ${c.favorite?'selected':''}" data-action="favorite" data-id="${c.id}" aria-label="${c.favorite?'Favorit entfernen':'Als Favorit markieren'}" aria-pressed="${c.favorite}">${icon('heart')}</button><button class="card-open" data-action="detail" data-id="${c.id}" aria-label="Details zu ${esc(c.player)}"><div class="card-visual sport-${esc(c.sport)}">${c.image?`<img src="${esc(c.image)}" alt="Karte von ${esc(c.player)}" loading="lazy">`:placeholder(c)}</div><div class="card-info"><div class="card-meta">${esc(c.sport)} <span>·</span> ${esc(c.year || 'Ohne Jahr')}</div><h3>${esc(c.player)}</h3><p>${esc(c.set || c.team || 'Set noch nicht erfasst')}${c.number?' · '+esc(c.number):''}</p><div class="card-bottom"><span class="card-value" title="Manuell erfasster Wert pro Karte">${eur(c.marketValue)}</span><span class="grade-badge">${esc(c.grader && c.grade ? `${c.grader} ${c.grade}`:c.condition)}${c.quantity>1?` · ×${count(c.quantity)}`:''}</span></div></div></button></article>`; }
function overview() {
  const owned=cards.filter(c=>c.status!=='Wunschliste'), total=owned.reduce((n,c)=>n+c.quantity,0);
  const valued=owned.filter(c=>c.marketValue!==null), value=valued.reduce((n,c)=>n+c.marketValue*c.quantity,0);
  const costCards=owned.filter(c=>c.purchasePrice!==null), cost=costCards.reduce((n,c)=>n+c.purchasePrice*c.quantity,0);
  const favorites=owned.filter(c=>c.favorite).length;
  const stat=(label,value,sub,symbol)=>`<div class="stat"><div class="stat-top">${label}${icon(symbol)}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`;
  return heading('Deine Sammlung. Dein Spielfeld.','Alles, was du sammelst. An einem Ort.',`<span class="date-label">${icon('calendar')}${new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}</span>`)+
  `<section class="hero"><div class="hero-copy"><div class="hero-tag"><span class="status-dot"></span> SAMMELN IST MEHR ALS EIN HOBBY.</div><h2>Große Momente.<br><em>Im Kartenformat.</em></h2><p>Halte deine Highlights fest. Entdecke deine Sammlung aus einer neuen Perspektive.</p>${actionButton('scan','Neue Karte erfassen','button-lime','scan')}</div><div class="hero-art" aria-hidden="true"><div class="art-card"><span class="card-number">01</span></div><div class="art-card back"><span class="card-number">10</span></div><div class="art-card front"><span class="card-number">23</span><span class="player-silhouette">★</span><span class="card-caption">FOR THE GAME</span></div><div class="art-label">${icon('heart')} KEEP THE MOMENT.</div></div></section>`+
  `<section class="stats-grid" aria-label="Sammlungsstatistik">${stat('Karten in der Sammlung',count(total),`${count(owned.length)} unterschiedliche Einträge`,'cards')}${stat('Sammlungswert',valued.length?eur(value):'—',valued.length?`Manuell · ${valued.length} von ${owned.length} Einträgen bewertet`:'Noch keine Werte erfasst','wallet')}${stat('Investiert',costCards.length?eur(cost):'—',costCards.length?`Kaufpreise · ${costCards.length} von ${owned.length} Einträgen`:'Noch keine Kaufpreise erfasst','ball')}${stat('Deine Favoriten',count(favorites),'Die Highlights deiner Sammlung','heart')}</section>`+
  `<div class="overview-lower"><section><div class="section-heading"><div><h2>Zuletzt hinzugefügt</h2><p>Die neuesten Mitglieder deiner Sammlung.</p></div><a class="text-link" href="#collection">Alle ansehen ${icon('arrow')}</a></div>${owned.length?`<div class="card-grid">${owned.slice(0,4).map(cardTile).join('')}</div>`:empty('Jede Sammlung beginnt mit einer Karte.','Dein erster Rookie, dein Lieblingsspieler oder der Fund des Jahres. Hier ist Platz dafür.')}</section><aside class="tip-panel"><div class="tip-icon">${icon('star')}</div><h3>Kleine Details.<br>Großer Unterschied.</h3><p>Set, Jahr und Parallel machen eine Karte einzigartig. Erfasse diese Details, damit du deine Schätze immer wiederfindest.</p><span class="eyebrow">COLLECTOR TIPP #01</span><a class="text-link" href="#scan">Deine erste Karte erfassen ${icon('arrow')}</a></aside></div>`;
}
function collection(wishlist=false) {
  return heading(wishlist?'Die nächsten Highlights.':'Deine Karten. Alle im Blick.',wishlist?'Hier warten deine nächsten Lieblingsstücke.':'Suchen, sortieren, wiederentdecken. Das ist deine Sammlung.',actionButton(wishlist?'add-wish':'add',wishlist?'Wunsch hinzufügen':'Karte hinzufügen'))+
  `<div class="toolbar"><label class="search-box"><span>${icon('search')}</span><input id="search" type="search" placeholder="Spieler, Team, Set oder Nummer suchen …" aria-label="Sammlung durchsuchen" value="${esc(filter.query)}"></label><select id="sport-filter" aria-label="Nach Sportart filtern"><option value="">Alle Sportarten</option>${['Basketball','Fußball','American Football','Baseball','Eishockey','Andere'].map(s=>`<option ${filter.sport===s?'selected':''}>${s}</option>`).join('')}</select><select id="sort-filter" aria-label="Sortierung">${[['newest','Zuletzt hinzugefügt'],['name','Spieler A–Z'],['value','Höchster Wert'],['year','Neuestes Jahr']].map(([v,l])=>`<option value="${v}" ${filter.sort===v?'selected':''}>${l}</option>`).join('')}</select><button class="filter-toggle ${filter.favorite?'active':''}" data-action="filter-favorites" aria-pressed="${filter.favorite}">${icon('heart')} Favoriten</button></div><div id="collection-results"></div>`;
}
function renderResults() {
  const el=$('#collection-results'); if(!el)return;
  const source=cards.filter(c=>route==='wishlist'?c.status==='Wunschliste':c.status!=='Wunschliste');
  let result=source.filter(c=>(!filter.sport || c.sport===filter.sport)&&(!filter.favorite || c.favorite)&&[c.player,c.team,c.set,c.number,c.parallel,c.year].join(' ').toLocaleLowerCase('de').includes(filter.query.toLocaleLowerCase('de')));
  result.sort((a,b)=>filter.sort==='name'?a.player.localeCompare(b.player,'de'):filter.sort==='value'?(b.marketValue??-1)-(a.marketValue??-1):filter.sort==='year'?b.year.localeCompare(a.year):b.createdAt.localeCompare(a.createdAt));
  el.innerHTML=`<div class="results-line"><span>${count(result.length)} ${result.length===1?'Eintrag':'Einträge'}${filter.query || filter.sport || filter.favorite?` von ${count(source.length)}`:''}</span><button class="text-link" data-action="reset-filters">Filter zurücksetzen</button></div>`+(result.length?`<div class="card-grid">${result.map(cardTile).join('')}</div>`:source.length?empty('Kein Treffer für diese Auswahl.','Versuche einen anderen Suchbegriff oder setze die Filter zurück.','reset-filters','Filter zurücksetzen','search'):empty(route==='wishlist'?'Wovon träumt deine Sammlung?':'Dein nächster Fund wartet schon.',route==='wishlist'?'Merke dir Karten, die du noch ergattern möchtest.':'Füge deine erste Sportkarte hinzu – mit Foto und allen Details.',route==='wishlist'?'add-wish':'add',route==='wishlist'?'Ersten Wunsch hinzufügen':'Erste Karte hinzufügen',route==='wishlist'?'heart':'cards'));
}
function scan() {
  const saved=cards.find(c=>c.id===savedScanId);
  const phaseLabel=scanBusy?'Deine Karte wird erkannt …':scanPhase==='saved'?'Erkannt & gespeichert':scanPhase==='recognized'?'Karte erkannt':scanPhase==='error'?'Bitte erneut versuchen':'Bereit für den Scan';
  return heading('Deine Karte. Dein Moment.','Fotografieren. Erkennen. In deiner Sammlung wiederfinden.')+`
  <div class="scan-layout"><section class="scan-zone">
    <div class="segment-switch" role="group" aria-label="Sportart für Erkennung">
      <button data-action="segment-nfl" class="${segment==='football'?'selected':''}" aria-pressed="${segment==='football'}" ${scanBusy?'disabled':''}>NFL <small>Football</small></button>
      <button data-action="segment-nba" class="${segment==='basketball'?'selected':''}" aria-pressed="${segment==='basketball'}" ${scanBusy?'disabled':''}>NBA <small>Basketball</small></button>
    </div>
    <div id="camera-host" ${scanImage?'hidden':''}></div>
    ${scanImage?`<div class="scan-preview phase-${scanPhase}" aria-label="Scan-Vorschau">
      <div class="scan-photo-card"><img src="${esc(scanImage)}" alt="Zugeschnittenes Kartenfoto">${scanBusy?'<div class="scan-beam"></div><div class="scan-grid-overlay"></div>':''}</div>
      ${scanPhase==='recognized'||scanPhase==='saved'?`<div class="scan-success-icon">${icon('check')}</div><span class="scan-spark s1"></span><span class="scan-spark s2"></span><span class="scan-spark s3"></span><span class="scan-spark s4"></span>`:''}
      <div class="scan-phase-label" role="status">${scanBusy?'<span class="mini-spinner"></span>':''}${phaseLabel}</div>
    </div>`:''}
    <label class="upload-alternative" id="scan-zone"><input type="file" id="scan-file" accept="image/jpeg,image/png,image/webp" capture="environment" ${scanBusy?'disabled':''}>${icon('upload')} ${scanImage?'Anderes Foto zuschneiden':'Foto hochladen oder Kamera-App nutzen'}<small>JPEG, PNG, WebP · max. 5 MB</small></label>
    <div class="scan-note ${status.scanAvailable?'connected':''}">${icon(status.scanAvailable?'lock':'info')}<div><strong>${status.scanAvailable?'Nur deine Karte kommt in die Sammlung.':'API-Schlüssel noch nicht eingerichtet.'}</strong><br>${status.scanAvailable?'Der Rahmen schneidet den Hintergrund ab. Beim Fotografieren & Erkennen wird nur der Zuschnitt an Cardsight gesendet.':esc(status.scanMessage)}</div></div>
    <label class="auto-save-option"><input type="checkbox" id="auto-save" ${autoSave?'checked':''} ${scanBusy?'disabled':''}><span><strong>Sichere Treffer automatisch speichern</strong><small>Nur eine eindeutig erkannte Karte mit hoher Sicherheit. Unsichere Treffer prüfst du selbst.</small></span></label>
    <div class="scan-actions">${scanImage&&!savedScanId?`<button class="button button-dark" data-action="identify" ${!status.scanAvailable||scanBusy?'disabled':''}>${icon('scan')}${scanBusy?'Karte wird erkannt …':'Karte erkennen'}</button>`:''}${!savedScanId?actionButton('use-photo','Manuell erfassen','button-secondary','edit'):''}${scanImage?`<button class="button button-secondary" data-action="clear-scan" ${scanBusy?'disabled':''}>${icon('camera')} Nächste Karte</button>`:''}</div>
    ${saved?`<div class="saved-scan-panel"><span>${icon('check')}</span><div><strong>${esc(saved.player)} ist in deiner Sammlung.</strong><small>${esc([saved.year,saved.set,saved.number].filter(Boolean).join(' · '))}</small></div><button class="text-link" data-action="detail" data-id="${saved.id}">Ansehen ${icon('arrow')}</button></div>`:''}
    <div id="scan-results" aria-live="polite">${scanResults.length&&!savedScanId?`<div class="scan-result-heading">${scanResults.length} ${scanResults.length===1?'Zuordnung':'Zuordnungen'} · Bitte prüfen</div>${scanResults.map((c,i)=>`<div class="recognition-result"><button class="detection-row" data-action="pick-detection" data-index="${i}"><div><span class="confidence confidence-${c.confidence}">${{High:'Hohe Sicherheit',Medium:'Mittlere Sicherheit',Low:'Geringe Sicherheit'}[c.confidence]}${c.matchLevel==='set'?' · Nur Set erkannt':''}</span><strong>${esc(c.player || 'Spieler bitte ergänzen')}</strong><small>${esc([c.year,c.set,c.number].filter(Boolean).join(' · '))}</small></div>${icon('edit')}</button>${c.player?`<button class="button button-lime button-small" data-action="save-detection" data-index="${i}" ${scanBusy?'disabled':''}>${icon('plus')} In Sammlung speichern</button>`:''}</div>`).join('')}`:''}</div>
    <section class="catalog-section"><h3>Oder im Katalog finden</h3><p>Suche nach Spieler, Jahr und Set. Übernimm einen Treffer als Vorlage.</p><div class="catalog-search"><input id="catalog-query" type="search" placeholder="z. B. Patrick Mahomes Prizm 2017" aria-label="Cardsight-Katalog durchsuchen" maxlength="200"><button class="button button-secondary" data-action="catalog-search" ${!status.scanAvailable?'disabled':''}>${icon('search')} Suchen</button></div><div id="catalog-results"></div></section>
  </section><aside class="steps"><h2>Ein Foto. Ein neuer Favorit.</h2>
    <div class="step"><span class="step-number">01</span><div><h3>Genau im Rahmen</h3><p>Kamera öffnen und die Kartenränder am Rahmen ausrichten. Für Querformat-Karten kannst du den Rahmen drehen.</p></div></div>
    <div class="step"><span class="step-number">02</span><div><h3>Ein Klick. Die Magie beginnt.</h3><p>Fotografieren & erkennen: Der Scan läuft, Cardsight liest die Kartendaten und ergänzt Spieler, Set, Jahr und Nummer.</p></div></div>
    <div class="step"><span class="step-number">03</span><div><h3>Dein Fund ist zu Hause</h3><p>Sichere Treffer landen auf Wunsch direkt in deiner Sammlung – mit zugeschnittenem Kartenfoto. Andere Treffer kannst du prüfen und speichern.</p></div></div>
    <div class="subtle-panel"><h3>Der Rahmen ist dein Zuschnitt.</h3><p>Halte die Karte gerade und fülle den Rahmen genau aus. Tisch und Hände bleiben außerhalb. Hochgeladene Fotos kannst du vor dem Scan mit Zoom und Verschiebung zuschneiden.</p></div>
  </aside></div>`;
}
function renderCatalog() {
  const el=$('#catalog-results');if(!el)return;
  el.innerHTML=catalogResults.map((c,i)=>`<button class="detection-row" data-action="pick-catalog" data-index="${i}"><div><strong>${esc(c.player)}</strong><small>${esc([c.year,c.set,c.number,c.parallel].filter(Boolean).join(' · '))}</small></div>${icon('plus')}</button>`).join('');
}
function settings() {
  return heading('Dein Space. Deine Regeln.','Sichere deine Sammlung und behalte die Kontrolle über deine Daten.')+
  `<div class="settings-grid"><section class="settings-panel"><span>${icon('download')}</span><h2>Ein Backup für deine Highlights.</h2><p>Exportiere alle Karten inklusive Fotos als JSON-Datei. Bewahre regelmäßig eine Kopie an einem sicheren Ort auf.</p><a class="button button-dark" href="/api/export" download="sideline-sammlung.json">${icon('download')} Backup herunterladen</a><button class="button button-secondary" data-action="import">${icon('upload')} Backup importieren</button><p class="field-hint">Import ergänzt fehlende Einträge. Bereits vorhandene IDs werden übersprungen. Bestehende Karten werden nicht überschrieben. Maximal 1.000 Karten und 60 MB pro Import.</p></section><section class="settings-panel"><span>${icon('scan')}</span><h2>Cardsight-Erkennung</h2><span class="connection-status ${status.scanAvailable?'ready':''}">${status.scanAvailable?'Schlüssel auf dem Server hinterlegt':'Schlüssel fehlt'}</span><p>Erkenne NFL- und NBA-Karten anhand eines Fotos oder suche im Cardsight-Katalog. Automatisch ausgefüllte Angaben werden erst nach deiner Prüfung gespeichert.</p><p class="field-hint">API-Schlüssel gehören ausschließlich in die Server-Konfiguration. Sie werden weder im Browser noch in Sammlungs-Backups gespeichert.</p></section><section class="settings-panel"><span>${icon('lock')}</span><h2>Persönlich. Lokal. Übersichtlich.</h2><p>Diese Version ist für deinen privaten Einsatz gedacht. Sie hat keine Benutzerkonten. Betreibe sie lokal oder hinter einem geschützten Zugang.</p><ul class="info-list"><li>Speicherung<strong>SQLite auf deinem Server</strong></li><li>Währung<strong>Euro (€)</strong></li><li>Marktwerte<strong>Manuelle Angaben</strong></li><li>Gespeicherte Einträge<strong>${count(cards.length)}</strong></li></ul></section><section class="settings-panel"><span>${icon('heart')}</span><h2>Für die Liebe zum Spiel.</h2><p>Eine eigene Heimat für deine Sportkarten. Halte Käufe fest, markiere Favoriten und plane mit deiner Wunschliste die nächsten Funde.</p><p class="field-hint">Preise sind deine eigenen Einträge, keine aktuellen Marktangebote oder Verkaufsschätzungen. Fotos werden zur Identifikation erkannt; der Zustand wird dadurch nicht automatisch bewertet. Die App ist ein eigenständiges Projekt und nicht mit LUDEX verbunden.</p><a class="button button-secondary" href="#wishlist">Zur Wunschliste ${icon('arrow')}</a></section></div>`;
}
function render() {
  route=location.hash.slice(1) || 'overview'; if(!labels[route])route='overview';
  document.title=`${labels[route]} · Sideline`;
  $('#page-name').textContent=labels[route];
  document.querySelectorAll('[data-nav]').forEach(el=>{ el.classList.toggle('active',el.dataset.nav===route); if(el.dataset.nav===route)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current'); });
  $('#main').innerHTML=loadError?`<div class="error-panel"><h2>Die Sammlung ist gerade nicht erreichbar.</h2><p>${esc(loadError)}</p>${actionButton('retry','Erneut versuchen','button-dark','arrow')}</div>`:route==='overview'?overview():route==='collection'||route==='wishlist'?collection(route==='wishlist'):route==='scan'?scan():settings();
  renderResults();
  if(route==='scan') {
    capture.mount($('#camera-host'));
    renderCatalog();
    const zone=$('#scan-zone');
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragover');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('dragover'));
    zone.addEventListener('drop',async e=>{e.preventDefault();zone.classList.remove('dragover');const file=e.dataTransfer.files[0];if(file&&!scanBusy)await selectScan(file);});
  }else capture.stop();
}
async function readImage(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Bitte ein JPEG-, PNG- oder WebP-Bild wählen.');
  if(file.size>5*1024*1024)throw new Error('Das Foto ist zu groß. Bitte maximal 5 MB auswählen.');
  const value=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Das Foto konnte nicht gelesen werden.'));reader.readAsDataURL(file);});
  await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(new Error('Das Bild konnte nicht geöffnet werden.'));img.src=value;});
  return value;
}
async function selectScan(file) { try{if(scanBusy)return;const image=await readImage(file);scanImage='';scanResults=[];savedScanId=null;scanPhase='idle';render();await capture.load(image);}catch(e){toast(e.message,true);} }
function photoPreview() { $('#form-photo-preview').innerHTML=formImage?`<img src="${esc(formImage)}" alt="Ausgewähltes Kartenfoto">`:`${icon('camera')}<strong>Kartenfoto hinzufügen</strong><small>JPEG, PNG oder WebP · bis 5 MB</small>`;$('#remove-photo').hidden=!formImage; }
function openForm(card=null,options={}) {
  if(capture.mode==='live'){capture.stop();render();}
  editingId=card?.id || null;const form=$('#card-form');form.reset();$('#form-error').textContent='';
  $('#dialog-title').textContent=card?'Karte bearbeiten':'Karte hinzufügen';
  formImage=card?.image || options.image || '';
  if(!card && options.prefill)for(const el of form.elements)if(el.name && options.prefill[el.name]!==undefined)el.value=options.prefill[el.name];
  if(!card && !options.prefill)form.elements.sport.value=segment==='football'?'American Football':'Basketball';
  if(card)for(const el of form.elements)if(el.name && card[el.name]!==undefined){if(el.type==='checkbox')el.checked=card[el.name];else el.value=card[el.name]??'';}
  if(options.wish)form.elements.status.value='Wunschliste';
  photoPreview();$('#card-dialog').showModal();
}
function detail(id) {
  const c=cards.find(c=>c.id===id);if(!c)return;
  const row=(label,value)=>value!==''&&value!==null&&value!==undefined?`<div class="detail-row"><span>${label}</span><strong>${esc(value)}</strong></div>`:'';
  $('#detail-dialog').innerHTML=`<div class="dialog-heading"><div><span class="eyebrow">DEIN COLLECTOR HIGHLIGHT</span><h2>Kartendetails</h2></div><button class="icon-button" data-action="close-detail" aria-label="Schließen">${icon('close')}</button></div><div class="detail-body"><div class="detail-image">${c.image?`<img src="${esc(c.image)}" alt="Karte von ${esc(c.player)}">`:placeholder(c)}</div><div class="detail-info"><div class="card-meta">${esc(c.sport)} · ${esc(c.status)}</div><h2>${esc(c.player)}</h2>${row('Team',c.team)}${row('Set',c.set)}${row('Jahr / Saison',c.year)}${row('Kartennummer',c.number)}${row('Parallel',c.parallel)}${row('Zustand',c.condition)}${row('Grading',[c.grader,c.grade].filter(Boolean).join(' '))}${row('Anzahl',c.quantity)}${row('Kaufpreis / Karte',eur(c.purchasePrice))}${row('Marktwert / Karte',eur(c.marketValue))}<p class="field-hint">Preise sind manuelle Angaben, keine Live-Marktdaten.</p>${c.notes?`<p class="detail-notes">${esc(c.notes)}</p>`:''}</div></div><div class="detail-footer"><button class="button button-quiet" data-action="delete" data-id="${c.id}">${icon('trash')} Löschen</button><button class="button button-dark" data-action="edit" data-id="${c.id}">${icon('edit')} Bearbeiten</button></div>`;
  $('#detail-dialog').showModal();
}
async function saveDetection(card,photo=scanImage) {
  if(!card?.player)throw new Error('Bitte zuerst den Spielernamen ergänzen.');
  const saved=await api('/api/cards',{method:'POST',body:JSON.stringify({...card,image:photo,quantity:1,status:'Sammlung'})});
  savedScanId=saved.id;scanPhase='saved';
  await refresh();toast(`${saved.player} wurde erkannt und gespeichert.`);
}
const actions={
  add:()=>openForm(null,{wish:route==='wishlist'}), 'add-wish':()=>openForm(null,{wish:true}),
  scan:()=>location.hash='scan',
  'segment-nfl':()=>{if(scanBusy)return;segment='football';scanResults=[];catalogResults=[];savedScanId=null;scanPhase='idle';render();},
  'segment-nba':()=>{if(scanBusy)return;segment='basketball';scanResults=[];catalogResults=[];savedScanId=null;scanPhase='idle';render();},
  identify:async()=>{
    if(scanBusy||savedScanId)return;
    if(!scanImage){toast('Bitte zuerst ein Foto auswählen.',true);return;}
    const operation=++scanOperation,photo=scanImage;
    scanBusy=true;scanPhase='scanning';scanResults=[];render();
    try{
      const result=await api('/api/identify',{method:'POST',body:JSON.stringify({image:photo,segment})});
      if(operation!==scanOperation)return;
      scanResults=result.detections;
      scanPhase=scanResults.length?'recognized':'error';
      if(!scanResults.length)toast('Keine Karte zugeordnet. Bitte ein anderes Foto versuchen oder Details manuell erfassen.');
      const single=scanResults.length===1?scanResults[0]:null;
      if(autoSave&&single?.matchLevel==='card'&&single.confidence==='High'&&single.player)await saveDetection(single,photo);
    }catch(error){scanPhase=scanResults.length?'recognized':'error';throw error;}
    finally{scanBusy=false;render();}
  },
  'save-detection':async el=>{if(scanBusy||savedScanId)return;el.disabled=true;try{await saveDetection(scanResults[Number(el.dataset.index)]);render();}catch(error){el.disabled=false;throw error;}},
  'pick-detection':el=>openForm(null,{image:scanImage,prefill:scanResults[Number(el.dataset.index)]}),
  'pick-catalog':el=>openForm(null,{image:scanImage,prefill:catalogResults[Number(el.dataset.index)]}),
  'catalog-search':async el=>{
    const query=$('#catalog-query').value;el.disabled=true;
    try{const result=await api('/api/catalog',{method:'POST',body:JSON.stringify({query,segment})});catalogResults=result.results;renderCatalog();if(!catalogResults.length)toast('Keine Katalogtreffer. Bitte Suche präzisieren.');}finally{el.disabled=false;}
  }, 'close-dialog':()=>$('#card-dialog').close(), 'close-detail':()=>$('#detail-dialog').close(),
  detail:el=>detail(el.dataset.id),edit:el=>{$('#detail-dialog').close();openForm(cards.find(c=>c.id===el.dataset.id));},
  favorite:async el=>{const c=cards.find(c=>c.id===el.dataset.id);if(!c)return;el.disabled=true;await api(`/api/cards/${c.id}`,{method:'PUT',body:JSON.stringify({...c,favorite:!c.favorite})});await refresh();render();},
  delete:el=>{deleteId=el.dataset.id;$('#confirm-dialog').showModal();},
  'filter-favorites':()=>{filter.favorite=!filter.favorite;render();},
  'reset-filters':()=>{filter={query:'',sport:'',sort:'newest',favorite:false};render();},
  'use-photo':()=>openForm(null,{image:scanImage}), 'clear-scan':()=>{if(scanBusy)return;scanImage='';scanResults=[];savedScanId=null;scanPhase='idle';capture.stop();capture.mode='idle';render();},
  import:()=>$('#backup-input').click(),retry:async()=>{await refresh();loadError='';render();}
};
document.addEventListener('click',async e=>{const el=e.target.closest('[data-action]');if(!el)return;try{await actions[el.dataset.action]?.(el);}catch(error){toast(error.message,true);el.disabled=false;}});
document.addEventListener('keydown',e=>{if(e.target.id==='catalog-query'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-action=catalog-search]')?.click();}});
document.addEventListener('input',e=>{if(e.target.id==='search'){filter.query=e.target.value;renderResults();}});
document.addEventListener('change',async e=>{
  if(e.target.id==='auto-save'){autoSave=e.target.checked;try{localStorage.setItem('sideline-auto-save',String(autoSave));}catch{}}
  if(e.target.id==='sport-filter'){filter.sport=e.target.value;renderResults();}
  if(e.target.id==='sort-filter'){filter.sort=e.target.value;renderResults();}
  if(e.target.id==='scan-file'&&e.target.files[0])await selectScan(e.target.files[0]);
  if(e.target.id==='card-photo'&&e.target.files[0]){try{formImage=await readImage(e.target.files[0]);photoPreview();}catch(error){toast(error.message,true);}e.target.value='';}
});
$('#remove-photo').addEventListener('click',()=>{formImage='';$('#card-photo').value='';photoPreview();});
$('#card-form').addEventListener('submit',async e=>{
  e.preventDefault();const button=$('#save-card');button.disabled=true;$('#form-error').textContent='';
  const data=Object.fromEntries(new FormData(e.target));delete data[''];
  data.favorite=e.target.elements.favorite.checked;data.quantity=Number(data.quantity);
  for(const key of ['purchasePrice','marketValue'])data[key]=data[key]===''?null:Number(data[key]);
  data.image=formImage;
  try{await api(editingId?`/api/cards/${editingId}`:'/api/cards',{method:editingId?'PUT':'POST',body:JSON.stringify(data)});await refresh();$('#card-dialog').close();if(!editingId){scanOperation++;scanImage='';scanResults=[];savedScanId=null;scanPhase='idle';}render();toast(editingId?'Änderungen gespeichert.':'Dein neues Highlight ist gespeichert.');}catch(error){$('#form-error').textContent=error.message;}finally{button.disabled=false;}
});
$('#cancel-delete').addEventListener('click',()=>$('#confirm-dialog').close());
$('#confirm-delete').addEventListener('click',async()=>{
  const button=$('#confirm-delete');button.disabled=true;
  try{await api(`/api/cards/${deleteId}`,{method:'DELETE',body:'{}'});await refresh();$('#confirm-dialog').close();$('#detail-dialog').close();render();toast('Karte gelöscht.');}catch(error){toast(error.message,true);}finally{button.disabled=false;}
});
$('#backup-input').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>60_000_000)throw new Error('Das Backup ist zu groß (maximal 60 MB).');const data=JSON.parse(await file.text());const result=await api('/api/import',{method:'POST',body:JSON.stringify(data)});await refresh();render();toast(`${result.imported} Einträge importiert, ${result.skipped} vorhandene übersprungen.`);}catch(error){toast(error instanceof SyntaxError?'Die Datei enthält kein gültiges JSON.':error.message,true);}finally{e.target.value='';}
});
window.addEventListener('pagehide',()=>capture.stop());
window.addEventListener('hashchange',()=>{render();$('#main').focus({preventScroll:true});window.scrollTo(0,0);});
icons();$('#main').innerHTML='<div class="loading">Deine Sammlung wird geladen …</div>';
try{await refresh();status=await api('/api/status');}catch(error){loadError=error.message;}
render();
