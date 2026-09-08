(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='staff.html')return;
  const ROLES=[['DEALER','DEALER'],['FLOOR','FLOOR'],['TD','TD'],['GESTOR','GESTOR']];
  function ensureNative(){
    const select=document.getElementById('role');
    if(!select)return null;
    select.setAttribute('aria-label','FUNÇÃO');
    const current=select.value||'DEALER';
    const values=[...select.options].map(o=>o.value);
    if(ROLES.some(([v])=>!values.includes(v))||select.options.length!==ROLES.length){
      select.innerHTML='';
      ROLES.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;select.appendChild(o)});
    }
    select.value=ROLES.some(([v])=>v===current)?current:'DEALER';
    return select;
  }
  function repairDrawer(){
    const select=ensureNative();if(!select)return;
    const wrap=select.__stackupListWrap||select.nextElementSibling?.classList?.contains('stackup-select')&&select.nextElementSibling;
    if(!wrap)return;
    const trigger=wrap.querySelector('.stackup-select-trigger');
    const list=wrap.querySelector('.stackup-select-list');
    if(trigger){
      const selected=select.options[select.selectedIndex];
      if(trigger.firstChild)trigger.firstChild.nodeValue=(selected?.textContent||'FUNÇÃO')+' ';
    }
    if(!list)return;
    const rebuild=()=>{
      list.innerHTML='';
      [...select.options].forEach((option,index)=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='stackup-select-option'+(option.selected?' selected':'');
        btn.textContent=option.textContent;
        btn.onclick=()=>{
          select.selectedIndex=index;
          select.dispatchEvent(new Event('input',{bubbles:true}));
          select.dispatchEvent(new Event('change',{bubbles:true}));
          wrap.classList.remove('open');
          trigger?.setAttribute('aria-expanded','false');
          repairDrawer();
        };
        list.appendChild(btn);
      });
    };
    if(list.children.length!==select.options.length)rebuild();
    if(trigger&&!trigger.dataset.staffRoleRepair){
      trigger.dataset.staffRoleRepair='1';
      trigger.addEventListener('click',()=>setTimeout(rebuild,0));
    }
  }
  function boot(){ensureNative();repairDrawer();const root=document.body||document.documentElement;if(!root)return;new MutationObserver(()=>{ensureNative();repairDrawer()}).observe(root,{childList:true,subtree:true});setInterval(repairDrawer,800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();