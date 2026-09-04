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
