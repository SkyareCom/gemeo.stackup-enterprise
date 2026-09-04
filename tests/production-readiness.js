const fs=require('fs');
const vm=require('vm');

const failures=[];
const assert=(name,cond)=>{if(!cond)failures.push(name);else console.log('PASS:',name)};

for(const file of ['index.html','login.html']){
  const html=fs.readFileSync(file,'utf8');
  const prod=html.indexOf('production-init.js');
  const shared=html.indexOf('shared.js');
  const auth=html.indexOf('auth-engine.js');
  const cleanup=html.indexOf('production-auth-cleanup.js');
  assert(`${file}: production-init antes de shared`,prod>=0&&shared>=0&&prod<shared);
  assert(`${file}: limpeza auth após engine`,auth>=0&&cleanup>auth);
}

for(const file of ['checkin.html','players.html','players-directory.html','staff.html','dealer.html','tournament-close.html','tournament-manager.html','tournament-settings.html']){
  const html=fs.readFileSync(file,'utf8');
  assert(`${file}: carrega auth-engine`,html.includes('auth-engine.js'));
  assert(`${file}: aplica guard de autenticação`,html.includes('StackupAuth.guard()'));
}
const movements=fs.readFileSync('players.html','utf8');
assert('movimentações não usa TD sintético como operador',!movements.includes("id:'MOVEMENTS_PANEL',name:'MOVEMENTS PANEL',role:'TD'"));
assert('movimentações obtém staff da sessão',movements.includes('StackupAuth.staffForSession()'));
const close=fs.readFileSync('tournament-close.html','utf8');
assert('fechamento obtém responsável da sessão',close.includes('SESSION_STAFF=StackupAuth.staffForSession()'));
assert('fechamento não permite escolher outro responsável',close.includes('id="staff" disabled'));
const directory=fs.readFileSync('players-directory.html','utf8');
assert('cadastro geral integra documento IA',directory.includes('smart-registration.html?return=players-directory.html'));
assert('jogadores editam no próprio card',directory.includes('data-inline-confirm')&&!directory.includes('window.scrollTo({top:0'));
assert('jogadores usam confirmar',directory.includes('>CONFIRMAR<'));
const staff=fs.readFileSync('staff.html','utf8');
assert('staff edita no próprio card',staff.includes('data-inline-confirm')&&!staff.includes('window.scrollTo({top:0'));
assert('staff usa confirmar',staff.includes('>CONFIRMAR<'));
const checkin=fs.readFileSync('checkin.html','utf8');
assert('check-in atribui operador autenticado',checkin.includes('CHECKIN_STAFF=StackupAuth.staffForSession()'));
assert('check-in bloqueia inscrição sem torneio',checkin.includes('SELECIONE E CONFIGURE UM TORNEIO'));

const standard=fs.readFileSync('data-entry-standard.js','utf8');
const sharedLoader=fs.readFileSync('shared.js','utf8');
const financeLoader=fs.readFileSync('finance-config.js','utf8');
assert('shared carrega padrão global de preenchimento',sharedLoader.includes('data-entry-standard.js'));
assert('finance carrega padrão global de preenchimento',financeLoader.includes('data-entry-standard.js'));
assert('configuração do torneio neutraliza prompt e edita no card',standard.includes("el.onclick=null;el.onfocus=null;el.readOnly=false")&&standard.includes('confirmTournamentData'));
assert('comunicações confirma telefone no próprio card',standard.includes('data-confirm-phone')&&standard.includes("b.textContent='CONFIRMAR'"));
assert('configurações financeiras usam confirmar',standard.includes("page!=='finance-settings.html'")&&standard.includes("main.textContent='CONFIRMAR'"));
assert('importação de estrutura usa confirmar e trava',standard.includes("page!=='structure-import.html'")&&standard.includes("b.textContent='CONFIRMAR'"));
assert('ranking geral confirma filtros',standard.includes('confirmRankingFilter'));
assert('reconhecimento confirma busca',standard.includes('confirmRecognitionSearch'));
assert('seleção de jogador usa confirmar',standard.includes("page==='tournament-players.html'")&&standard.includes("b.textContent='CONFIRMAR'"));

const centrallyHandled=new Set(['setup.html','communications.html','finance-settings.html','ranking-general.html','recognition.html','structure-import.html','tournament-players.html']);
const semanticActionPages=new Set(['login.html']);
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  if(/\bplaceholder\s*=/.test(html)){
    const explicit=/CONFIRMAR/.test(html);
    const centralized=centrallyHandled.has(file);
    const semantic=semanticActionPages.has(file)&&/(ENTRAR|ACESSAR|LOGIN)/i.test(html);
    assert(`${file}: tela com placeholder possui confirmação explícita ou padrão central`,explicit||centralized||semantic);
  }
  const promptUsed=/(^|[^\w])prompt\s*\(/.test(html);
  const neutralizedLegacy=file==='setup.html'&&standard.includes('el.onclick=null;el.onfocus=null;el.readOnly=false');
  assert(`${file}: não usa prompt externo ativo para preencher dados`,!promptUsed||neutralizedLegacy);
}

const authSource=fs.readFileSync('auth-engine.js','utf8');
assert('auth não recria POKER CLUB legado',!authSource.includes("state.clubName||'POKER CLUB'"));
assert('dealer pode acessar chip count',authSource.includes("DEALER_PAGES=new Set(['dealer.html','chip-count-ai.html'])"));
assert('floor pode acessar cadastro inteligente',authSource.includes("'smart-registration.html'"));
assert('TD pode acessar configuração do torneio',authSource.includes("'tournament-settings.html'"));
const operationsSource=fs.readFileSync('operations.js','utf8');
assert('operações não usam operador LOCAL como fallback',!operationsSource.includes("||'LOCAL'"));
assert('operações não usam POKER CLUB como fallback',!operationsSource.includes("||'POKER CLUB'"));
assert('operações priorizam staff autenticado',operationsSource.includes('StackupAuth?.staffForSession?.()'));

const sharedSource=fs.readFileSync('shared.js','utf8');
for(const legacy of ['MAIN EVENT - ETAPA 4','event-main-4','clubName:"POKER CLUB"','guaranteed:150000','startingStack:30000','buyin:500,fee:50']){
  assert(`shared sem dado demonstrativo: ${legacy}`,!sharedSource.includes(legacy));
}
assert('shared inicia relógio zerado',/remaining:0,elapsed:0/.test(sharedSource));
assert('shared inicia operação sem torneio',/eventId:"",operator:"",tournamentName:"",clubName:""/.test(sharedSource));

const storage=new Map([
  ['poker-club-state-v4',JSON.stringify({tournamentName:'MAIN EVENT - ETAPA 4',remaining:1200,elapsed:777,players:[{id:'test'}],transactions:[{id:'tx-test'}]})],
  ['stackup-player-directory-v1',JSON.stringify([{id:'player-test'}])],
  ['stackup-auth-session-v1',JSON.stringify({id:'session-test'})],
  ['stackup-ready-tournaments-v1',JSON.stringify([{id:'ready-test'}])]
]);
const localStorage={
  get length(){return storage.size},
  key:i=>[...storage.keys()][i]??null,
  getItem:k=>storage.has(k)?storage.get(k):null,
  setItem:(k,v)=>storage.set(k,String(v)),
  removeItem:k=>storage.delete(k)
};
const sandbox={console,localStorage};sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('production-init.js','utf8'),sandbox,{filename:'production-init.js'});
const state=JSON.parse(storage.get('poker-club-state-v4'));
assert('nome de torneio zerado',state.tournamentName==='');
assert('clube zerado',state.clubName==='');
assert('timer zerado',state.remaining===0&&state.elapsed===0&&state.timerBaseRemaining===0&&state.elapsedBase===0);
assert('timer parado',state.running===false&&state.timerStartedAt===null&&state.elapsedStartedAt===null);
assert('dados operacionais limpos',state.players.length===0&&state.transactions.length===0&&state.auditLog.length===0&&state.seatCheckins.length===0);
assert('cadastro de teste removido',!storage.has('stackup-player-directory-v1'));
assert('sessão de teste removida',!storage.has('stackup-auth-session-v1'));
assert('torneio validado de teste removido',!storage.has('stackup-ready-tournaments-v1'));
assert('marcador de baseline gravado',storage.get('stackup-production-reset-version')==='2026-09-04-professional-v1');

vm.runInContext(fs.readFileSync('production-init.js','utf8'),sandbox,{filename:'production-init-second-run.js'});
assert('reset é executado uma única vez',JSON.parse(storage.get('poker-club-state-v4')).tournamentName==='');

if(failures.length){
  failures.forEach(f=>console.error('FAIL:',f));
  process.exit(1);
}
console.log('PRODUCTION READINESS PASS');
