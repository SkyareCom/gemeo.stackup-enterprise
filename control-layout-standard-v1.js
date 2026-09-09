(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
function installStyle(){
  if(document.getElementById('controlLayoutStandardV1'))return;
  const s=document.createElement('style');
  s.id='controlLayoutStandardV1';
  s.textContent=`
  /* Todos os botões da Gestão ocupam a linha inteira. Única exceção: comandos do temporizador. */
  .actionGrid,.utilityRow,.queryGrid,.teamGrid,.payGrid{grid-template-columns:1fr!important}
  .actionGrid>a,.utilityRow>a,.queryGrid>a,.teamGrid>a,.payGrid>a{width:100%!important;display:block!important}
  .actionGrid button,.utilityRow button,.queryGrid button,.teamGrid button,.payGrid button{width:100%!important}
  .timeGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  .timeGrid button{width:100%!important}
  `;
  document.head.appendChild(s);
}
function removeStaff(){
  document.querySelectorAll('.teamGrid a,.teamGrid button').forEach(el=>{
    if(/^STAFF$/i.test((el.textContent||'').trim())){
      const a=el.closest('a');
      (a||el).remove();
    }
  });
}
function removeQtd(){
  document.querySelectorAll('.summaryTx .summaryMeta').forEach(meta=>{
    const value=meta.querySelector('b');
    if(!value)return;
    const id=value.id;
    const text=value.textContent;
    meta.innerHTML='';
    const b=document.createElement('b');
    if(id)b.id=id;
    b.textContent=text;
    meta.appendChild(b);
  });
}
function apply(){installStyle();removeStaff();removeQtd()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
setTimeout(apply,250);
setTimeout(apply,1000);
})();