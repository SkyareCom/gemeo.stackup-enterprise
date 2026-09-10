(function(){
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const $=id=>document.getElementById(id);
  const lock=(els,on=true)=>els.filter(Boolean).forEach(el=>{if(el.tagName==='SELECT'||el.type==='checkbox')el.disabled=on;else el.readOnly=on});
  const loadUiStandard=()=>{if(document.querySelector('script[data-stackup-ui-standard]'))return;const s=document.createElement('script');s.src='ui-standard.js?v=publication0914';s.defer=true;s.dataset.stackupUiStandard='1';(document.head||document.documentElement).appendChild(s)};
  const loadInlineLists=()=>{if(document.querySelector('script[data-stackup-inline-lists]'))return;const s=document.createElement('script');s.src='in-app-lists.js?v=publication0914';s.defer=true;s.dataset.stackupInlineLists='1';(document.head||document.documentElement).appendChild(s)};

  function setup(){
    if(page!=='setup.html')return;
    const numericIds=['buyin','buyinChips','earlyBonusValue','earlyBonusChips','rebuyValue','rebuyChips','doubleRebuyValue','doubleRebuyChips','reentryValue','reentryChips','addonValue','addonChips','specialAddonValue','specialAddonChips','addonBonusValue','addonBonusChips','bountyValue','fee'];
    const headerIds=['clubName','tournamentName','language','tournamentFormat','gameType','seatsPerTable','bountyRecurring','bountyDoubleSecond'];
    const fields=[...headerIds,...numericIds].map($).filter(Boolean);
    numericIds.forEach(id=>{const el=$(id);if(!el)return;el.onclick=null;el.onfocus=null;el.readOnly=false;el.inputMode='decimal';el.value=(+state[id]||0)?String(state[id]):''});
    headerIds.forEach(id=>{const el=$(id);if(!el)return;if(id==='clubName')el.value=state.clubName||'';else if(id==='tournamentName')el.value=state.tournamentName||'';else if(id==='language')el.value=state.language||'';else if(id==='tournamentFormat')el.value=state.tournamentFormat||'';else if(id==='gameType')el.value=state.gameType||'';else if(id==='seatsPerTable')el.value=state.seatsPerTable||'';else if(id==='bountyRecurring')el.checked=!!state.bountyRecurring;else if(id==='bountyDoubleSecond')el.checked=!!state.bountyDoubleSecond});
    const confirm=$('setupConfirmData')||$('confirmTournamentData');
    if(!confirm)return;
    const saveDraft=()=>{state.clubName=$('clubName')?.value.trim()||'';state.tournamentName=$('tournamentName')?.value.trim()||'';state.language=$('language')?.value||'';state.tournamentFormat=$('tournamentFormat')?.value||'';state.gameType=$('gameType')?.value||'';state.seatsPerTable=+$('seatsPerTable')?.value||'';numericIds.forEach(id=>state[id]=Math.max(0,+($(id)?.value||0)));state.bountyRecurring=!!$('bountyRecurring')?.checked;state.bountyOnReentry=state.bountyRecurring;state.bountyDoubleSecond=!!$('bountyDoubleSecond')?.checked;saveState();if(typeof renderSummary==='function')renderSummary();lock(fields,true);confirm.textContent='CONFIRMADO';confirm.disabled=true};
    fields.forEach(el=>{const evt=el.type==='checkbox'||el.tagName==='SELECT'?'change':'input';el.addEventListener(evt,()=>{lock(fields,false);confirm.disabled=false;confirm.textContent='CONFIRMAR'})});
    if(!confirm.dataset.stackupDataEntryBound){confirm.dataset.stackupDataEntryBound='1';confirm.addEventListener('click',saveDraft)}
  }

  function finance(){
    if(page!=='finance-settings.html')return;
    const main=$('save'),player=$('savePlayerRule');
    if(main)main.textContent='CONFIRMAR';
    if(player)player.textContent='CONFIRMAR';
  }

  function structureImport(){
    if(page!=='structure-import.html')return;
    const b=$('saveBtn');if(!b)return;
    b.textContent='CONFIRMAR';
  }

  const boot=()=>{
    loadUiStandard();
    loadInlineLists();
    setup();
    finance();
    structureImport();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();