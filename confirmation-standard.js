(function(){
  if(typeof document==='undefined'||window.__stackupConfirmationStandard)return;
  window.__stackupConfirmationStandard=true;

  const SUCCESS=/\b(CADASTRAD[OA]S?|REGISTRAD[OA]S?|SALV[OA]S?|CRIAD[OA]S?|ATUALIZAD[OA]S?|CONFIRMAD[OA]S?|CONCLU[IÍ]D[OA]S?|SUCESSO)\b/i;
  const REGISTRATION=/CADASTR|REGISTR|INSCRI|INCLUIR\s+NOV|NOV[OA]\s+(JOGADOR|STAFF|AMBIENTE|MEMBRO|TORNEIO)/i;
  let active=null;

  const style=document.createElement('style');
  style.id='stackup-inline-notice-style';
  style.textContent=`
    [data-stackup-inline-notice]{
      display:block!important;width:100%!important;box-sizing:border-box!important;
      margin:8px 0 0!important;padding:10px 12px!important;border:1px solid #27342D!important;
      border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;
      color:#AEB8B1!important;font-size:12px!important;line-height:1.35!important;
      font-family:'Caacupe One',system-ui,sans-serif!important;letter-spacing:1px!important;text-transform:uppercase!important;
    }
    [data-stackup-inline-notice="error"]{border-color:#8DFC3B!important;color:#FFFFFF!important}
    [data-stackup-inline-notice="info"]{border-color:#27342D!important;color:#AEB8B1!important}
  `;
  (document.head||document.documentElement).appendChild(style);

  const label=b=>String(b?.textContent||b?.value||'').trim().toUpperCase();
  const isConfirm=b=>b&&/^(CONFIRMAR|SALVAR|CADASTRAR)$/.test(label(b));
  const fieldsIn=scope=>[...scope.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(el=>!el.closest('[data-stackup-new-action]'));

  function scopeFor(button){
    let node=button?.parentElement;
    while(node&&node!==document.body){
      if(fieldsIn(node).length)return node;
      if(node.tagName==='MAIN')break;
      node=node.parentElement;
    }
    return document.querySelector('main')||document.body;
  }

  function noticeScope(){return active?.scope||document.querySelector('main')||document.body}
  function showNotice(message,type='error',scope=noticeScope()){
    const text=String(message??'').trim();
    if(!text)return;
    let box=scope.querySelector(':scope > [data-stackup-inline-notice]');
    if(!box){
      box=document.createElement('div');
      box.setAttribute('role','status');
      box.setAttribute('aria-live','polite');
      box.dataset.stackupInlineNotice=type;
      const anchor=active?.button&&active.button.isConnected?active.button:null;
      if(anchor)anchor.insertAdjacentElement('afterend',box);
      else scope.prepend(box);
    }
    box.dataset.stackupInlineNotice=type;
    box.textContent=text;
    box.hidden=false;
    return box;
  }
  function clearNotice(scope=noticeScope()){
    scope?.querySelectorAll?.('[data-stackup-inline-notice]').forEach(el=>{el.hidden=true;el.textContent=''});
  }

  window.StackupNotice={show:showNotice,clear:clearNotice};
  window.alert=function(message){
    const text=String(message??'');
    if(SUCCESS.test(text)){
      if(active)active.successAlert=true;
      return;
    }
    if(active)active.validationAlert=true;
    showNotice(text,'error');
  };
  window.confirm=function(message){
    showNotice(String(message??''),'info');
    return true;
  };
  window.prompt=function(message){
    showNotice(String(message??'AÇÃO REQUER PREENCHIMENTO NA PRÓPRIA TELA.'),'error');
    return null;
  };

  function isRegistration(scope){
    const page=(location.pathname.split('/').pop()||'').toLowerCase();
    const query=new URLSearchParams(location.search).get('view')||'';
    if(/(register|registration|pre-registration)/.test(page)||query==='register')return true;
    const context=[document.title,scope?.textContent||'',scope?.previousElementSibling?.textContent||''].join(' ');
    return REGISTRATION.test(context);
  }

  function remember(fields){
    fields.forEach(el=>{
      if(el.dataset.stackupConfirmRemembered==='1')return;
      el.dataset.stackupConfirmRemembered='1';
      el.dataset.stackupInitialDisabled=el.disabled?'1':'0';
      el.dataset.stackupInitialReadonly=el.readOnly?'1':'0';
    });
  }

  function restoreField(el,clear){
    el.disabled=el.dataset.stackupInitialDisabled==='1';
    el.readOnly=el.dataset.stackupInitialReadonly==='1';
    if(!clear)return;
    if(el.type==='checkbox'||el.type==='radio')el.checked=false;
    else if(el.tagName==='SELECT')el.selectedIndex=0;
    else if(el.type==='file')el.value='';
    else el.value='';
  }

  function newButtonFor(button,scope,fields){
    let next=scope.querySelector('[data-stackup-new-action="1"]');
    if(next)return next;
    next=document.createElement('button');
    next.type='button';
    next.textContent='CADASTRAR NOVO';
    next.dataset.stackupNewAction='1';
    next.style.marginTop='8px';
    next.hidden=true;
    button.insertAdjacentElement('afterend',next);
    next.onclick=()=>{
      clearNotice(scope);
      fields.forEach(el=>restoreField(el,true));
      button.textContent='CONFIRMAR';
      button.disabled=false;
      button.dataset.stackupConfirmed='0';
      next.hidden=true;
      fields.forEach(el=>{
        el.dispatchEvent(new Event(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio'?'change':'input',{bubbles:true}));
      });
      fields.find(el=>!el.disabled&&!el.readOnly)?.focus?.();
    };
    return next;
  }

  function confirmed(button,scope,fields,registration){
    clearNotice(scope);
    remember(fields);
    button.textContent='CONFIRMADO';
    button.disabled=true;
    button.dataset.stackupConfirmed='1';
    if(registration){
      fields.forEach(el=>{if(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio')el.disabled=true;else el.readOnly=true});
      newButtonFor(button,scope,fields).hidden=false;
    }
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('button,input[type="button"],input[type="submit"]');
    if(!isConfirm(button)||button.dataset.stackupConfirmed==='1')return;
    const scope=scopeFor(button),fields=fieldsIn(scope),registration=isRegistration(scope);
    if(!fields.length)return;
    clearNotice(scope);
    const cycle={button,scope,fields,registration,validationAlert:false,successAlert:false};
    active=cycle;
    setTimeout(()=>{
      if(active===cycle)active=null;
      if(cycle.validationAlert||!button.isConnected)return;
      confirmed(button,scope,fields,registration);
    },0);
  },true);

  const resetConfirmedOnEdit=event=>{
    const scope=event.target.closest('form,.card,.panel,.section,main')||document.querySelector('main')||document.body;
    clearNotice(scope);
    const button=[...scope.querySelectorAll('button,input[type="button"],input[type="submit"]')].find(b=>b.dataset.stackupConfirmed==='1');
    if(!button||isRegistration(scope))return;
    button.dataset.stackupConfirmed='0';
    button.textContent='CONFIRMAR';
    button.disabled=false;
  };
  document.addEventListener('input',resetConfirmedOnEdit,true);
  document.addEventListener('change',resetConfirmedOnEdit,true);
})();