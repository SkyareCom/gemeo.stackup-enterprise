const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const hub=read('screen-alerts.html');
const operation=read('screen-alerts-operation.html');
const groups=read('screen-message-groups-v11.js');
const sync=read('screen-message-language-sync-v1.js');
const patch=read('app-language-alerts-v1.js');
const failures=[];
const must=(ok,msg)=>{if(!ok)failures.push(msg)};
must(!/app-language-qa\.js\?v=0e679e0/.test(hub),'HUB USA CACHE ANTIGO DO QA DE IDIOMAS');
must(!/app-language-qa\.js\?v=0e679e0/.test(operation),'OPERAÇÃO USA CACHE ANTIGO DO QA DE IDIOMAS');
must(/app-language-alerts-v1\.js/.test(hub),'HUB NÃO CARREGA DICIONÁRIO EXATO DE ALERTAS');
must(/app-language-alerts-v1\.js/.test(operation),'OPERAÇÃO NÃO CARREGA DICIONÁRIO EXATO DE ALERTAS');
must(/screen-message-language-sync-v1\.js/.test(operation),'OPERAÇÃO NÃO SINCRONIZA IDIOMA DAS VOZES');
must(/screen-message-groups-v11\.js/.test(operation),'OPERAÇÃO NÃO USA GRUPOS DE MENSAGENS V11');
must(!/c\.voiceLang\s*=\s*['"]pt['"]/.test(operation),'OPERAÇÃO AINDA FORÇA VOICE LANG PARA PORTUGUÊS');
must(/lang\s*=\s*\(\)\s*=>\s*api\.officialLang\(\)/.test(groups),'GRUPOS NÃO USAM O IDIOMA OFICIAL DO APP');
must(/c\.voiceLang\s*=\s*lang/.test(sync),'SYNC NÃO COPIA O IDIOMA OFICIAL PARA VOZ');
[
 'BOAS VINDAS','INÍCIO DE NÍVEIS','TÉRMINO DE NÍVEIS','INÍCIO DE INTERVALOS','TÉRMINO DE INTERVALOS',
 'NOVO NÍVEL + ANTE','NOVO NÍVEL SEM ANTE','RETORNO DO INTERVALO','CONFIRMAR ATIVAÇÃO'
].forEach(k=>{
  must(patch.includes(`'${k}'`),`DICIONÁRIO DE ALERTAS SEM TERMO: ${k}`);
});
if(failures.length){console.error(`ALERTS LANGUAGE RUNTIME AUDIT FALHOU: ${failures.length}`);failures.forEach(x=>console.error(' - '+x));process.exit(1)}
console.log('ALERTS LANGUAGE RUNTIME AUDIT OK: CACHE, IDIOMA OFICIAL, VOZES E STRINGS DINÂMICAS VERIFICADOS.');
