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
    if(select.options.length!==ROLES.length||ROLES.some(([v])=>!values.includes(v))){
      select.innerHTML='';
      ROLES.forEach(([value,label])=>{
        const option=document.createElement('option');
        option.value=value;
        option.textContent=label;
        select.appendChild(option);
      });
    }
    select.value=ROLES.some(([v])=>v===current)?current:'DEALER';
    return select;
  }

  function removeDuplicate(){
    document.getElementById('staffRoleSelector')?.remove();
  }

  function repairExistingSelector(){
    removeDuplicate();
    const select=ensureNative();
    if(!select)return;
    const wrap=select.__stackupListWrap||(select.nextElementSibling?.classList?.contains('stackup-select')?select.nextElementSibling:null);
    if(!wrap)return;

    wrap.style.display='block';
    const trigger=wrap.querySelector('.stackup-select-trigger');
    const list=wrap.querySelector('.stackup-select-list');
    if(!trigger||!list)return;

    const selected=select.options[select.selectedIndex];
    if(trigger.firstChild)trigger.firstChild.nodeValue=(selected?.textContent||'SELECIONAR FUNÇÃO')+' ';

    const rebuild=()=>{
      list.innerHTML='';
      ROLES.forEach(([value,label],index)=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='stackup-select-option'+(select.value===value?' selected':'');
        btn.textContent=label;
        btn.onclick=e=>{
          e.preventDefault();
          e.stopPropagation();
          select.selectedIndex=index;
          select.value=value;
          select.dispatchEvent(new Event('input',{bubbles:true}));
          select.dispatchEvent(new Event('change',{bubbles:true}));
          if(trigger.firstChild)trigger.firstChild.nodeValue=label+' ';
          wrap.classList.remove('open');
          trigger.setAttribute('aria-expanded','false');
          rebuild();
        };
        list.appendChild(btn);
      });
    };

    rebuild();
    if(!trigger.dataset.staffRoleFixed){
      trigger.dataset.staffRoleFixed='1';
      trigger.addEventListener('click',()=>setTimeout(rebuild,0));
    }
  }

  function boot(){
    ensureNative();
    removeDuplicate();
    repairExistingSelector();
    const root=document.body||document.documentElement;
    if(root)new MutationObserver(()=>{removeDuplicate();repairExistingSelector()}).observe(root,{childList:true,subtree:true});
    setInterval(repairExistingSelector,700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();