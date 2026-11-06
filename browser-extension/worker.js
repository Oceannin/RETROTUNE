const base='http://127.0.0.1:47832';
async function push(path,body,token){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','X-Retrotune-Token':token},body:JSON.stringify(body)});if(!r.ok)throw Error((await r.json()).error||'Ошибка сервиса');return r.json()}
async function namespace(){const state=await chrome.storage.local.get('namespace');if(state.namespace)return state.namespace;const value=crypto.randomUUID();await chrome.storage.local.set({namespace:value});return value}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
 (async()=>{
  if(message.type==='connect'){
   const tab=await chrome.tabs.get(message.tabId);
   if(!/^https?:/.test(tab.url||''))throw Error('Откройте обычную HTTP/HTTPS страницу с музыкой');
   // Validate pairing before marking the tab as connected.
   await push('/api/ingest',{id:`browser:${await namespace()}:${tab.id}`,label:tab.title||'Вкладка',title:'Подключение…',playing:false},message.token);
   const {connected={}}=await chrome.storage.local.get('connected');connected[tab.id]=true;
   await chrome.storage.local.set({token:message.token,connected});
   await chrome.scripting.executeScript({target:{tabId:tab.id},files:['relay.js'],world:'ISOLATED'});
   await chrome.scripting.executeScript({target:{tabId:tab.id},files:['page.js'],world:'MAIN'});
   return {ok:true};
  }
  if(message.type==='disconnect'){
   const {token,connected={}}=await chrome.storage.local.get(['token','connected']);delete connected[message.tabId];await chrome.storage.local.set({connected});
   if(token)await push('/api/remove-source',{id:`browser:${await namespace()}:${message.tabId}`},token);
   return {ok:true};
  }
  if(message.type==='metadata'&&sender.tab&&sender.frameId===0){
   const {token,connected={}}=await chrome.storage.local.get(['token','connected']);if(!token||!connected[sender.tab.id])return {ok:false};
   await push('/api/ingest',{...message.payload,id:`browser:${await namespace()}:${sender.tab.id}`,label:sender.tab.title||'Вкладка браузера'},token);
   return {ok:true};
  }
  return {ok:false};
 })().then(respond).catch(e=>respond({error:e.message}));return true;
});
chrome.tabs.onRemoved.addListener(async id=>{const {token,connected={}}=await chrome.storage.local.get(['token','connected']);if(!connected[id])return;delete connected[id];await chrome.storage.local.set({connected});if(token)await push('/api/remove-source',{id:`browser:${await namespace()}:${id}`},token).catch(()=>{})});
