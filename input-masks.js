(function(){
  if(typeof document==='undefined'||window.__stackupInputMasks)return;
  window.__stackupInputMasks=true;

  const digits=(value,max)=>String(value??'').replace(/\D/g,'').slice(0,max);
  const formatCpf=value=>{
    const d=digits(value,11);
    if(d.length<=3)return d;
    if(d.length<=6)return `${d.slice(0,3)}.${d.slice(3)}`;
    if(d.length<=9)return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  };
  const formatPhone=value=>{
    const d=digits(value,11);
    if(!d)return '';
    if(d.length<=2)return `(${d}`;
    if(d.length<=7)return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };
  const signature=el=>{
    const names=el.getAttributeNames?.().filter(n=>n.startsWith('data-')).join(' ')||'';
    return [
      el.id,
      el.name,
      el.placeholder,
      el.getAttribute('aria-label'),
      el.getAttribute('autocomplete'),
      names,
      ...Object.keys(el.dataset||{})
    ].filter(Boolean).join(' ').toLowerCase();
  };
  const kindOf=el=>{
    if(!(el instanceof HTMLInputElement))return '';
    const sig=signature(el);
    if(/\bcpf\b/.test(sig))return 'cpf';
    if(el.type==='tel'||/(telefone|fone|phone|celular|whatsapp|whats\b|whats[-_ ]?app)/.test(sig))return 'phone';
    return '';
  };
  const applyValue=(el,kind=kindOf(el))=>{
    if(!kind)return;
    const next=kind==='cpf'?formatCpf(el.value):formatPhone(el.value);
    if(el.value!==next){
      el.value=next;
      try{el.setSelectionRange(next.length,next.length)}catch(_){ }
    }
  };
  const prepare=el=>{
    const kind=kindOf(el);
    if(!kind)return '';
    el.dataset.stackupMask=kind;
    el.inputMode='numeric';
    el.maxLength=kind==='cpf'?14:15;
    if(!el.placeholder||/cpf|telefone|fone|phone|celular|whats/i.test(el.placeholder))el.placeholder=kind==='cpf'?'000.000.000-00':'(00) 00000-0000';
    applyValue(el,kind);
    return kind;
  };
  const scan=root=>{
    if(root instanceof HTMLInputElement)prepare(root);
    root.querySelectorAll?.('input').forEach(prepare);
  };
  const liveFormat=event=>{
    const el=event.target;
    if(!(el instanceof HTMLInputElement))return;
    const kind=el.dataset.stackupMask||prepare(el);
    if(kind)applyValue(el,kind);
  };
  const boot=()=>{
    scan(document);
    document.addEventListener('input',liveFormat,true);
    document.addEventListener('input',liveFormat,false);
    document.addEventListener('change',liveFormat,false);
    document.addEventListener('blur',liveFormat,true);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{
      if(node.nodeType===1)scan(node);
    }))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  window.StackupInputMasks={formatCpf,formatPhone};
})();

(function ensureGlobalLanguage(){
  if(typeof document==='undefined'||window.StackupAppLanguage||document.querySelector('script[data-stackup-language]'))return;
  const script=document.createElement('script');
  script.src='app-language.js?v=2b5ab1e61a65597ba56b6d6b0e91b6b8c3fb9710';
  script.defer=true;
  script.dataset.stackupLanguage='1';
  (document.head||document.documentElement).appendChild(script);
})();