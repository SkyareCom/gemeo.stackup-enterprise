(function(){
  if(window.StackupAppLanguage)return;
  const KEY='stackup-app-language';
  const supported=['pt','en','es'];
  const exact={
    en:{
      'IDIOMAS':'LANGUAGES','AMBIENTES':'ENVIRONMENTS','STAFF':'STAFF','JOGADORES':'PLAYERS','TORNEIOS':'TOURNAMENTS','RANKING':'RANKING','TRANSMISSÃO':'BROADCAST','MARKETING':'MARKETING','CONTATO':'CONTACT','FINANCEIRO':'FINANCIAL','ASSISTÊNCIA IA':'AI ASSISTANCE','REGRAS TDA':'TDA RULES',
      'CADASTRAR AMBIENTE':'REGISTER ENVIRONMENT','AMBIENTES CADASTRADOS':'REGISTERED ENVIRONMENTS','CADASTRAR STAFF':'REGISTER STAFF','STAFF CADASTRADO':'REGISTERED STAFF','CADASTRAR JOGADOR':'REGISTER PLAYER','JOGADORES CADASTRADOS':'REGISTERED PLAYERS',
      'CONFIGURAÇÃO DO TORNEIO':'TOURNAMENT SETTINGS','CONFIGURAÇÕES GERAIS':'GENERAL SETTINGS','NOVO TORNEIO':'NEW TOURNAMENT','GESTÃO DE TORNEIO':'TOURNAMENT MANAGEMENT','CENTRAL DE TORNEIOS':'TOURNAMENT CENTER','TORNEIOS VALIDADOS':'VALIDATED TOURNAMENTS',
      'EVENTO':'EVENT','AMBIENTE':'ENVIRONMENT','SELECIONE O AMBIENTE':'SELECT ENVIRONMENT','NOME DO TORNEIO':'TOURNAMENT NAME','TIPO':'TYPE','MODALIDADE':'GAME','JOGADORES POR MESA':'PLAYERS PER TABLE','ESTRUTURA DE NÍVEIS':'LEVEL STRUCTURE','NOVA ESTRUTURA':'NEW STRUCTURE','HISTÓRICO DE ESTRUTURAS':'STRUCTURE HISTORY','RESUMO':'SUMMARY',
      'CONFIRMAR':'CONFIRM','CONFIRMADO':'CONFIRMED','SALVAR':'SAVE','APAGAR':'DELETE','EDITAR':'EDIT','CANCELAR':'CANCEL','ANTERIOR':'BACK','MENU PRINCIPAL':'MAIN MENU','ABRIR':'OPEN','FECHAR':'CLOSE','USAR':'USE','SELECIONAR':'SELECT','CADASTRAR NOVO':'REGISTER NEW','ABRIR INSCRIÇÕES':'OPEN REGISTRATION',
      'CADASTRO DE JOGADORES':'PLAYER REGISTRATION','CADASTRAR POR DOCUMENTO • IA':'REGISTER FROM DOCUMENT • AI','NOME COMPLETO':'FULL NAME','DATA DE NASCIMENTO':'DATE OF BIRTH','TELEFONE':'PHONE','WHATSAPP':'WHATSAPP','E-MAIL':'E-MAIL','INSTAGRAM':'INSTAGRAM','TIME / EQUIPE':'TEAM','RECEBIMENTO DE INFORMAÇÕES':'INFORMATION DELIVERY',
      'PORTUGUÊS':'PORTUGUESE','PORTUGUÊS DO BRASIL':'BRAZILIAN PORTUGUESE','ENGLISH':'ENGLISH','ESPAÑOL':'SPANISH',
      'GESTÃO COMPLETA PARA':'COMPLETE MANAGEMENT FOR','TORNEIOS DE POKER.':'POKER TOURNAMENTS.','CLUBES / HOME GAMES':'CLUBS / HOME GAMES','EQUIPE & ACESSOS':'TEAM & ACCESS','BASE DE JOGADORES':'PLAYER DATABASE','OPERAÇÃO':'OPERATIONS','PONTUAÇÃO':'SCORING','CAIXA':'CASHIER','INTELIGÊNCIA ARTIFICIAL':'ARTIFICIAL INTELLIGENCE','REGULAMENTO':'RULEBOOK',
      'CADASTRO':'REGISTRATION','BASE CADASTRADA':'REGISTERED DATABASE','CONFIGURAÇÃO':'SETTINGS','GESTÃO':'MANAGEMENT','HISTÓRICO':'HISTORY','ESTRUTURA':'STRUCTURE','JOGADOR':'PLAYER','JOGADORES':'PLAYERS','TORNEIO':'TOURNAMENT','TORNEIOS':'TOURNAMENTS','AMBIENTE':'ENVIRONMENT','AMBIENTES':'ENVIRONMENTS','NENHUM JOGADOR CADASTRADO.':'NO REGISTERED PLAYERS.','NENHUM AMBIENTE CADASTRADO.':'NO REGISTERED ENVIRONMENTS.'
    },
    es:{
      'IDIOMAS':'IDIOMAS','AMBIENTES':'AMBIENTES','STAFF':'STAFF','JOGADORES':'JUGADORES','TORNEIOS':'TORNEOS','RANKING':'RANKING','TRANSMISSÃO':'TRANSMISIÓN','MARKETING':'MARKETING','CONTATO':'CONTACTO','FINANCEIRO':'FINANCIERO','ASSISTÊNCIA IA':'ASISTENCIA IA','REGRAS TDA':'REGLAS TDA',
      'CADASTRAR AMBIENTE':'REGISTRAR AMBIENTE','AMBIENTES CADASTRADOS':'AMBIENTES REGISTRADOS','CADASTRAR STAFF':'REGISTRAR STAFF','STAFF CADASTRADO':'STAFF REGISTRADO','CADASTRAR JOGADOR':'REGISTRAR JUGADOR','JOGADORES CADASTRADOS':'JUGADORES REGISTRADOS',
      'CONFIGURAÇÃO DO TORNEIO':'CONFIGURACIÓN DEL TORNEO','CONFIGURAÇÕES GERAIS':'CONFIGURACIONES GENERALES','NOVO TORNEIO':'NUEVO TORNEO','GESTÃO DE TORNEIO':'GESTIÓN DEL TORNEO','CENTRAL DE TORNEIOS':'CENTRAL DE TORNEOS','TORNEIOS VALIDADOS':'TORNEOS VALIDADOS',
      'EVENTO':'EVENTO','AMBIENTE':'AMBIENTE','SELECIONE O AMBIENTE':'SELECCIONE EL AMBIENTE','NOME DO TORNEIO':'NOMBRE DEL TORNEO','TIPO':'TIPO','MODALIDADE':'MODALIDAD','JOGADORES POR MESA':'JUGADORES POR MESA','ESTRUTURA DE NÍVEIS':'ESTRUCTURA DE NIVELES','NOVA ESTRUTURA':'NUEVA ESTRUCTURA','HISTÓRICO DE ESTRUTURAS':'HISTORIAL DE ESTRUCTURAS','RESUMO':'RESUMEN',
      'CONFIRMAR':'CONFIRMAR','CONFIRMADO':'CONFIRMADO','SALVAR':'GUARDAR','APAGAR':'ELIMINAR','EDITAR':'EDITAR','CANCELAR':'CANCELAR','ANTERIOR':'ANTERIOR','MENU PRINCIPAL':'MENÚ PRINCIPAL','ABRIR':'ABRIR','FECHAR':'CERRAR','USAR':'USAR','SELECIONAR':'SELECCIONAR','CADASTRAR NOVO':'REGISTRAR NUEVO','ABRIR INSCRIÇÕES':'ABRIR INSCRIPCIONES',
      'CADASTRO DE JOGADORES':'REGISTRO DE JUGADORES','CADASTRAR POR DOCUMENTO • IA':'REGISTRAR POR DOCUMENTO • IA','NOME COMPLETO':'NOMBRE COMPLETO','DATA DE NASCIMENTO':'FECHA DE NACIMIENTO','TELEFONE':'TELÉFONO','WHATSAPP':'WHATSAPP','E-MAIL':'E-MAIL','INSTAGRAM':'INSTAGRAM','TIME / EQUIPE':'EQUIPO','RECEBIMENTO DE INFORMAÇÕES':'RECEPCIÓN DE INFORMACIÓN',
      'PORTUGUÊS':'PORTUGUÉS','PORTUGUÊS DO BRASIL':'PORTUGUÉS DE BRASIL','ENGLISH':'INGLÉS','ESPAÑOL':'ESPAÑOL',
      'GESTÃO COMPLETA PARA':'GESTIÓN COMPLETA PARA','TORNEIOS DE POKER.':'TORNEOS DE PÓKER.','CLUBES / HOME GAMES':'CLUBES / HOME GAMES','EQUIPE & ACESSOS':'EQUIPO Y ACCESOS','BASE DE JOGADORES':'BASE DE JUGADORES','OPERAÇÃO':'OPERACIÓN','PONTUAÇÃO':'PUNTUACIÓN','CAIXA':'CAJA','INTELIGÊNCIA ARTIFICIAL':'INTELIGENCIA ARTIFICIAL','REGULAMENTO':'REGLAMENTO',
      'CADASTRO':'REGISTRO','BASE CADASTRADA':'BASE REGISTRADA','CONFIGURAÇÃO':'CONFIGURACIÓN','GESTÃO':'GESTIÓN','HISTÓRICO':'HISTORIAL','ESTRUTURA':'ESTRUCTURA','JOGADOR':'JUGADOR','JOGADORES':'JUGADORES','TORNEIO':'TORNEO','TORNEIOS':'TORNEOS','AMBIENTE':'AMBIENTE','AMBIENTES':'AMBIENTES','NENHUM JOGADOR CADASTRADO.':'NINGÚN JUGADOR REGISTRADO.','NENHUM AMBIENTE CADASTRADO.':'NINGÚN AMBIENTE REGISTRADO.'
    }
  };
  const patterns={
    en:[['INCLUA','ADD'],['CONSULTE','VIEW'],['GERENCIE','MANAGE'],['DEFINA','SET'],['CONFIGURAÇÃO','SETTINGS'],['CADASTRO','REGISTRATION'],['JOGADORES','PLAYERS'],['JOGADOR','PLAYER'],['TORNEIOS','TOURNAMENTS'],['TORNEIO','TOURNAMENT'],['AMBIENTES','ENVIRONMENTS'],['AMBIENTE','ENVIRONMENT'],['NÍVEIS','LEVELS'],['NÍVEL','LEVEL'],['VALORES','VALUES'],['VALOR','VALUE'],['FICHAS','CHIPS'],['MESA FINAL','FINAL TABLE'],['MESA','TABLE'],['MESAS','TABLES'],['HISTÓRICO','HISTORY'],['ESTRUTURA','STRUCTURE'],['INFORMAÇÕES','INFORMATION'],['GERAL','GENERAL'],['NOVO','NEW'],['NOVA','NEW']],
    es:[['INCLUA','INCLUYA'],['CONSULTE','CONSULTE'],['GERENCIE','GESTIONE'],['DEFINA','DEFINA'],['CONFIGURAÇÃO','CONFIGURACIÓN'],['CADASTRO','REGISTRO'],['JOGADORES','JUGADORES'],['JOGADOR','JUGADOR'],['TORNEIOS','TORNEOS'],['TORNEIO','TORNEO'],['NÍVEIS','NIVELES'],['NÍVEL','NIVEL'],['VALORES','VALORES'],['VALOR','VALOR'],['FICHAS','FICHAS'],['MESA FINAL','MESA FINAL'],['MESAS','MESAS'],['MESA','MESA'],['HISTÓRICO','HISTORIAL'],['ESTRUTURA','ESTRUCTURA'],['INFORMAÇÕES','INFORMACIÓN'],['GERAL','GENERAL'],['NOVO','NUEVO'],['NOVA','NUEVA']]
  };
  const lang=()=>{const a=localStorage.getItem(KEY);if(supported.includes(a))return a;try{if(window.state&&supported.includes(state.language))return state.language}catch(_){ }return 'pt'};
  const translateString=(value,target)=>{
    if(!value||target==='pt')return value;
    const raw=String(value),trim=raw.trim();
    if(!trim)return raw;
    const hit=exact[target]?.[trim];
    if(hit)return raw.replace(trim,hit);
    let out=trim;
    (patterns[target]||[]).sort((a,b)=>b[0].length-a[0].length).forEach(([from,to])=>{out=out.replace(new RegExp(`\\b${from}\\b`,'g'),to)});
    return raw.replace(trim,out);
  };
  const originals=new WeakMap();
  const applyElement=(el,target)=>{
    if(!el||el.nodeType!==1)return;
    ['placeholder','title','aria-label'].forEach(attr=>{if(!el.hasAttribute(attr))return;const key=attr+':'+el.getAttribute(attr);let store=originals.get(el)||{};if(!store[attr])store[attr]=el.getAttribute(attr);originals.set(el,store);el.setAttribute(attr,translateString(store[attr],target))});
    if(el.tagName==='OPTION'){let store=originals.get(el)||{};if(!store.option)store.option=el.textContent;originals.set(el,store);el.textContent=translateString(store.option,target)}
  };
  const walk=(root,target)=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(!originals.has(n))originals.set(n,n.nodeValue);n.nodeValue=translateString(originals.get(n),target)});
    if(root.nodeType===1)applyElement(root,target);
    root.querySelectorAll?.('input,select,option,button,a,[title],[aria-label]').forEach(el=>applyElement(el,target));
  };
  let observer=null;
  const apply=(target=lang())=>{
    if(!supported.includes(target))target='pt';
    document.documentElement.lang=target==='pt'?'pt-BR':target;
    walk(document.body||document.documentElement,target);
    if(observer)observer.disconnect();
    observer=new MutationObserver(muts=>{observer.disconnect();for(const m of muts){m.addedNodes.forEach(n=>{if(n.nodeType===1)walk(n,target);else if(n.nodeType===3&&n.nodeValue.trim()){if(!originals.has(n))originals.set(n,n.nodeValue);n.nodeValue=translateString(originals.get(n),target)}})}observer.observe(document.body,{childList:true,subtree:true})});
    if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  };
  const setLanguage=target=>{
    if(!supported.includes(target))return false;
    localStorage.setItem(KEY,target);
    try{if(window.state){state.language=target;if(typeof saveState==='function')saveState()}}catch(_){ }
    apply(target);
    window.dispatchEvent(new CustomEvent('stackup-language-change',{detail:{language:target}}));
    return true;
  };
  window.StackupAppLanguage={get:lang,set:setLanguage,apply,supported};
  const boot=()=>apply(lang());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();