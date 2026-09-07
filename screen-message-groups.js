(()=>{
'use strict';
const api=window.StackupScreenMessages;
const host=document.getElementById('spokenMessages');
if(!api||!host)return;
const groups=[
 {id:'auto',title:'MENSAGENS AUTOMÁTICAS',mode:'auto'},
 {id:'manual',title:'MENSAGENS NÃO AUTOMÁTICAS',mode:'manual'}
];
const selected={auto:null,manual:null};
const activeSelected={auto:null,manual:null};
const open={auto:{activate:false,active:false,edit:false,deleteArmed:false},manual:{activate:false,active:false,edit:false,deleteArmed:false}};
function cfg(){return api.load()}
function lang(){const c=cfg();return c.voiceLang||api.officialLang()}
function rowsFor(mode){return api.PT.filter(r=>r[3]===mode)}
function textFor(id){return api.messageText(id,lang())}
function labelFor(id){return api.PT.find(r=>r[0]===id)?.[1]||id}
function setOnly(which,group,id){which[group]=which[group]===id?null:id;render()}
function test(group){const id=selected[group]||activeSelected[group];if(!id)return;const c=cfg(),l=lang();api.playAlertThenSpeak(textFor(id),{lang:l,profileId:c.voiceProfile,repeat:c.voiceRepeat,volume:c.voiceVolume/100})}
function activate(group){const id=selected[group];if(!id)return;api.toggle('spoken',id,true);selected[group]=null;open[group].activate=false;open[group].active=true;render()}
function erase(group){const id=activeSelected[group];if(!id||!open[group].deleteArmed)return;api.toggle('spoken',id,false);activeSelected[group]=null;open[group].deleteArmed=false;render()}
function square(id,isSelected,disabled,kind,group){return `<button type="button" class="msgPick ${isSelected?'selected':''}" data-pick="${kind}" data-group="${group}" data-id="${id}" ${disabled?'disabled':''} aria-pressed="${isSelected?'true':'false'}"><span class="msgSquare">${isSelected?'✓':''}</span><span class="msgPickText"><b>${labelFor(id)}</b><small>${textFor(id)}</small></span></button>`}
function block(g){const c=cfg(),rows=rowsFor(g.mode),activeRows=rows.filter(r=>!!c.spoken?.[r[0]]),s=open[g.id];
 const activateList=s.activate?`<div class="msgPanel"><div class="msgList">${rows.map(r=>square(r[0],selected[g.id]===r[0],false,'new',g.id)).join('')}</div><div class="msgPanelActions"><button type="button" data-action="test" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>TESTAR MENSAGEM</button><button type="button" data-action="confirm" data-group="${g.id}" ${!selected[g.id]?'disabled':''}>CONFIRMAR ATIVAÇÃO</button></div></div>`:'';
 const activeList=s.active?`<div class="msgPanel activePanel"><div class="msgActiveHead"><span>${activeRows.length?activeRows.length+' MENSAGEM(NS) ATIVA(S)':'NENHUMA MENSAGEM ATIVA'}</span><button type="button" data-action="edit" data-group="${g.id}">${s.edit?'FINALIZAR EDIÇÃO':'EDITAR'}</button></div>${activeRows.length?`<div class="msgList">${activeRows.map(r=>square(r[0],activeSelected[g.id]===r[0],!s.edit,'active',g.id)).join('')}</div>`:''}${s.edit&&activeRows.length?`<div class="msgPanelActions"><button type="button" class="danger" data-action="delete" data-group="${g.id}" ${!activeSelected[g.id]?'disabled':''}>APAGAR MENSAGEM</button><button type="button" data-action="deleteConfirm" data-group="${g.id}" ${!activeSelected[g.id]||!s.deleteArmed?'disabled':''}>${s.deleteArmed?'CONFIRMAR PARA APAGAR':'CONFIRMAR'}</button></div>`:''}</div>`:'';
 return `<section class="msgGroup"><div class="msgGroupTitle">${g.title}</div><div class="msgGroupButtons"><button type="button" data-action="activateOpen" data-group="${g.id}">ATIVAR MENSAGEM</button><button type="button" data-action="activeOpen" data-group="${g.id}">MENSAGENS ATIVAS${activeRows.length?' • '+activeRows.length:''}</button></div>${activateList}${activeList}</section>`}
function bind(){host.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const group=b.dataset.group;if(b.dataset.pick==='new')setOnly(selected,group,b.dataset.id);else {setOnly(activeSelected,group,b.dataset.id);open[group].deleteArmed=false}});host.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const g=b.dataset.group,a=b.dataset.action;if(a==='activateOpen'){open[g].activate=!open[g].activate;if(open[g].activate)open[g].active=false;selected[g]=null}else if(a==='activeOpen'){open[g].active=!open[g].active;if(open[g].active)open[g].activate=false;activeSelected[g]=null;open[g].edit=false;open[g].deleteArmed=false}else if(a==='test')test(g);else if(a==='confirm')activate(g);else if(a==='edit'){open[g].edit=!open[g].edit;activeSelected[g]=null;open[g].deleteArmed=false}else if(a==='delete'){if(activeSelected[g])open[g].deleteArmed=true}else if(a==='deleteConfirm')erase(g);render()})}
function render(){host.innerHTML=groups.map(block).join('');bind()}
const style=document.createElement('style');style.textContent=`
#spokenMessages{display:grid;gap:14px}.msgGroup{border:1px solid #27342D;border-radius:9px;background:linear-gradient(#0B100D,#060907);padding:10px}.msgGroupTitle{color:#8DFC3B;margin-bottom:8px}.msgGroupButtons,.msgPanelActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.msgPanel{margin-top:10px;padding-top:10px;border-top:1px solid #27342D}.msgList{display:grid;gap:7px}.msgPick{display:grid!important;grid-template-columns:24px 1fr!important;align-items:start!important;gap:9px!important;width:100%!important;text-align:left!important;background:#020302!important;border:1px solid #27342D!important;padding:9px!important}.msgPick.selected{border-color:#8DFC3B!important}.msgPick:disabled{opacity:.7!important}.msgSquare{width:20px;height:20px;border:1px solid #8DFC3B;border-radius:3px;display:grid;place-items:center;color:#8DFC3B;line-height:1}.msgPickText{display:grid;gap:4px}.msgPickText b{color:#fff}.msgPickText small{color:#AEB8B1;line-height:1.35}.msgPanelActions{margin-top:9px}.msgActiveHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;color:#AEB8B1}.msgPanelActions .danger{border-color:#7a2b2b!important}@media(max-width:700px){.msgGroupButtons,.msgPanelActions{grid-template-columns:1fr}.msgActiveHead{align-items:stretch;flex-direction:column}}
`;document.head.appendChild(style);
render();
window.addEventListener('stackup-screen-message-config',render);
})();