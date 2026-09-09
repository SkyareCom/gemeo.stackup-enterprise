(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Math.max(0,Number(String(v??'').replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,''))||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(num(v));
const codeFor=p=>String(num(p?.table)).padStart(2,'0')+String(num(p?.seat)).padStart(2,'0');
const cpfOf=p=>String(p?.cpf||p?.document||p?.identity?.cpf||'');
const activeTx=()=>Array.isArray(state.transactions)?state.transactions.filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void'):[];
const seated=()=>Array.isArray(state.players)?state.players.filter(p=>p.status==='active'&&p.seatedAt):[];
const alternates=()=>Array.isArray(state.players)?state.players.filter(p=>['alternate','waiting','alternate_waiting'].includes(String(p.status||'').toLowerCase())):[];
const groups=()=>{const g={};seated().forEach(p=>{const t=String(p.table||'');if(!t)return;(g[t]??=[]).push(p)});return g};
const ensureArrays=()=>{for(const k of ['players','tables','transactions','seatCheckins','auditLog','balancePlan'])if(!Array.isArray(state[k]))state[k]=[]};
const actionDefs={
  CHECKIN:{label:'CHECK IN',type:'CHECKIN',item:'CHECKIN',financial:false},
  ELIMINATION:{label:'ELIMINAÇÕES',type:'ELIMINATION',item:'ELIMINATION',financial:false},
  BOUNTY:{label:'BOUNTIES',type:'BOUNTY',item:'BOUNTY',value:()=>num(state.bountyValue),financial:true},
  REBUY_I:{label:'REBUY I',type:'REBUY',item:'REBUY_I',value:()=>num(state.rebuyValue),financial:true},
  REBUY_II:{label:'REBUY II',type:'DOUBLE_REBUY',item:'REBUY_II',value:()=>num(state.doubleRebuyValue),financial:true},
  REENTRY:{label:'REENTRADA',type:'REENTRY',item:'REENTRY',value:()=>num(state.reentryValue||state.buyin),financial:true},
  ADDON_I:{label:'ADD ON I',type:'ADDON',item:'ADDON_I',value:()=>num(state.addonValue),financial:true},
  ADDON_II:{label:'ADD ON II',type:'ADDON',item:'ADDON_II',value:()=>num(state.specialAddonValue),financial:true},
  ADDON_BONUS:{label:'ADD ON BONUS',type:'BONUS',item:'ADDON_BONUS',value:()=>num(state.addonBonusValue),financial:true},
  CHECKOUT:{label:'CHECK OUT',type:'CHECKOUT',item:'CHECKOUT',financial:false}
};
let currentAction='',selectedPlayerId='',selectedPay='CASH';
function css(){if($('controlHubStyle'))return;const s=document.createElement('style');s.id='controlHubStyle';s.textContent=`
#controlOperationalHub{margin-top:20px}.hubGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hubGrid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.hubBtn,.hubInfo{min-height:44px!important;padding:10px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#fff!important;box-sizing:border-box!important}.hubBtn{border-color:#8DFC3B!important;color:#8DFC3B!important}.hubBtn.active{background:#8DFC3B!important;color:#020302!important}.hubLabel{color:#AEB8B1;font-size:11px}.hubValue{font-size:14px;margin-top:4px}.hubList{display:grid;gap:8px}.hubRow{padding:10px;border:1px solid #27342D;border-radius:9px;background:#060907}.hubMeta{color:#AEB8B1;margin-top:4px;line-height:1.4}.hubSearch{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:8px}.hubSearch input,.hubPanel input{width:100%;min-height:44px;padding:10px;border:1px solid #27342D;border-radius:9px;background:#060907;color:#fff;box-sizing:border-box}.hubResults{display:grid;gap:6px;margin-top:8px}.hubResult{text-align:left!important;width:100%!important;min-height:44px!important}.hubPanel{margin-top:10px;padding:12px;border:1px solid #27342D;border-radius:10px;background:#040604}.hubPanel.hidden{display:none!important}.hubPay{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.hubStatus{margin-top:8px;color:#8DFC3B}.hubWarn{color:#ffb86c}.hubSuccess{color:#8DFC3B}.hubInline{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hubToggle.on{background:#8DFC3B!important;color:#020302!important}.hubToggle.off{border-color:#6d7370!important;color:#AEB8B1!important}.hubTransactionGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:700px){.hubGrid,.hubGrid4,.hubSearch,.hubPay,.hubInline,.hubTransactionGrid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function install(){css();if($('controlOperationalHub'))return;const summary=[...document.querySelectorAll('.section')].find(x=>x.textContent.trim()==='RESUMO OPERACIONAL');if(!summary)return;const summaryGrid=summary.nextElementSibling;const hub=document.createElement('section');hub.id='controlOperationalHub';hub.innerHTML=`
<div class="section">OPERAÇÃO PRINCIPAL</div>
<div class="hubGrid4">
<button id="hubRegistrations" class="hubBtn" type="button">INSCRIÇÕES<div id="hubRegistrationsCount" class="hubMeta"></div></button>
<button id="hubEarlyBonus" class="hubBtn hubToggle" type="button">EARLY BONUS<div id="hubEarlyBonusState" class="hubMeta"></div></button>
<button class="hubBtn hubAction" data-action="CHECKIN" type="button">CHECK IN<div id="hubCheckinCount" class="hubMeta"></div></button>
<div class="hubInfo"><div class="hubLabel">MESAS ABERTAS</div><div id="hubOpenTables" class="hubValue">0</div></div>
<div class="hubInfo"><div class="hubLabel">MESAS COMPLETAS</div><div id="hubFullTables" class="hubValue">0</div></div>
<div class="hubInfo"><div class="hubLabel">ALTERNATE</div><div id="hubAlternateCount" class="hubValue">0</div></div>
<div class="hubInfo"><div class="hubLabel">BALANCING</div><div id="hubBalancingCount" class="hubValue">0</div></div>
</div>
<div class="section">LISTA DE MESAS</div><div id="hubTables" class="hubList"></div>
<div class="section">LISTA DE ALTERNATES</div><div id="hubAlternates" class="hubList"></div>
<div class="section">BALANCING</div><div id="hubBalancingWarning" class="hubWarn"></div><div id="hubBalancing" class="hubList"></div>
<div class="section">MOVIMENTAÇÕES / TRANSAÇÕES</div>
<div class="hubTransactionGrid">
<button class="hubBtn hubAction" data-action="ELIMINATION" type="button">ELIMINAÇÕES</button>
<button class="hubBtn hubAction" data-action="BOUNTY" type="button">BOUNTIES</button>
<button class="hubBtn hubAction" data-action="REBUY_I" type="button">REBUY I</button>
<button class="hubBtn hubAction" data-action="REBUY_II" type="button">REBUY II</button>
<button class="hubBtn hubAction" data-action="REENTRY" type="button">REENTRADA</button>
<button class="hubBtn hubAction" data-action="ADDON_I" type="button">ADD ON I</button>
<button class="hubBtn hubAction" data-action="ADDON_II" type="button">ADD ON II</button>
<button id="hubAddonBonusToggle" class="hubBtn hubToggle" type="button">ADD ON BONUS<div id="hubAddonBonusState" class="hubMeta"></div></button>
<button class="hubBtn hubAction" data-action="CHECKOUT" type="button">CHECK OUT</button>
</div>
<div id="hubActionPanel" class="hubPanel hidden">
<div id="hubActionTitle" class="section" style="margin-top:0"></div>
<div class="hubSearch"><input id="hubSearchName" placeholder="NOME"><input id="hubSearchCpf" placeholder="CPF"><input id="hubSearchTable" inputmode="numeric" placeholder="MESA"><input id="hubSearchSeat" inputmode="numeric" placeholder="POSIÇÃO"><input id="hubSearchCode" inputmode="numeric" placeholder="CÓDIGO 1810 / 0508"></div>
<div id="hubSearchResults" class="hubResults"></div>
<div class="section">JOGADOR SELECIONADO</div><div id="hubSelectedPlayer" class="hubInfo">NENHUM JOGADOR SELECIONADO.</div>
<div class="hubInline" style="margin-top:8px"><input id="hubAssignTable" inputmode="numeric" placeholder="MESA"><input id="hubAssignSeat" inputmode="numeric" placeholder="POSIÇÃO"></div>
<div class="section">QUANTIDADE</div><input id="hubQty" type="number" min="1" step="1" value="1">
<div class="section">VALOR TOTAL + TAXAS</div><div id="hubTotal" class="hubInfo">R$ 0,00</div>
<div class="section">VALOR PAGO</div><input id="hubPaid" inputmode="decimal" placeholder="0,00">
<div class="section">MEIOS DE PAGAMENTO</div><div class="hubPay"><button class="hubBtn hubPayment" data-pay="CASH" type="button">DINHEIRO</button><button class="hubBtn hubPayment" data-pay="PIX" type="button">PIX</button><button class="hubBtn hubPayment" data-pay="DEBIT" type="button">DÉBITO</button><button class="hubBtn hubPayment" data-pay="CREDIT" type="button">CRÉDITO</button><button class="hubBtn hubPayment" data-pay="PLAYER_CREDIT" type="button">PLAYER CREDIT</button></div>
<button id="hubConfirm" class="hubBtn" style="width:100%;margin-top:10px" type="button">CONFIRMAR TRANSAÇÃO</button><div id="hubConfirmStatus" class="hubStatus"></div>
</div>`;
summaryGrid.insertAdjacentElement('afterend',hub);
bind();renderAll();}
function renderTables(){const g=groups(),cap=num(state.seatsPerTable)||9,keys=Object.keys(g).sort((a,b)=>num(a)-num(b));$('hubOpenTables').textContent=keys.length;$('hubFullTables').textContent=keys.filter(k=>g[k].length>=cap).length;$('hubTables').innerHTML=keys.length?keys.map(k=>`<div class="hubRow"><b>MESA ${esc(k)} • ${g[k].length}/${cap}</b>${g[k].slice().sort((a,b)=>num(a.seat)-num(b.seat)).map(p=>`<div class="hubMeta">POSIÇÃO ${esc(p.seat)} • ${esc(p.name||'JOGADOR')} • CÓDIGO ${codeFor(p)}</div>`).join('')}</div>`).join(''):'<div class="hubMeta">NENHUMA MESA ATIVA.</div>'}
function renderAlternates(){const a=alternates();$('hubAlternateCount').textContent=a.length;$('hubAlternates').innerHTML=a.length?a.map((p,i)=>`<div class="hubRow"><b>${i+1}. ${esc(p.name||'JOGADOR')}</b><div class="hubMeta">CPF ${esc(cpfOf(p)||'—')}</div></div>`).join(''):'<div class="hubMeta">NENHUM JOGADOR EM ALTERNATE.</div>'}
function renderBalancing(){let plan=[];try{if(typeof recomputeBalancePlan==='function')plan=recomputeBalancePlan()||[];else plan=state.balancePlan||[]}catch(_){plan=state.balancePlan||[]}$('hubBalancingCount').textContent=plan.length;$('hubBalancingWarning').textContent=plan.length?`ATENÇÃO: ${plan.length} MOVIMENTAÇÃO(ÕES) DE BALANCING NECESSÁRIA(S).`:'SEM BALANCING NECESSÁRIO.';$('hubBalancing').innerHTML=plan.length?plan.map(m=>`<div class="hubRow"><b>${esc(m.playerName||'JOGADOR')}</b><div class="hubMeta">MESA ${esc(m.fromTable)} / POSIÇÃO ${esc(m.fromSeat)} → MESA ${esc(m.toTable)} / POSIÇÃO ${esc(m.toSeat)}${m.reason?' • '+esc(m.reason):''}</div></div>`).join(''):'<div class="hubMeta">NENHUMA MOVIMENTAÇÃO PENDENTE.</div>'}
function renderCounts(){const tx=activeTx();$('hubRegistrationsCount').textContent=`${tx.filter(t=>t.type==='ENTRY').length} INSCRIÇÕES`;$('hubCheckinCount').textContent=`${new Set((state.seatCheckins||[]).filter(x=>x.eventId===state.eventId&&x.status==='SEATED').map(x=>String(x.playerId))).size} CHECK-INS`;const e=state.earlyBonusOperationalEnabled!==false;$('hubEarlyBonusState').textContent=e?'ATIVADO':'DESATIVADO';$('hubEarlyBonus').classList.toggle('on',e);$('hubEarlyBonus').classList.toggle('off',!e);const a=state.addonBonusOperationalEnabled!==false;$('hubAddonBonusState').textContent=a?'ATIVADO':'DESATIVADO';$('hubAddonBonusToggle').classList.toggle('on',a);$('hubAddonBonusToggle').classList.toggle('off',!a)}
function renderAll(){if(!$('controlOperationalHub'))return;ensureArrays();renderCounts();renderTables();renderAlternates();renderBalancing();renderSearch();renderActionFinancial()}
function playersFiltered(){const n=$('hubSearchName')?.value.trim().toLowerCase()||'',cpf=$('hubSearchCpf')?.value.replace(/\D/g,'')||'',table=$('hubSearchTable')?.value.trim()||'',seat=$('hubSearchSeat')?.value.trim()||'',code=$('hubSearchCode')?.value.replace(/\D/g,'')||'';return (state.players||[]).filter(p=>(!n||String(p.name||'').toLowerCase().includes(n))&&(!cpf||cpfOf(p).replace(/\D/g,'').includes(cpf))&&(!table||String(p.table||'')===String(num(table)))&&(!seat||String(p.seat||'')===String(num(seat)))&&(!code||codeFor(p)===code)).slice(0,30)}
function renderSearch(){const root=$('hubSearchResults');if(!root||$('hubActionPanel').classList.contains('hidden'))return;const list=playersFiltered();root.innerHTML=list.length?list.map(p=>`<button class="hubBtn hubResult" type="button" data-player="${esc(p.id)}"><b>${esc(p.name||'JOGADOR')}</b><div class="hubMeta">CPF ${esc(cpfOf(p)||'—')} • MESA ${esc(p.table??'—')} • POSIÇÃO ${esc(p.seat??'—')} • CÓDIGO ${codeFor(p)}</div></button>`).join(''):'<div class="hubMeta">NENHUM JOGADOR ENCONTRADO.</div>';root.querySelectorAll('[data-player]').forEach(b=>b.onclick=()=>selectPlayer(b.dataset.player))}
function selectPlayer(id){selectedPlayerId=String(id);const p=(state.players||[]).find(x=>String(x.id)===selectedPlayerId);$('hubSelectedPlayer').innerHTML=p?`<b>${esc(p.name||'JOGADOR')}</b><div class="hubMeta">CPF ${esc(cpfOf(p)||'—')} • MESA ${esc(p.table??'—')} • POSIÇÃO ${esc(p.seat??'—')} • CÓDIGO ${codeFor(p)}</div>`:'NENHUM JOGADOR SELECIONADO.';$('hubAssignTable').value=p?.table??'';$('hubAssignSeat').value=p?.seat??'';renderActionFinancial()}
function openAction(key){currentAction=key;selectedPlayerId='';const d=actionDefs[key];$('hubActionTitle').textContent=d?.label||key;$('hubActionPanel').classList.remove('hidden');$('hubSelectedPlayer').textContent='NENHUM JOGADOR SELECIONADO.';$('hubConfirmStatus').textContent='';for(const id of ['hubSearchName','hubSearchCpf','hubSearchTable','hubSearchSeat','hubSearchCode','hubAssignTable','hubAssignSeat'])$(id).value='';$('hubQty').value='1';selectedPay='CASH';markPayments();renderSearch();renderActionFinancial();$('hubActionPanel').scrollIntoView({behavior:'smooth',block:'start'})}
function baseValue(){const d=actionDefs[currentAction];return d?.financial?num(d.value?.()):0}
function feeFor(base,method){try{if(window.StackupFinance?.paymentFee){const m=(method==='DEBIT'||method==='CREDIT')?'CARD':method;return num(StackupFinance.paymentFee(base,m))}}catch(_){}return 0}
function totals(){const qty=Math.max(1,Math.floor(num($('hubQty')?.value)||1)),base=baseValue()*qty,fee=feeFor(base,selectedPay),total=base+fee;return{qty,base,fee,total}}
function renderActionFinancial(){if(!$('hubActionPanel')||$('hubActionPanel').classList.contains('hidden'))return;const t=totals();$('hubTotal').textContent=`${money(t.total)} • BASE ${money(t.base)} • TAXAS ${money(t.fee)}`;if(!$('hubPaid').value)$('hubPaid').placeholder=t.total.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function markPayments(){document.querySelectorAll('.hubPayment').forEach(b=>b.classList.toggle('active',b.dataset.pay===selectedPay))}
function seatCheckin(p,table,seat){p.table=table;p.seat=seat;p.status='active';p.seatedAt=Date.now();let row=(state.seatCheckins||[]).find(x=>x.eventId===state.eventId&&String(x.playerId)===String(p.id)&&x.status==='SEATED');if(!row){row={id:'seat-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),eventId:state.eventId,playerId:p.id,playerName:p.name,table,seat,status:'SEATED',createdAt:Date.now()};state.seatCheckins.unshift(row)}else{row.table=table;row.seat=seat;row.updatedAt=Date.now()}}
function checkout(p){p.status='checked_out';p.seatedAt=null;const row=(state.seatCheckins||[]).find(x=>x.eventId===state.eventId&&String(x.playerId)===String(p.id)&&x.status==='SEATED');if(row){row.status='CHECKED_OUT';row.checkedOutAt=Date.now()}}
function eliminate(p){p.status='eliminated';p.seatedAt=null;p.eliminatedAt=Date.now();const active=(state.players||[]).filter(x=>x.status==='active').length;p.finishPosition=p.finishPosition||active+1;const row=(state.seatCheckins||[]).find(x=>x.eventId===state.eventId&&String(x.playerId)===String(p.id)&&x.status==='SEATED');if(row){row.status='ELIMINATED';row.eliminatedAt=Date.now()}}
function confirmAction(){const d=actionDefs[currentAction],p=(state.players||[]).find(x=>String(x.id)===selectedPlayerId);if(!d)return;if(!p){$('hubConfirmStatus').textContent='SELECIONE UM JOGADOR INSCRITO.';return}const table=Math.floor(num($('hubAssignTable').value||p.table)),seat=Math.floor(num($('hubAssignSeat').value||p.seat));if(currentAction==='CHECKIN'){if(!table||!seat){$('hubConfirmStatus').textContent='INFORME MESA E POSIÇÃO PARA O CHECK IN.';return}seatCheckin(p,table,seat)}else if(currentAction==='CHECKOUT')checkout(p);else if(currentAction==='ELIMINATION')eliminate(p);
const t=totals(),paidRaw=$('hubPaid').value.trim(),paid=paidRaw?num(paidRaw):t.total;
if(d.financial){const method=(selectedPay==='DEBIT'||selectedPay==='CREDIT')?'CARD':selectedPay;const tx={id:'tx-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),eventId:state.eventId,playerId:p.id,playerName:p.name,type:d.type,itemCode:d.item,quantity:t.qty,value:t.base,status:'completed',createdAt:Date.now(),source:'TOURNAMENT_MANAGEMENT',table:p.table||table||'',seat:p.seat||seat||'',seatCode:codeFor({...p,table:p.table||table,seat:p.seat||seat}),payment:{method,channel:selectedPay,currency:'BRL',amount:t.base,processingFeeAmount:t.fee,totalAmount:t.total,paidAmount:paid},financialCategory:d.item};state.transactions.unshift(tx)}
if(typeof syncTournamentCounts==='function')syncTournamentCounts();if(typeof auditEvent==='function')auditEvent('TOURNAMENT_MANAGEMENT_ACTION',{source:'TOURNAMENT_MANAGEMENT',action:currentAction,playerId:p.id,playerName:p.name,quantity:t.qty,total:t.total,paymentMethod:selectedPay});saveState();$('hubConfirm').textContent='TRANSAÇÃO CONFIRMADA';$('hubConfirmStatus').textContent=`${d.label} CONFIRMADO PARA ${p.name}.`;setTimeout(()=>{$('hubConfirm').textContent='CONFIRMAR TRANSAÇÃO'},1800);renderAll();window.onPokerStateChange?.(state)}
function bind(){
$('hubRegistrations').onclick=()=>location.href='player-register.html';$('hubEarlyBonus').onclick=()=>{state.earlyBonusOperationalEnabled=!(state.earlyBonusOperationalEnabled!==false);saveState();renderCounts()};$('hubAddonBonusToggle').onclick=()=>{state.addonBonusOperationalEnabled=!(state.addonBonusOperationalEnabled!==false);saveState();renderCounts();if(state.addonBonusOperationalEnabled)openAction('ADDON_BONUS')};document.querySelectorAll('.hubAction').forEach(b=>b.onclick=()=>openAction(b.dataset.action));for(const id of ['hubSearchName','hubSearchCpf','hubSearchTable','hubSearchSeat','hubSearchCode'])$(id).addEventListener('input',renderSearch);$('hubQty').addEventListener('input',renderActionFinancial);document.querySelectorAll('.hubPayment').forEach(b=>b.onclick=()=>{selectedPay=b.dataset.pay;markPayments();renderActionFinancial()});$('hubConfirm').onclick=confirmAction;}
function boot(){install();window.addEventListener('storage',renderAll);const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);renderAll()};setInterval(()=>{if($('controlOperationalHub')){renderCounts();renderTables();renderAlternates();renderBalancing()}},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();