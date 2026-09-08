(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='staff.html')return;
  const ROLES=[['DEALER','DEALER'],['FLOOR','FLOOR'],['TD','TD'],['GESTOR','GESTOR']];

  function ensureNative(){
    const select=document.getElementById('role');
    if(!select)return null;
    select.setAttribute('aria-label','FUNÇÃO');
    const current=select.value||'DEALER';
    select.innerHTML='';
    ROLES.forEach(([value,label])=>{
      const option=document.createElement('option');
      option.value=value;
      option.textContent=label;
      select.appendChild(option);
    });
    select.value=ROLES.some(([v])=>v===current)?current:'DEALER';
    return select;
  }

  function build(){
    const select=ensureNative();
    if(!select)return;

    const generated=select.__stackupListWrap||select.nextElementSibling?.classList?.contains('stackup-select')&&select.nextElementSibling;
    if(generated)generated.style.display='none';

    let wrap=document.getElementById('staffRoleSelector');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='staffRoleSelector';
      wrap.style.cssText='width:100%;min-width:0;';
      wrap.innerHTML='<button type="button" id="staffRoleTrigger" style="width:100%;min-height:44px;text-align:left">FUNÇÃO</button><div id="staffRoleList" style="display:none;margin-top:4px"></div>';
      (generated||select).insertAdjacentElement('afterend',wrap);
    }

    const trigger=document.getElementById('staffRoleTrigger');
    const list=document.getElementById('staffRoleList');
    const selected=select.options[select.selectedIndex];
    trigger.textContent=selected?.textContent||'FUNÇÃO';

    list.innerHTML='';
    ROLES.forEach(([value,label])=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent=label;
      btn.style.cssText='display:block;width:100%;min-height:40px;margin:0;padding:9px 4px;border:0;border-bottom:1px solid #27342D;border-radius:0;background:transparent;color:#AEB8B1;text-align:left';
      if(select.value===value)btn.style.color='#8DFC3B';
      btn.onclick=()=>{
        select.value=value;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        trigger.textContent=label;
        list.style.display='none';
        build();
      };
      list.appendChild(btn);
    });

    if(!trigger.dataset.bound){
      trigger.dataset.bound='1';
      trigger.onclick=()=>{
        const opening=list.style.display==='none';
        list.style.display=opening?'block':'none';
      };
    }
  }

  function boot(){
    build();
    const root=document.body||document.documentElement;
    if(root)new MutationObserver(()=>build()).observe(root,{childList:true,subtree:true});
    setInterval(build,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();