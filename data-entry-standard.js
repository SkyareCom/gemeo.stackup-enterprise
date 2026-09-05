(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const $=id=>document.getElementById(id);
  const lock=(els,on=true)=>els.filter(Boolean).forEach(el=>{if(el.tagName==='SELECT'||el.type==='checkbox')el.disabled=on;else el.readOnly=on});
  const addConfirm=(anchor,id,label='CONFIRMAR')=>{if(!anchor||$(id))return null;const b=document.createElement('button');b.type='button';b.id=id;b.className='primary';b.textContent=label;b.style.marginTop='8px';anchor.insertAdjacentElement('afterend',b);return b};
  const loadUiStandard=()=>{if(document.querySelector('script[data-stackup-ui-standard]'))return;const s=document.createElement('script');s.src='ui-standard.js?v=707265684f91c0a577ab56d2a6da22b6c2be5441';s.defer=true;s.dataset.stackupUiStandard='1';(document.head||document.documentElement).appendChild(s)};
  const loadInlineLists=()=>{if(document.querySelector('script[data-stackup-inline-lists]'))return;const s=document.createElement('script');s.src='in-app-lists.js?v=32d336dd60ce96d4a95f29c07daf76191ebec699';s.defer=true;s.dataset.stackupInlineLists='1';(document.head||document.documentElement).appendChild(s)};

  const digits=v=>String(v||'').replace(/\D/g,'');
  const formatCpf=v=>{const d=digits(v).slice(0,11);if(d.length<=3)return d;if(d.length<=6)return `${d.slice(0,3)}.${d.slice(3)}`;if(d.length<=9)return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`};
  const formatPhone=v=>{const d=digits(v).slice(0,11);if(!d)return'';if(d.length<=2)return `(${d}`;return `(${d.slice(0,2)}) ${d.slice(2)}`};
  const fieldKind=el=>{if(!(el instanceof HTMLInputElement))return'';const hay=[el.id,el.name,el.placeholder,el.getAttribute('aria-label'),el.dataset?.field,el.dataset?.type].filter(Boolean).join(' ').toUpperCase();if(/\bCPF\b/.test(hay))return'cpf';if(/WHATS|WHATSAPP/.test(hay))return'whats';if(/TELEFONE|TELEFONE|PHONE|CELULAR|FONE/.test(hay))return'phone';return''};
  const bindAutoFormat=el=>{const kind=fieldKind(el);if(!kind||el.dataset.stackupAutoFormat===kind)return;el.dataset.stackupAutoFormat=kind;el.inputMode='numeric';el.autocomplete='tel';if(kind==='cpf'){el.maxLength=14;el.placeholder='000.000.000-00';el.value=formatCpf(el.value)}else{el.maxLength=14;el.placeholder='(00) 000000000';el.value=formatPhone(el.value)}const apply=()=>{const next=kind==='cpf'?formatCpf(el.value):formatPhone(el.value);if(el.value!==next)el.value=next};el.addEventListener('input',apply);el.addEventListener('change',apply);el.addEventListener('blur',apply);apply()};
  const autoFormatIdentityAndContacts=()=>{document.querySelectorAll('input').forEach(bindAutoFormat);const root=document.body||document.documentElement;if(!root||root.dataset.stackupMaskObserver==='1')return;root.dataset.stackupMaskObserver='1';new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes){if(!(n instanceof Element))continue;if(n.matches?.('input'))bindAutoFormat(n);n.querySelectorAll?.('input').forEach(bindAutoFormat)}}).observe(root,{childList:true,subtree:true})};

  function directoryHub(){
    if(!['staff.html','players-directory.html'].includes(page)||document.documentElement.dataset.directoryMode==='1')return;
    document.documentElement.dataset.directoryMode='1';
    const params=new URLSearchParams(location.search),view=params.get('view')||'';
    const staff=page==='staff.html';
    if(staff&&location.hash==='#ambientes'){location.replace('environments.html');return}
    const registrationTitle=[...document.querySelectorAll('.section')].find(el=>/CADASTRO DE (STAFF|JOGADORES)/.test(el.textContent||''));
    const registration=registrationTitle?.nextElementSibling,historyBtn=$('historyBtn'),history=$('history');
    if(!registrationTitle||!registration||!historyBtn||!history)return;
    const envTitle=staff?[...document.querySelectorAll('.section')].find(el=>String(el.textContent||'').trim()==='AMBIENTES'):null;
    const envForm=envTitle?.nextElementSibling;
    if(envTitle)envTitle.style.display='none';
    if(envForm)envForm.style.display='none';
    const style=document.createElement('style');style.id='directory-secondary-screen-style';style.textContent=`
      .directoryHub{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin:0!important;align-items:stretch!important}
      .directoryHubCard{display:flex!important;flex-direction:column!important;gap:12px!important;text-decoration:none!important;color:#fff!important;background:linear-gradient(#0B100D,#060907)!important;border:1px solid #27342D!important;border-radius:14px!important;padding:18px!important;height:150px!important;box-sizing:border-box!important;overflow:hidden!important;margin:0!important;box-shadow:none!important}
      .directoryHubCard:hover{border-color:#8DFC3B!important}
      .directoryHubTag{color:#8DFC3B!important;font-size:11px!important;line-height:1.2!important;letter-spacing:1px!important;margin:0!important}
      .directoryHubName{color:#fff!important;font-size:18px!important;line-height:1.15!important;margin:0!important}
      .directoryHubDesc{color:#9CA69F!important;font-size:12px!important;line-height:1.35!important;margin-top:auto!important;margin-bottom:0!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important}
      @media(max-width:700px){.directoryHub{grid-template-columns:1fr!important}.directoryHubCard{height:136px!important;padding:16px!important}}
    `;document.head.appendChild(style);
    if(!view){
      const hub=document.createElement('div');hub.className='directoryHub';hub.dataset.directoryHub='1';
      const make=(tag,name,desc,href)=>{const a=document.createElement('a');a.className='directoryHubCard';a.href=href;a.innerHTML=`<div class="directoryHubTag">${tag}</div><div class="directoryHubName">${name}</div><div class="directoryHubDesc">${desc}</div>`;return a};
      if(staff){
        hub.append(
          make('01 • CADASTRO','CADASTRAR STAFF','INCLUA NOVOS MEMBROS DA EQUIPE, DEFINA FUNÇÃO, AMBIENTE E ACESSOS.','staff.html?view=register'),
          make('02 • BASE CADASTRADA','STAFF CADASTRADO','CONSULTE, EDITE E GERENCIE OS MEMBROS DA EQUIPE JÁ CADASTRADOS.','staff.html?view=registered')
        );
      }else{
        hub.append(
          make('01 • CADASTRO','CADASTRAR JOGADOR','INCLUA NOVOS JOGADORES NA BASE GERAL COM DADOS DE CONTATO E PERFIL.','players-directory.html?view=register'),
          make('02 • BASE CADASTRADA','JOGADORES CADASTRADOS','CONSULTE, EDITE E GERENCIE OS JOGADORES JÁ CADASTRADOS.','players-directory.html?view=registered')
        );
      }
      registrationTitle.replaceWith(hub);
      registration.style.display='none';historyBtn.style.display='none';history.style.display='none';
      return;
    }
    if(view==='register'){
      registrationTitle.textContent=staff?'CADASTRAR STAFF':'CADASTRAR JOGADOR';
      registration.style.display='block';historyBtn.style.display='none';history.style.display='none';
      return;
    }
    if(view==='registered'){
      registrationTitle.textContent=staff?'STAFF CADASTRADO':'JOGADORES CADASTRADOS';
      registration.style.display='none';historyBtn.style.display='none';history.classList.remove('hidden');history.style.display='block';
      setTimeout(()=>{if(typeof render==='function')render()},0);
    }
  }

  function setup(){if(page!=='setup.html')return;const numericIds=['buyin','buyinChips','earlyBonusValue','earlyBonusChips','rebuyValue','rebuyChips','doubleRebuyValue','doubleRebuyChips','reentryValue','reentryChips','addonValue','addonChips','specialAddonValue','specialAddonChips','addonBonusValue','addonBonusChips','bountyValue','fee'];const headerIds=['clubName','tournamentName','language','tournamentFormat','gameType','seatsPerTable','bountyRecurring','bountyDoubleSecond'];const fields=[...headerIds,...numericIds].map($).filter(Boolean);numericIds.forEach(id=>{const el=$(id);if(!el)return;el.onclick=null;el.onfocus=null;el.readOnly=false;el.inputMode='decimal';el.value=(+state[id]||0)?String(state[id]):''});headerIds.forEach(id=>{const el=$(id);if(!el)return;if(id==='clubName')el.value=state.clubName||'';else if(id==='tournamentName')el.value=state.tournamentName||'';else if(id==='language')el.value=state.language||'';else if(id==='tournamentFormat')el.value=state.tournamentFormat||'';else if(id==='gameType')el.value=state.gameType||'';else if(id==='seatsPerTable')el.value=state.seatsPerTable||'';else if(id==='bountyRecurring')el.checked=!!state.bountyRecurring;else if(id==='bountyDoubleSecond')el.checked=!!state.bountyDoubleSecond});const anchor=$('fee')?.closest('.valueRow')||$('fee');const confirm=addConfirm(anchor,'confirmTournamentData');if(!confirm)return;const saveDraft=()=>{state.clubName=$('clubName')?.value.trim()||'';state.tournamentName=$('tournamentName')?.value.trim()||'';state.language=$('language')?.value||'';state.tournamentFormat=$('tournamentFormat')?.value||'';state.gameType=$('gameType')?.value||'';state.seatsPerTable=+$('seatsPerTable')?.value||'';numericIds.forEach(id=>state[id]=Math.max(0,+($(id)?.value||0)));state.bountyRecurring=!!$('bountyRecurring')?.checked;state.bountyOnReentry=state.bountyRecurring;state.bountyDoubleSecond=!!$('bountyDoubleSecond')?.checked;saveState();if(typeof renderSummary==='function')renderSummary();lock(fields,true);confirm.textContent='CONFIRMADO';confirm.disabled=true};fields.forEach(el=>{const evt=el.type==='checkbox'||el.tagName==='SELECT'?'change':'input';el.addEventListener(evt,()=>{lock(fields,false);confirm.disabled=false;confirm.textContent='CONFIRMAR'})});confirm.onclick=saveDraft}
  function finance(){if(page!=='finance-settings.html')return;const main=$('save'),player=$('savePlayerRule');if(main)main.textContent='CONFIRMAR';if(player)player.textContent='CONFIRMAR';const mainFields=['closingCurrency','centralBank','rateDate','ratePYG','rateUSD','rateARS','rateEUR','buyinPct','rebuyPct','reentryPct','addonPct','expiryPct'].map($).filter(Boolean);main?.addEventListener('click',()=>setTimeout(()=>lock(mainFields,true),0));mainFields.forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>lock(mainFields,false)))}
  function communications(){if(page!=='communications.html')return;const enhance=()=>document.querySelectorAll('#players .player').forEach(card=>{const phone=card.querySelector('[data-phone]');if(!phone||card.querySelector('[data-confirm-phone]'))return;phone.onchange=null;const b=document.createElement('button');b.type='button';b.className='primary';b.dataset.confirmPhone=phone.dataset.phone;b.textContent='CONFIRMAR';b.style.marginTop='8px';phone.parentElement.appendChild(b);b.onclick=()=>{const p=(state.players||[]).find(x=>String(x.id)===String(phone.dataset.phone));if(!p)return;p.phone=phone.value.trim();saveState();phone.readOnly=true;b.textContent='CONFIRMADO';b.disabled=true};phone.addEventListener('input',()=>{phone.readOnly=false;b.disabled=false;b.textContent='CONFIRMAR'})});enhance();new MutationObserver(enhance).observe(document.getElementById('players')||document.body,{childList:true,subtree:true})}
  function simpleFilter(){if(page==='ranking-general.html'){const fields=[$('scope'),$('league'),$('period')].filter(Boolean),b=addConfirm($('period'),'confirmRankingFilter');if(!b)return;b.onclick=()=>{if(typeof render==='function')render();lock(fields,true);b.textContent='CONFIRMADO';b.disabled=true};fields.forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{lock(fields,false);b.textContent='CONFIRMAR';b.disabled=false}))}if(page==='recognition.html'){const input=$('search'),b=addConfirm(input,'confirmRecognitionSearch');if(!b)return;b.onclick=()=>{if(typeof render==='function')render();input.readOnly=true;b.textContent='CONFIRMADO';b.disabled=true};input?.addEventListener('input',()=>{input.readOnly=false;b.textContent='CONFIRMAR';b.disabled=false})}if(page==='tournament-players.html'){const b=$('selectPlayer');if(b)b.textContent='CONFIRMAR'}}
  function structureImport(){if(page!=='structure-import.html')return;const b=$('saveBtn');if(!b)return;b.textContent='CONFIRMAR';b.addEventListener('click',()=>setTimeout(()=>{const fields=[$('structureName'),...document.querySelectorAll('#levels input[data-k]')];lock(fields,true);b.textContent='CONFIRMADO';b.disabled=true},0));document.getElementById('resultBox')?.addEventListener('input',()=>{b.disabled=false;b.textContent='CONFIRMAR';lock([$('structureName'),...document.querySelectorAll('#levels input[data-k]')],false)})}
  const boot=()=>{loadUiStandard();loadInlineLists();autoFormatIdentityAndContacts();directoryHub();setup();finance();communications();simpleFilter();structureImport()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();