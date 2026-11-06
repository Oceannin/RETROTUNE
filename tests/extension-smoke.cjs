async page => {
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const base='http://127.0.0.1:47832';
 const context=page.context();
 const worker=context.serviceWorkers().find(w=>w.url().includes('/worker.js'))||await context.waitForEvent('serviceworker');
 const extensionOrigin=worker.url().split('/').slice(0,3).join('/');
 const initial=await(await page.request.get(base+'/api/bootstrap')).json();
 const fixtureURL=base+'/music-fixture';
 await page.route(fixtureURL,route=>route.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><meta charset="UTF-8"><title>RETROTUNE fixture tab</title><audio id="music" loop></audio><script>
 const wave=new Uint8Array(44+48000*2*20);const view=new DataView(wave.buffer);const str=(offset,value)=>[...value].forEach((c,i)=>wave[offset+i]=c.charCodeAt(0));str(0,'RIFF');view.setUint32(4,wave.length-8,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,48000,true);view.setUint32(28,96000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,wave.length-44,true);music.src=URL.createObjectURL(new Blob([wave],{type:'audio/wav'}));music.play();navigator.mediaSession.metadata=new MediaMetadata({title:'Конкретная вкладка · тест',artist:'Исполнитель из MediaSession',album:'Тестовый альбом'});
 </script>`}));
 await page.goto(fixtureURL);
 await page.waitForFunction(()=>document.querySelector('audio').readyState>0&&!document.querySelector('audio').paused);
 await page.evaluate(async()=>{const img=new Image();img.src='/assets/cloud-city.svg';await img.decode();const canvas=document.createElement('canvas');canvas.width=240;canvas.height=240;canvas.getContext('2d').drawImage(img,0,0,240,240);navigator.mediaSession.metadata=new MediaMetadata({title:'Конкретная вкладка · тест',artist:'Исполнитель из MediaSession',album:'Тестовый альбом',artwork:[{src:canvas.toDataURL('image/png'),sizes:'240x240',type:'image/png'}]})});
 const tabId=await worker.evaluate(async url=>(await chrome.tabs.query({url}))[0].id,fixtureURL);
 const popup=await context.newPage();
 try{
  await popup.goto(extensionOrigin+'/popup.html');
  await popup.locator('#token').fill(initial.token);
  const settingsHeaders={'X-Retrotune-Token':initial.token};
  for(const language of ['en','ru']){
   await page.request.put(base+'/api/settings',{headers:settingsHeaders,data:{...initial.settings,language}});
   await popup.reload();await popup.getByRole('button',{name:language==='en'?'Connect this tab':'Подключить эту вкладку',exact:true}).waitFor();
  }
  await page.request.put(base+'/api/settings',{headers:settingsHeaders,data:initial.settings});
  let result=await popup.evaluate(async({tabId,token})=>chrome.runtime.sendMessage({type:'connect',tabId,token}),{tabId,token:initial.token});
  assert(result.ok,'Extension connect failed: '+result.error);
  const poll=async predicate=>{let last;for(let i=0;i<20;i++){const value=await(await page.request.get(base+'/api/bootstrap')).json();last=value.sources.map(x=>({id:x.id,kind:x.kind,title:x.title,duration:x.duration,playing:x.playing}));const source=value.sources.find(x=>x.kind==='browser'&&x.title==='Конкретная вкладка · тест');if(predicate(source))return source;await page.waitForTimeout(300)}throw Error('Extension metadata timed out: '+JSON.stringify({sources:last,page:await page.evaluate(()=>({title:navigator.mediaSession.metadata?.title,probe:window.__retrotunePage,playing:!document.querySelector('audio').paused}))}))};
  let source=await poll(x=>x?.playing&&x.duration>0&&x.cover.startsWith('data:image/png;base64,'));
  assert(source.artist==='Исполнитель из MediaSession','MediaSession artist missing');
  assert(source.duration===20,'Audio duration incorrect');
  await page.evaluate(()=>document.querySelector('audio').pause());
  await poll(x=>x&&!x.playing);
  result=await popup.evaluate(async tabId=>chrome.runtime.sendMessage({type:'disconnect',tabId}),tabId);
  assert(result.ok,'disconnect failed');
  const latest=await(await page.request.get(base+'/api/bootstrap')).json();
  assert(!latest.sources.some(x=>x.id===source.id),'Disconnected tab remained in sources');
  return {extensionLoaded:true,englishPopup:true,russianPopup:true,tabMetadata:true,artwork:true,artist:true,duration:20,pause:true,disconnect:true};
 }finally{
  await popup.evaluate(async tabId=>chrome.runtime.sendMessage({type:'disconnect',tabId}),tabId).catch(()=>{});
  await popup.close();
  await page.request.put(base+'/api/settings',{headers:{'X-Retrotune-Token':initial.token},data:initial.settings});
  await page.goto(base);
 }
}
