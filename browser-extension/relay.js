(() => {
 if(window.__retrotuneRelay)return;
 window.__retrotuneRelay=true;
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.type!=='RETROTUNE_METADATA_V1')return;
  const raw=event.data.payload;
  if(!raw||typeof raw!=='object')return;
  const payload={};
  for(const key of ['title','artist','album','cover'])payload[key]=typeof raw[key]==='string'?raw[key].slice(0,key==='cover'?2800000:1000):'';
  for(const key of ['position','duration','rate'])payload[key]=Number.isFinite(raw[key])?Math.max(0,raw[key]):0;
  payload.playing=raw.playing===true;
  chrome.runtime.sendMessage({type:'metadata',payload}).catch(()=>{});
 });
})();
