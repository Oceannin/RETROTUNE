async page => {
 const assert=(value,message)=>{if(!value)throw Error(message)};
 const base='http://127.0.0.1:47832';
 const initial=await (await page.request.get(base+'/api/bootstrap')).json();
 const originalSettings=initial.settings;
 initial.settings={...initial.settings,language:'ru'};
 const headers={'X-Retrotune-Token':initial.token};
 const put=async settings=>{const r=await page.request.put(base+'/api/settings',{headers,data:settings});assert(r.ok(),'settings write failed')};
 const checks=[];
 try{
  await put(initial.settings);
  await page.goto(base);
  await page.getByRole('checkbox',{name:'Демо-трек',exact:true}).check();
  await page.getByRole('heading',{name:'A little break in the clouds'}).waitFor();
  checks.push('demo preview');
  for(const [name,layout] of [['CD-плеер','disc'],['Минимализм','minimal'],['Вертикальный','vertical'],['Свой вариант','custom'],['Классика','classic']]){
   await page.getByRole('button',{name:new RegExp(name+' ')}).click();
   await page.locator('.music-widget.layout-'+layout).waitFor();
   if(layout==='disc')assert(await page.locator('.disc.spinning').count()===1,'disc missing');
   if(layout==='minimal')assert(await page.locator('.album').count()===0,'minimal cover should be hidden');
  }
  checks.push('five layout presets');
  await page.getByRole('tab',{name:'Элементы',exact:true}).click();
  await page.getByRole('checkbox',{name:'CD-диск',exact:true}).check();
  assert(await page.locator('.disc').count()===1,'disc toggle');
  await page.getByRole('button',{name:'Пауза демо'}).click();
  assert(await page.locator('.disc.spinning').count()===0,'disc did not pause');
  await page.getByRole('button',{name:'Переместить обложку',exact:true}).click();
  assert(await page.locator('.widget-body').evaluate(el=>el.children[0].className)==='track-info','order did not change');
  checks.push('element toggle, disc pause, block order');
  // Live adapter input exercises the real API and independent OBS route.
  const title='Очень длинное название трека — путешествие по облачному городу и бесконечным улицам ночного эфира · Extended Live Version 2026';
  const fixture={id:'test:browser-smoke',title,artist:'Тест кириллицы · Исполнитель',label:'Проверка',duration:300,position:90,playing:true,rate:1,cover:''};
  let r=await page.request.post(base+'/api/ingest',{headers,data:fixture});assert(r.ok(),'ingest failed');
  await put({...initial.settings,source:fixture.id,width:480});
  await page.goto(base+'/overlay');
  await page.getByRole('heading',{name:title}).waitFor();
  assert(await page.locator('.marquee.overflowing').count()>0,'long Cyrillic text did not scroll');
  assert(await page.locator('.cover-fallback').count()===1,'missing cover fallback');
  const oldPos=Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  await page.waitForTimeout(1200);
  const newPos=Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  assert(newPos>oldPos,'live progress not advancing');
  assert(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)==='rgba(0, 0, 0, 0)','OBS background not transparent');
  assert(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor)==='rgba(0, 0, 0, 0)','OBS root background not transparent');
  await page.screenshot({path:'output/playwright/overlay-cyrillic.png',omitBackground:true});
  checks.push('live API, Cyrillic marquee, fallback artwork, progress, transparency');
  await put({...initial.settings,source:fixture.id,hidePaused:true});
  await page.request.post(base+'/api/ingest',{headers,data:{...fixture,playing:false}});
  await page.getByRole('article',{name:'Музыкальный виджет'}).waitFor({state:'detached'});
  checks.push('hide paused');
  await page.request.post(base+'/api/remove-source',{headers,data:{id:fixture.id}});
  await put({...initial.settings,source:fixture.id});
  await page.waitForTimeout(600);
  assert(await page.locator('.music-widget').count()===0,'explicit source fell back');
  checks.push('missing pinned source stays hidden');
  await put(initial.settings);
  await page.goto(base);
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});
   await page.waitForTimeout(100);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow at '+width);
   await page.screenshot({path:'output/playwright/editor-'+width+'.png',fullPage:true});
  }
  checks.push('desktop, tablet, mobile page widths');
  await page.setViewportSize({width:1440,height:1050});
  await page.getByRole('button',{name:'Подключить к OBS',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'detached'});
  checks.push('help dialog Escape');
  return checks;
 }finally{
  await put(originalSettings);
  await page.request.post(base+'/api/remove-source',{headers,data:{id:'test:browser-smoke'}});
 }
}
