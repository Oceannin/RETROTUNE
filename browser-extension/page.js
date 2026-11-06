(() => {
 if(window.__retrotunePage)return;
 window.__retrotunePage=true;
 const send=()=>{
  const media=[...document.querySelectorAll('audio,video')].filter(x=>!x.ended&&x.readyState>0).sort((a,b)=>Number(a.paused)-Number(b.paused)||Number(b.duration||0)-Number(a.duration||0))[0];
  const metadata=navigator.mediaSession?.metadata;
  const duration=media&&Number.isFinite(media.duration)?media.duration:0;
  const artwork=metadata?.artwork||[];
  const cover=artwork.length?artwork[artwork.length-1].src:'';
  const safeCover=cover.length<=2800000&&(cover.startsWith('https://')||/^data:image\/(png|jpeg|webp);base64,/.test(cover))?cover:'';
  window.postMessage({type:'RETROTUNE_METADATA_V1',payload:{title:metadata?.title||document.title,artist:metadata?.artist||'',album:metadata?.album||'',cover:safeCover,position:duration?media.currentTime:0,duration,rate:media?.playbackRate||1,playing:media?!media.paused:navigator.mediaSession?.playbackState==='playing'}},location.origin);
 };
 send();setInterval(send,1000);
})();
