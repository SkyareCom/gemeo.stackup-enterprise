(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='setup.html')return;
const params=new URLSearchParams(location.search);
const isNew=params.get('new')==='1';
const apply=()=>{
  if(!window.state)return false;
  const name=document.getElementById('tournamentName');
  const buy=document.getElementById('buyin');
  if(isNew){state.tournamentName='';state.buyin=0;if(typeof saveState==='function')saveState()}
  if(name){name.placeholder='NOME DO TORNEIO';if(isNew)name.value=''}
  if(buy){buy.placeholder='VALOR';if(isNew)buy.value=''}
  if(isNew){try{if(typeof renderSummary==='function')renderSummary()}catch(_){}}
  return !!(name&&buy);
};
const finish=()=>{
  if(!isNew)return;
  const u=new URL(location.href);u.searchParams.delete('new');history.replaceState(null,'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash);
};
const boot=()=>{let tries=0;const run=()=>{tries++;if(apply()||tries>=20){finish();return}setTimeout(run,50)};run()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();