const fs=require('fs');
const src=fs.readFileSync('control-operational-hub-v1.js','utf8');
const failures=[];
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
ok('Hub define catálogo estrito de jogadores do evento',src.includes("const eventOf=p=>String(p?.eventId||p?.validationEventId||'')")&&src.includes('const eventPlayers=()=>'));
ok('Mesas usam somente jogadores do evento',/const seated=\(\)=>eventPlayers\(\)/.test(src));
ok('Alternates usam somente jogadores do evento',/const alternates=\(\)=>eventPlayers\(\)/.test(src));
ok('Busca dinâmica usa somente jogadores do evento',/function playersFiltered\(\)[\s\S]*?return eventPlayers\(\)\.filter/.test(src));
ok('Seleção dinâmica resolve jogador somente no evento',/function selectPlayer\(id\)[\s\S]*?eventPlayers\(\)\.find/.test(src));
ok('Confirmação não pode resolver jogador de outro evento',/function confirmAction\(\)[\s\S]*?p=eventPlayers\(\)\.find/.test(src));
ok('Classificação de eliminação conta somente o evento',/function eliminate\(p\)[\s\S]*?eventPlayers\(\)\.filter/.test(src));
ok('Fallback do balancing é isolado pelo eventId',src.includes('const eventBalance=()=>')&&src.includes('plan=eventBalance()'));
ok('Check-in gravado carrega eventId ativo',src.includes('eventId:eventId(),playerId:p.id'));
if(failures.length){console.error(`CONTROL HUB SCOPE AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('CONTROL HUB SCOPE AUDIT PASS: listas, busca, seleção e confirmação não atravessam torneios.');
