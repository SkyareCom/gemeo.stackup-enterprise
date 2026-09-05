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
  const signature=el=>[
    el.id,
    el.name,
    el.placeholder,
    el.getAttribute('aria-label'),
    el.getAttribute('autocomplete'),
    el.dataset?.field,
    el.dataset?.type
  ].filter(Boolean).join(' ').toLowerCase();
  const kindOf=el=>{
    const sig=signature(el);
    if(/\bcpf\b/.test(sig))return 'cpf';
    if(el.type==='tel'||/(telefone|phone|celular|whatsapp|whats\b|whats[-_ ]?app)/.test(sig))return 'phone';
    return '';
  };
  const applyValue=(el,kind)=>{
    const next=kind==='cpf'?formatCpf(el.value):formatPhone(el.value);
    if(el.value!==next)el.value=next;
  };
  const attach=el=>{
    if(!(el instanceof HTMLInputElement)||el.dataset.stackupMaskBound==='1')return;
    const kind=kindOf(el);
    if(!kind)return;
    el.dataset.stackupMaskBound='1';
    el.dataset.stackupMask=kind;
    el.inputMode='numeric';
    el.autocomplete=el.autocomplete||'off';
    el.maxLength=kind==='cpf'?14:15;
    if(!el.placeholder||/cpf|telefone|phone|celular|whats/i.test(el.placeholder)){
      el.placeholder=kind==='cpf'?'000.000.000-00':'(00) 00000-0000';
    }
    applyValue(el,kind);
    el.addEventListener('input',()=>applyValue(el,kind));
    el.addEventListener('change',()=>applyValue(el,kind));
    el.addEventListener('blur',()=>applyValue(el,kind));
  };
  const scan=root=>{
    if(root instanceof HTMLInputElement)attach(root);
    root.querySelectorAll?.('input').forEach(attach);
  };
  const boot=()=>{
    scan(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{
      if(node.nodeType===1)scan(node);
    }))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  window.StackupInputMasks={formatCpf,formatPhone};
})();