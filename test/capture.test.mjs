import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameRect, sourceCrop } from '../public/capture.js';
test('portrait and landscape frames stay centered inside desktop and mobile stages',()=>{
  for(const[w,h]of[[600,440],[320,390],[150,440]])for(const landscape of[true,false]){
    const r=frameRect(w,h,landscape);
    assert.ok(r.x>0&&r.y>0);assert.ok(r.width<=w*.8+.001&&r.height<=h*.8+.001);
    assert.ok(Math.abs(r.width/r.height-(landscape?7/5:5/7))<1e-10);
    assert.equal(r.x*2+r.width,w);assert.equal(r.y*2+r.height,h);
  }
});
test('camera crop accounts for object-fit cover and stays within source pixels',()=>{
  for(const[sw,sh,w,h]of[[1920,1080,320,390],[1080,1920,600,440],[1280,720,600,440]]){
    const crop=sourceCrop(sw,sh,w,h,frameRect(w,h));
    assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.width<=sw+.001&&crop.y+crop.height<=sh+.001);
    assert.ok(Math.abs(crop.width/crop.height-5/7)<1e-10);
    assert.ok(Math.abs(crop.x*2+crop.width-sw)<1e-8);
    assert.ok(Math.abs(crop.y*2+crop.height-sh)<1e-8);
  }
});
