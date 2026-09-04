(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const $=id=>document.getElementById(id);
  const lock=(els,on=true)=>els.filter(Boolean).forEach(el=>{if(el.tagName==='SELECT'||el.type==='checkbox')el.disabled=on;else el.readOnly=on});
  const addConfirm=(anchor,id,label='CONFIRMAR')=>{if(!anchor||$(id))return null;const b=document.createElement('button');b.type='button';b.id=id;b.className='primary';b.textContent=label;b.style.marginTop='8px';anchor.insertAdjacentElement('afterend',b);return b};
  const loadInlineLists=()=>{if(document.querySelector('script[data-stackup-inline-lists]'))return;const s=document.createElement('script');s.src='in-app-lists.js?v=82d1d75221517915f988a62ba0208af0c80bb3bd';s.defer=true;s.dataset.stackupInlineLists='1';(document.head||document.documentElement).appendChild(s)};

  function setup(){
    if(page!=='setup.html')return;
    const numericIds=['buyin','buyinChips','earlyBonusValue','earlyBonusChips','rebuyValue','rebuyChips','doubleRebuyValue','doubleRebuyChips','reentryValue','reentryChips','addonValue','addonChips','specialAddonValue','specialAddonChips','addonBonusValue','addonBonusChips','bountyValue','fee'];
    const headerIds=['clubName','tournamentName','language','tournamentFormat','gameType','seatsPerTable','bountyRecurring','bountyDoubleSecond'];
    const fields=[...headerIds,...numericIds].map($).filter(Boolean);
    numericIds.forEach(id=>{const el=$(id);if(!el)return;el.onclick=null;el.onfocus=null;el.readOnly=false;el.inputMode='decimal';el.value=(+state[id]||0)?String(state[id]):''});
    headerIds.forEach(id=>{const el=$(id);if(!el)return;if(id==='clubName')el.value=state.clubName||'';else if(id==='tournamentName')el.value=state.tournamentName||'';else if(id==='language')el.value=state.language||'';else if(id==='tournamentFormat')el.value=state.tournamentFormat||'';else if(id==='gameType')el.value=state.gameType||'';else if(id==='seatsPerTable')el.value=state.seatsPerTable||'';else if(id==='bountyRecurring')el.checked=!!state.bountyRecurring;else if(id==='bountyDoubleSecond')el.checked=!!state.bountyDoubleSecond});
    const anchor=$('fee')?.closest('.valueRow')||$('fee');
    const confirm=addConfirm(anchor,'confirmTournamentData');
    if(!confirm)return;
    const saveDraft=()=>{
      state.clubName=$('clubName')?.value.trim()||'';state.tournamentName=$('tournamentName')?.value.trim()||'';state.language=$('language')?.value||'';state.tournamentFormat=$('tournamentFormat')?.value||'';state.gameType=$('gameType')?.value||'';state.seatsPerTable=+$('seatsPerTable')?.value||'';
      numericIds.forEach(id=>state[id]=Math.max(0,+($(id)?.value||0)));
      state.bountyRecurring=!!$('bountyRecurring')?.checked;state.bountyOnReentry=state.bountyRecurring;state.bountyDoubleSecond=!!$('bountyDoubleSecond')?.checked;
      saveState();if(typeof renderSummary==='function')renderSummary();lock(fields,true);confirm.textContent='CONFIRMADO';confirm.disabled=true;
    };
    fields.forEach(el=>{const evt=el.type==='checkbox'||el.tagName==='SELECT'?'change':'input';el.addEventListener(evt,()=>{lock(fields,false);confirm.disabled=false;confirm.textContent='CONFIRMAR'})});
    confirm.onclick=saveDraft;
  }

  function finance(){
    if(page!=='finance-settings.html')return;
    const main=$('save'),player=$('savePlayerRule');if(main)main.textContent='CONFIRMAR';if(player)player.textContent='CONFIRMAR';
    const mainFields=['closingCurrency','centralBank','rateDate','ratePYG','rateUSD','rateARS','rateEUR','buyinPct','rebuyPct','reentryPct','addonPct','expiryPct'].map($).filter(Boolean);
    main?.addEventListener('click',()=>setTimeout(()=>lock(mainFields,true),0));
    mainFields.forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>lock(mainFields,false)));
  }

  function communications(){
    if(page!=='communications.html')return;
    const enhance=()=>document.querySelectorAll('#players .player').forEach(card=>{const phone=card.querySelector('[data-phone]');if(!phone||card.querySelector('[data-confirm-phone]'))return;phone.onchange=null;const b=document.createElement('button');b.type='button';b.className='primary';b.dataset.confirmPhone=phone.dataset.phone;b.textContent='CONFIRMAR';b.style.marginTop='8px';phone.parentElement.appendChild(b);b.onclick=()=>{const p=(state.players||[]).find(x=>String(x.id)===String(phone.dataset.phone));if(!p)return;p.phone=phone.value.trim();saveState();phone.readOnly=true;b.textContent='CONFIRMADO';b.disabled=true};phone.addEventListener('input',()=>{phone.readOnly=false;b.disabled=false;b.textContent='CONFIRMAR'})});
    enhance();new MutationObserver(enhance).observe(document.getElementById('players')||document.body,{childList:true,subtree:true});
  }

  function simpleFilter(){
    if(page==='ranking-general.html'){
      const fields=[$('scope'),$('league'),$('period')].filter(Boolean),b=addConfirm($('period'),'confirmRankingFilter');if(!b)return;b.onclick=()=>{if(typeof render==='function')render();lock(fields,true);b.textContent='CONFIRMADO';b.disabled=true};fields.forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{lock(fields,false);b.textContent='CONFIRMAR';b.disabled=false}));
    }
    if(page==='recognition.html'){
      const input=$('search'),b=addConfirm(input,'confirmRecognitionSearch');if(!b)return;b.onclick=()=>{if(typeof render==='function')render();input.readOnly=true;b.textContent='CONFIRMADO';b.disabled=true};input?.addEventListener('input',()=>{input.readOnly=false;b.textContent='CONFIRMAR';b.disabled=false});
    }
    if(page==='tournament-players.html'){
      const b=$('selectPlayer');if(b)b.textContent='CONFIRMAR';
    }
  }

  function structureImport(){
    if(page!=='structure-import.html')return;
    const b=$('saveBtn');if(!b)return;b.textContent='CONFIRMAR';b.addEventListener('click',()=>setTimeout(()=>{const fields=[$('structureName'),...document.querySelectorAll('#levels input[data-k]')];lock(fields,true);b.textContent='CONFIRMADO';b.disabled=true},0));
    document.getElementById('resultBox')?.addEventListener('input',()=>{b.disabled=false;b.textContent='CONFIRMAR';lock([$('structureName'),...document.querySelectorAll('#levels input[data-k]')],false)});
  }

  const boot=()=>{loadInlineLists();setup();finance();communications();simpleFilter();structureImport()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();