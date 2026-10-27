// Contract: https://api.cardsight.ai/documentation/json (OpenAPI, inspected 2026-10-27).
export class CardsightError extends Error {
  constructor(message,status=502) { super(message); this.status=status; }
}
export async function requestCardsight(path,{key,method='GET',body,contentType,fetcher=fetch}={}) {
  if(!key)throw new CardsightError('Bitte CARDSIGHT_API_KEY sicher auf dem Server hinterlegen.',503);
  try {
    const response=await fetcher(`https://api.cardsight.ai${path}`,{method,body,headers:{'X-API-Key':key,'User-Agent':'Sideline/1.0','Accept':'application/json',...(contentType?{'Content-Type':contentType}:{})},signal:AbortSignal.timeout(45000),redirect:'error'});
    if(!response.ok)throw new CardsightError(response.status===401?'Cardsight hat den API-Schlüssel abgelehnt.':response.status===403?'Dein Cardsight-Zugang erlaubt diese Funktion nicht.':response.status===429?'Das Cardsight-Anfragelimit ist erreicht. Bitte später erneut versuchen.':response.status===400?'Cardsight konnte das Foto nicht verarbeiten. Bitte ein anderes Foto versuchen.':'Cardsight ist momentan nicht verfügbar.',response.status===429?429:502);
    return await response.json();
  }catch(e){if(e instanceof CardsightError)throw e;throw new CardsightError(e.name==='TimeoutError'?'Die Erkennung hat zu lange gedauert. Bitte erneut versuchen.':'Cardsight ist nicht erreichbar. Prüfe die Netzwerkverbindung.');}
}
const safe=value=>typeof value==='string'?value.slice(0,200):'';
export function mapDetection(d, sport) {
  const c=d.card || {};
  return {player:safe(c.name),set:[c.releaseName,c.setName].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' · ').slice(0,200),year:safe(c.year),number:safe(c.number),parallel:safe(c.parallelSuggestions?.[0]?.name),grader:safe(d.grading?.company?.name),grade:safe(d.grading?.grade?.value),sport:sport==='football'?'American Football':sport==='basketball'?'Basketball':'Andere',cardsightId:safe(c.id),confidence:['High','Medium','Low'].includes(d.confidence)?d.confidence:'Low',matchLevel:c.id?'card':c.setId?'set':'none'};
}
export function mapSearch(c) {
  const sports={Football:'American Football',Basketball:'Basketball',Baseball:'Baseball',Hockey:'Eishockey',Soccer:'Fußball'};
  return {player:safe(c.name),set:[c.releaseName,c.setName].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' · ').slice(0,200),year:safe(c.year),number:safe(c.cardNumber),parallel:safe(c.parallelName),sport:sports[c.segmentName] || 'Andere',cardsightId:safe(c.id)};
}
