(()=>{
'use strict';
const api=window.StackupScreenMessages;if(!api)return;
const REGISTRATION_IDS=new Set(['lastRebuy','lastEntry','lastRebuyEntry']);
const groups=[
{id:'welcome',title:'BOAS VINDAS',ids:['welcome']},
{id:'levelStart',title:'INÍCIO DE NÍVEIS',ids:['levelAnte','levelNoAnte']},
{id:'levelEnd',title:'TÉRMINO DE NÍVEIS',ids:['level3','level1']},
{id:'breakStart',title:'INÍCIO DE INTERVALOS',ids:['break','meal','addon']},
{id:'breakEnd',title:'TÉRMINO DE INTERVALOS',ids:['resume']},
{id:'extrasAuto',title:'EXTRAS AUTOMÁTICAS',ids:['lastRebuy','lastEntry','lastRebuyEntry','bubble','h4h','itm','ftBubble','ft','alternate']},
{id:'extrasManual',title:'EXTRAS NÃO AUTOMÁTICAS',ids:['deal']}
];
function createManager(hostId,kind){
 const host=document.getElementById(hostId);if(!host)return null;
 const state=Object.fromEntries(groups.map(g=>[g.id,{open:false,showActive:false,modes:Object.fromEntries(g.ids.map(id=>[id,REGISTRATION_IDS.has(id)?'noalert':'alert']))}]));
 const cfg=()=>api.load();
 const lang=()=>cfg().voiceLang||api.officialLang();
 function eventName(){try{return window.state?.tournamentName||JSON.parse(localStorage.getItem('poker-club-state-v4')||'{}').tournamentName||'EVENTO'}catch(_){return'EVENTO'}}
 function textFor(id){if(id==='welcome'&&lang()==='pt')return `Bem vindos jogadores ao ${eventName()}. Excelente jogo a todos !!!`;return api.messageText(id,lang())}
 const labelFor=id=>api.PT.find(r=>r[0]===id)?.[1]||id;
 const rowsFor=g=>g.ids.map(id=>api.PT.find(r=>r[0]===id)).filter(Boolean);
 const forcedNoAlert=id=>kind==='spoken'&&REGISTRATION_IDS.has(id);
 function chooseGroup(id){const next=!state[id].open;groups.forEach(g=>{state[g.id].open=false;state[g.id].showActive=false});state[id].open=next;render()}
 function setMode(g,id,mode){if(forcedNoAlert(id))state[g].modes[id]='noalert';else state[g].modes[id]=mode;render()}
 function test(g,id){const c=cfg(),l=lang(),mode=state[g].modes[id]||'alert';if(kind==='spoken'){const opt={lang:l,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100};if(mode==='noalert'||forcedNoAlert(id))api.speak(textFor(id),opt);else api.playAlertThenSpeak(textFor(id),opt)}else api.setAnnouncement(textFor(id))}
 function confirm(g,id){const mode=forcedNoAlert(id)?'noalert':(state[g].modes[id]||'alert');api.toggle(kind,id,true);if(kind==='spoken'&&api.setSpokenNoAlert)api.setSpokenNoAlert(id,mode==='noalert');state[g].showActive=true;render()}
 function deactivate(id){api.toggle(kind,id,false);render()}
 function messageControls(g,id){if(kind!=='spoken')return `<div class="msgPerActions textActions"><button type="button" data-action="test" data-group="${g}" data-id="${id}">TESTAR MENSAGEM</button><button type="button" data-action="confirm" data-group="${g}" data-id="${id}">CONFIRMAR ATIVAÇÃO</button></div>`;
 const forced=forcedNoAlert(id),mode=state[g].modes[id]||'alert';
 return `<div class="msgPerActions"><button type="button" data-action="modeAlert" data-group="${g}" data-id="${id}" class="${mode==='alert'&&!forced?'active':''}" ${forced?'disabled':''}>ATIVAR COM ALERTA</button><button type="button" data-action="modeNoAlert" data-group="${g}" data-id="${id}" class="${mode==='noalert'||forced?'active':''}">ATIVAR SEM ALERTA</button><button type="button" data-action="test" data-group="${g}" data-id="${id}">TESTAR MENSAGEM</button><button type="button" data-action="confirm" data-group="${g}" data-id="${id}">CONFIRMAR ATIVAÇÃO</button></div>`}
 function messageBlock(r,g,c){const id=r[0],active=!!c[kind]?.[id];return `<div class="msgItem"><div class="msgText"><b>${labelFor(id)}</b><small>${textFor(id)}</small>${forcedNoAlert(id)?'<em>SEMPRE SEM ALERTA</em>':''}${active?'<em>ATIVA</em>':''}</div>${messageControls(g.id,id)}</div>`}
 function activeList(g,c){const rows=rowsFor(g).filter(r=>!!c[kind]?.[r[0]]);if(!state[g.id].showActive)return '';
 return `<div class="activeList">${rows.length?rows.map(r=>`<div class="activeRow"><div class="msgText"><b>${labelFor(r[0])}</b><small>${textFor(r[0])}</small></div><button type="button" data-action="deactivate" data-id="${r[0]}">DESATIVAR</button></div>`).join(''):'<div class="msgEmpty">NENHUMA MENSAGEM ATIVA NESTE BLOCO.</div>'}</div>`}
 function block(g){const s=state[g.id],c=cfg(),rows=rowsFor(g),activeCount=rows.filter(r=>!!c[kind]?.[r[0]]).length;if(!s.open)return `<button type="button" class="msgCategoryButton" data-category="${g.id}">${g.title}${activeCount?` • ${activeCount}`:''}</button>`;
 return `<section class="msgGroup"><button type="button" class="msgCategoryButton active" data-category="${g.id}">${g.title}</button><div class="msgCategoryBody"><div class="msgList">${rows.map(r=>messageBlock(r,g,c)).join('')}</div><button type="button" class="activeMessagesButton" data-action="toggleActive" data-group="${g.id}">MENSAGENS ATIVAS${activeCount?` • ${activeCount}`:''}</button>${activeList(g,c)}</div></section>`}
 function bind(){
  host.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>chooseGroup(b.dataset.category));
  host.querySelectorAll('[data-action]').forEach(b=>b.onclick=e=>{e.stopPropagation();const a=b.dataset.action,g=b.dataset.group,id=b.dataset.id;if(a==='modeAlert')setMode(g,id,'alert');else if(a==='modeNoAlert')setMode(g,id,'noalert');else if(a==='test')test(g,id);else if(a==='confirm')confirm(g,id);else if(a==='toggleActive'){state[g].showActive=!state[g].showActive;render()}else if(a==='deactivate')deactivate(id)})
 }
 function render(){host.innerHTML=groups.map(block).join('');bind()}
 render();return{render};
}
const style=document.createElement('style');style.textContent=`#spokenMessages,#writtenMessages{display:grid;gap:8px}.msgGroup{border:0!important;background:transparent!important;padding:0!important}.msgCategoryButton{width:100%!important;text-align:left!important;padding:12px!important}.msgCategoryButton.active{background:#0B100D!important;color:#fff!important}.msgCategoryBody{padding:10px 0 14px}.msgList{display:grid;gap:14px}.msgItem{padding:10px 0 14px;border:0!important;border-bottom:1px solid #18201B!important}.msgItem:last-child{border-bottom:0!important}.msgText{display:grid;gap:4px}.msgText b{color:#fff!important}.msgText small{color:#AEB8B1!important;line-height:1.35!important;font-weight:300!important}.msgText em{font-style:normal;color:#8DFC3B!important;font-weight:400!important}.msgPerActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.msgPerActions button.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}.activeMessagesButton{width:100%!important;margin-top:12px!important}.activeList{display:grid;gap:8px;margin-top:10px}.activeRow{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #18201B}.activeRow:last-child{border-bottom:0}.msgEmpty{color:#AEB8B1!important;padding:8px 2px}@media(max-width:700px){.msgPerActions{grid-template-columns:1fr}.activeRow{grid-template-columns:1fr}}`;document.head.appendChild(style);
const managers=[createManager('spokenMessages','spoken'),createManager('writtenMessages','written')].filter(Boolean);
window.addEventListener('stackup-screen-message-config',()=>managers.forEach(m=>m.render()));
})();