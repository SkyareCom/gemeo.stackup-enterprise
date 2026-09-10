(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='tournament-close.html')return;
const points=p=>Number(p?.rankingPoints??p?.generalRankingPoints??p?.points??p?.score??0)||0;
const currentRows=()=>{const event=String(state.eventId||'');return(state.players||[]).filter(p=>!p.validationEventId||String(p.validationEventId)===event).map(p=>({playerId:p.id,directoryId:p.directoryId||'',directoryCpf:p.directoryCpf||'',name:p.name||p.playerName||'JOGADOR',finishPosition:p.finishPosition||null,points:points(p)}))};
const stamp=()=>{const c=(state.eventClosures||[])[0];if(!c||String(c.eventId||'')!==String(state.eventId||''))return;c.environmentId=c.environmentId||state.activeEnvironmentId||state.clubId||'';c.environmentName=c.environmentName||state.activeEnvironmentName||state.clubName||'';c.environmentType=c.environmentType||state.activeEnvironmentType||'';c.rankingRows=currentRows();saveState()};
const bind=()=>{const b=document.getElementById('closeEvent');if(!b||b.dataset.rankingSnapshotBound==='1')return;b.dataset.rankingSnapshotBound='1';b.addEventListener('click',()=>setTimeout(stamp,0))};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();