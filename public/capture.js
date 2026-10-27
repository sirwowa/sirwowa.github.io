export function frameRect(width, height, landscape = false) {
  const ratio = landscape ? 7 / 5 : 5 / 7;
  const h = Math.min(height * .8, width * .8 / ratio);
  return { x:(width-h*ratio)/2, y:(height-h)/2, width:h*ratio, height:h };
}
export function coverRect(sourceWidth, sourceHeight, width, height) {
  const scale = Math.max(width/sourceWidth, height/sourceHeight);
  return {scale, x:(width-sourceWidth*scale)/2, y:(height-sourceHeight*scale)/2};
}
export function sourceCrop(sourceWidth,sourceHeight,width,height,frame) {
  const view=coverRect(sourceWidth,sourceHeight,width,height);
  return {x:(frame.x-view.x)/view.scale,y:(frame.y-view.y)/view.scale,width:frame.width/view.scale,height:frame.height/view.scale};
}

export class CardCapture {
  constructor({onPhoto,onError,canRecognize=()=>false}) {
    this.onPhoto=onPhoto;this.onError=onError;this.canRecognize=canRecognize;
    this.mode='idle';this.stream=null;this.host=null;this.source=null;
    this.landscape=false;this.zoom=1;this.panX=0;this.panY=0;this.request=0;
  }
  stop() {
    this.request++;
    this.observer?.disconnect();
    this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
    if(this.mode==='live'||this.mode==='requesting')this.mode='idle';
  }
  async start() {
    if(!window.isSecureContext){this.onError('Für die Kamera brauchst du HTTPS oder localhost. Du kannst stattdessen ein Foto hochladen.');return;}
    if(!navigator.mediaDevices?.getUserMedia){this.onError('Dieser Browser unterstützt keine Live-Kamera. Bitte ein Foto hochladen.');return;}
    this.stop();const token=this.request;this.mode='requesting';this.paint();
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}}});
      if(token!==this.request){stream.getTracks().forEach(track=>track.stop());return;}
      this.stream=stream;this.mode='live';this.paint();
    }catch(error){
      if(token!==this.request)return;
      this.mode='idle';this.paint();
      this.onError(error.name==='NotAllowedError'?'Kamerazugriff abgelehnt. Bitte in deinem Browser erlauben oder ein Foto hochladen.':error.name==='NotFoundError'?'Keine Kamera gefunden. Du kannst ein Foto hochladen.':'Die Kamera konnte nicht gestartet werden. Prüfe, ob sie bereits verwendet wird.');
    }
  }
  mount(host) {this.host=host;this.paint();}
  async load(dataURL) {
    this.stop();
    const source=new Image();await new Promise((resolve,reject)=>{source.onload=resolve;source.onerror=()=>reject(new Error('Das Foto konnte nicht geöffnet werden.'));source.src=dataURL;});
    this.source=source;this.mode='crop';this.zoom=1;this.panX=0;this.panY=0;
    this.landscape=source.width>source.height;this.paint();
  }
  paint() {
    if(!this.host?.isConnected)return;
    this.observer?.disconnect();
    if(this.mode==='idle') {
      this.host.innerHTML='<div class="camera-welcome"><div class="camera-outline" aria-hidden="true"><span></span><strong>DEINE NÄCHSTE<br>LIEBLINGSKARTE.</strong></div><h3>Deine Karte. Im Fokus.</h3><p>Richte deine NFL- oder NBA-Karte am Rahmen aus. Nur der Bereich im Rahmen wird gespeichert.</p><button class="button button-dark" data-camera="start">Kamera öffnen</button><span class="camera-privacy">Kamera erst nach deiner Freigabe · kein Ton</span></div>';
    }else if(this.mode==='requesting') {
      this.host.innerHTML='<div class="camera-welcome"><div class="camera-spinner"></div><h3>Deine Kamera wird vorbereitet …</h3><p>Erlaube den Kamerazugriff in deinem Browser.</p><button class="button button-secondary" data-camera="cancel">Abbrechen</button></div>';
    }else {
      const live=this.mode==='live';
      this.host.innerHTML=`<div class="camera-stage ${this.landscape?'landscape':''}">${live?'<video autoplay muted playsinline aria-label="Live-Kamera für deine Karte"></video>':'<canvas class="crop-canvas" width="1000" height="900" aria-label="Vorschau des Bildzuschnitts"></canvas>'}<div class="capture-frame"><i></i><i></i><i></i><i></i><span>${live?'KARTE IM RAHMEN AUSRICHTEN':'NUR DIESER BEREICH WIRD GESPEICHERT'}</span></div><span class="camera-live-label">${live?'<b></b> LIVE':'ZUSCHNITT'}</span></div>${!live?'<div class="crop-controls"><label>Zoom<input type="range" min="1" max="5" step="0.01" value="1" data-adjust="zoom"></label><label>Horizontal<input type="range" min="-1" max="1" step="0.01" value="0" data-adjust="panX"></label><label>Vertikal<input type="range" min="-1" max="1" step="0.01" value="0" data-adjust="panY"></label></div>':''}<div class="capture-actions"><button class="button button-secondary" data-camera="rotate">${this.landscape?'Hochformat':'Querformat'}</button><button class="shutter-button" data-camera="${live?'shoot':'apply'}">${live?'Fotografieren':'Zuschnitt übernehmen'}${this.canRecognize()?' & erkennen':''}</button><button class="icon-button" data-camera="cancel" aria-label="Kamera oder Zuschnitt schließen">×</button></div><p class="capture-help">${live?'Halte die Karte gerade und fülle den Rahmen möglichst genau aus.':'Verschiebe das Foto mit den Reglern, bis die Kartenränder genau im Rahmen liegen.'} ${this.canRecognize()?'Mit dem Aufnahme-Button wird der Zuschnitt zur Erkennung an Cardsight gesendet.':''}</p>`;
      if(live){const video=this.host.querySelector('video');video.srcObject=this.stream;video.play().catch(()=>this.onError('Bitte die Kamera erneut öffnen.'));}
      else {for(const input of this.host.querySelectorAll('[data-adjust]'))input.value=this[input.dataset.adjust];this.draw();}
      const layout=()=>{
        const stage=this.host.querySelector('.camera-stage'), frame=this.host.querySelector('.capture-frame');
        if(!stage||!frame)return;
        const rect=frameRect(stage.clientWidth,stage.clientHeight,this.landscape);
        Object.assign(frame.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});
        if(this.mode==='crop')this.draw();
      };
      layout();this.observer=new ResizeObserver(layout);this.observer.observe(this.host.querySelector('.camera-stage'));
    }
    this.host.onclick=event=>{const button=event.target.closest('[data-camera]');if(!button)return;const action=button.dataset.camera;
      if(action==='start')this.start();
      if(action==='cancel'){this.stop();this.mode='idle';this.paint();}
      if(action==='rotate'){this.landscape=!this.landscape;this.paint();}
      if(action==='shoot'||action==='apply')this.capture();
    };
    this.host.oninput=event=>{if(event.target.dataset.adjust){this[event.target.dataset.adjust]=Number(event.target.value);this.draw();}};
  }
  draw() {
    const canvas=this.host.querySelector('canvas');if(!canvas||!this.source)return;
    const stage=this.host.querySelector('.camera-stage');
    const displayWidth=stage.clientWidth || 500,displayHeight=stage.clientHeight || 450;
    const frame=frameRect(displayWidth,displayHeight,this.landscape);
    const scale=Math.max(frame.width/this.source.width,frame.height/this.source.height)*this.zoom;
    const w=this.source.width*scale,h=this.source.height*scale;
    const x=(displayWidth-w)/2+this.panX*Math.max(0,(w-frame.width)/2),y=(displayHeight-h)/2+this.panY*Math.max(0,(h-frame.height)/2);
    const ctx=canvas.getContext('2d');canvas.width=Math.round(displayWidth*2);canvas.height=Math.round(displayHeight*2);
    ctx.setTransform(2,0,0,2,0,0);ctx.fillStyle='#14251c';ctx.fillRect(0,0,displayWidth,displayHeight);ctx.drawImage(this.source,x,y,w,h);
    this.crop={x:(frame.x-x)/scale,y:(frame.y-y)/scale,width:frame.width/scale,height:frame.height/scale};
  }
  async capture() {
    try{
      let source,crop;
      if(this.mode==='live'){
        const video=this.host.querySelector('video');if(!video?.videoWidth)throw new Error('Die Kamera ist noch nicht bereit. Bitte einen Moment warten.');
        const stage=this.host.querySelector('.camera-stage');source=video;
        crop=sourceCrop(video.videoWidth,video.videoHeight,stage.clientWidth,stage.clientHeight,frameRect(stage.clientWidth,stage.clientHeight,this.landscape));
      }else {this.draw();source=this.source;crop=this.crop;}
      const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(crop.width,crop.height));
      canvas.width=Math.max(1,Math.round(crop.width*scale));canvas.height=Math.max(1,Math.round(crop.height*scale));
      canvas.getContext('2d').drawImage(source,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);
      const photo=canvas.toDataURL('image/jpeg',.92);
      this.stop();this.mode='idle';this.source=null;
      await this.onPhoto(photo,this.canRecognize());
    }catch(error){this.onError(error.message);}
  }
}
