(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='setup.html')return;
const params=new URLSearchParams(location.search);
if(params.get('new')!=='1')return;
const key='poker-club-state-v4';
try{
  const raw=localStorage.getItem(key);
  if(raw){
    const saved=JSON.parse(raw);
    if(saved&&typeof saved==='object'){
      saved.tournamentName='';
      saved.buyin=0;
      localStorage.setItem(key,JSON.stringify(saved));
    }
  }
}catch(_){ }
})();