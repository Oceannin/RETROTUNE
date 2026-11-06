async page => {
 const base='http://127.0.0.1:47832';
 const initial=await(await page.request.get(base+'/api/bootstrap')).json();
 const headers={'X-Retrotune-Token':initial.token};
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const save=async s=>{const r=await page.request.put(base+'/api/settings',{headers,data:s});assert(r.ok(),'settings failed')};
 const settled=async language=>{await page.waitForFunction(lang=>document.documentElement.lang===lang,language);for(let i=0;i<20;i++){const actual=await(await page.request.get(base+'/api/state')).json();if(actual.settings.language===language)return;await page.waitForTimeout(150)}throw Error('language not persisted')};
 await page.route('**/api/bootstrap',async route=>{const response=await route.fetch();const json=await response.json();json.sources=[];json.track=null;json.windowsStatus='Windows подключена · нет медиасессий';await route.fulfill({response,json})});
 try{
  await save({...initial.settings,language:'ru'});await page.goto(base);
  await page.getByRole('combobox',{name:'Язык интерфейса'}).selectOption('en');await settled('en');
  await page.getByRole('heading',{name:'Your music. Your style.'}).waitFor();
  const overlay=await page.context().newPage();
  try{
   await overlay.route('**/api/state',route=>route.fulfill({json:{settings:{...initial.settings,language:'en',emptyMode:'message'},track:null,serverTime:Date.now()/1000}}));
   await overlay.goto(base+'/overlay');await overlay.getByRole('article',{name:'Music widget'}).waitFor();
   assert((await overlay.locator('body').innerText()).includes('WAITING FOR MUSIC'),'Overlay status not translated');
   assert(!/[А-Яа-яЁё]/.test(await overlay.locator('body').innerText()),'Untranslated empty overlay');
   assert(await overlay.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor)==='rgba(0, 0, 0, 0)','Dark styling leaked into overlay background');
  }finally{await overlay.close()}
  await page.getByRole('checkbox',{name:'Demo track',exact:true}).check();
  for(const name of ['Style','Elements','Sources']){
   await page.getByRole('tab',{name,exact:true}).click();
   const text=await page.locator('.app-shell').innerText();
   assert(!/[А-Яа-яЁё]/.test(text),'Untranslated text on '+name+': '+text.match(/[^\n]*[А-Яа-яЁё][^\n]*/g));
  }
  await page.getByRole('button',{name:'Connect to OBS',exact:true}).click();
  assert(!/[А-Яа-яЁё]/.test(await page.getByRole('dialog').innerText()),'Untranslated help');
  await page.keyboard.press('Escape');
  const theme=page.getByRole('button',{name:'Editor theme',exact:true});
  if(await theme.getAttribute('aria-pressed')!=='true')await theme.click();
  assert(await page.evaluate(()=>document.documentElement.dataset.uiTheme)==='dark','Dark mode failed');
  await page.reload();await page.getByRole('heading',{name:'Your music. Your style.'}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.dataset.uiTheme)==='dark','Dark preference not retained');
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});
   await page.getByRole('tab',{name:'Elements',exact:true}).click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'English/dark overflow at '+width);
  }
  await page.setViewportSize({width:1440,height:1050});
  await page.getByRole('combobox',{name:'Interface language'}).selectOption('ru');await settled('ru');
  await page.getByRole('heading',{name:'Музыка в вашем стиле✦'}).waitFor();
  return ['all editor panels in English','empty OBS overlay in English','transparent overlay with dark editor','help in English','server language persistence','dark mode persistence','EN/dark responsive at 1440/768/390','Russian switchback'];
 }finally{await save(initial.settings);await page.unroute('**/api/bootstrap')}
}
