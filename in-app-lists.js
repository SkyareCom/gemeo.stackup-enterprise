(function(){
  if(typeof document==='undefined'||window.__stackupInAppLists)return;
  window.__stackupInAppLists=true;

  const STYLE_ID='stackup-in-app-lists-style';
  const addStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .stackup-native-select{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
      .stackup-select{display:block!important;width:100%!important;min-width:0!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .stackup-select-trigger{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;width:100%!important;min-width:0!important;min-height:44px!important;padding:10px 12px!important;box-sizing:border-box!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#FFFFFF!important;font:600 12px 'Cantarell',Arial,sans-serif!important;text-transform:uppercase!important;text-align:left!important;box-shadow:none!important}
      .stackup-select-trigger::after{content:'ABRIR';flex:0 0 auto;color:#8DFC3B!important;font-size:10px!important;letter-spacing:.08em!important}
      .stackup-select.open>.stackup-select-trigger{border-color:#8DFC3B!important;color:#FFFFFF!important}
      .stackup-select.open>.stackup-select-trigger::after{content:'FECHAR'}
      .stackup-select-list{display:none!important;position:relative!important;inset:auto!important;z-index:auto!important;width:100%!important;max-height:320px!important;overflow:auto!important;margin:8px 0 0!important;padding:6px!important;box-sizing:border-box!important;border:1px solid #27342D!important;border-radius:9px!important;background:#060907!important;box-shadow:none!important}
      .stackup-select.open>.stackup-select-list{display:grid!important;gap:6px!important}
      .stackup-select-option{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;min-height:42px!important;padding:9px 10px!important;box-sizing:border-box!important;border:1px solid #27342D!important;border-radius:8px!important;background:linear-gradient(#0B100D,#060907)!important;color:#AEB8B1!important;font:600 12px 'Cantarell',Arial,sans-serif!important;text-transform:uppercase!important;text-align:left!important;box-shadow:none!important}
      .stackup-select-option:hover,.stackup-select-option:focus-visible,.stackup-select-option.selected{border-color:#8DFC3B!important;color:#8DFC3B!important;outline:none!important}
      .stackup-select-option.selected{background:#0B140D!important}
      .stackup-select-option:disabled{opacity:.45!important;cursor:not-allowed!important}
      .stackup-select-empty{padding:10px 12px!important;color:#AEB8B1!important;font-size:12px!important}
    `;
    document.head.appendChild(style);
  };

  const textOf=o=>String(o?.textContent||'').trim()||'SELECIONAR';
  const syncOne=select=>{
    const wrap=select.__stackupListWrap;
    if(!wrap)return;
    const trigger=wrap.querySelector('.stackup-select-trigger');
    const selected=select.options?.[select.selectedIndex]||null;
    if(trigger)trigger.textContent=selected?textOf(selected):(select.getAttribute('aria-label')||'SELECIONAR');
    wrap.querySelectorAll('.stackup-select-option').forEach((btn,i)=>{
      const option=select.options?.[i];
      btn.classList.toggle('selected',!!option&&option.selected);
      btn.disabled=!!option?.disabled;
    });
    wrap.style.display=select.disabled?'none':'';
  };

  const buildOptions=select=>{
    const wrap=select.__stackupListWrap;
    if(!wrap)return;
    const list=wrap.querySelector('.stackup-select-list');
    list.innerHTML='';
    if(!select.options?.length){list.innerHTML='<div class="stackup-select-empty">NENHUMA OPÇÃO DISPONÍVEL.</div>';syncOne(select);return}
    [...select.options].forEach((option,index)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='stackup-select-option';
      btn.textContent=textOf(option);
      btn.disabled=!!option.disabled;
      btn.addEventListener('click',()=>{
        if(option.disabled)return;
        if(select.multiple){option.selected=!option.selected}else select.selectedIndex=index;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        syncOne(select);
        if(!select.multiple)wrap.classList.remove('open');
      });
      list.appendChild(btn);
    });
    syncOne(select);
  };

  const enhance=select=>{
    if(!select||select.dataset.stackupInlineList==='1'||select.closest('.stackup-select'))return;
    if(select.size>1)return;
    select.dataset.stackupInlineList='1';
    select.classList.add('stackup-native-select');
    const wrap=document.createElement('div');
    wrap.className='stackup-select';
    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='stackup-select-trigger';
    trigger.setAttribute('aria-expanded','false');
    const list=document.createElement('div');
    list.className='stackup-select-list';
    wrap.append(trigger,list);
    select.insertAdjacentElement('afterend',wrap);
    select.__stackupListWrap=wrap;
    trigger.addEventListener('click',()=>{
      const opening=!wrap.classList.contains('open');
      document.querySelectorAll('.stackup-select.open').forEach(x=>{if(x!==wrap){x.classList.remove('open');x.querySelector('.stackup-select-trigger')?.setAttribute('aria-expanded','false')}});
      buildOptions(select);
      wrap.classList.toggle('open',opening);
      trigger.setAttribute('aria-expanded',opening?'true':'false');
    });
    select.addEventListener('change',()=>syncOne(select));
    new MutationObserver(()=>buildOptions(select)).observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected','label','value']});
    buildOptions(select);
  };

  const apply=root=>{
    if(root?.matches?.('select'))enhance(root);
    root?.querySelectorAll?.('select').forEach(enhance);
  };

  const boot=()=>{
    addStyle();
    apply(document);
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)}))).observe(document.documentElement,{childList:true,subtree:true});
    setInterval(()=>document.querySelectorAll('select[data-stackup-inline-list="1"]').forEach(syncOne),700);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();