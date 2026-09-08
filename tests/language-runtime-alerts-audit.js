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
const required={
 'BOAS VINDAS':['WELCOME','BIENVENIDA'],'INÍCIO DE NÍVEIS':['START OF LEVELS','INICIO DE NIVELES'],'TÉRMINO DE NÍVEIS':['END OF LEVELS','FIN DE NIVELES'],'INÍCIO DE INTERVALOS':['START OF BREAKS','INICIO DE DESCANSOS'],'TÉRMINO DE INTERVALOS':['END OF BREAKS','FIN DE DESCANSOS'],'NOVO NÍVEL + ANTE':['NEW LEVEL + ANTE','NUEVO NIVEL + ANTE'],'NOVO NÍVEL SEM ANTE':['NEW LEVEL WITHOUT ANTE','NUEVO NIVEL SIN ANTE'],'RETORNO DO INTERVALO':['RETURN FROM BREAK','REGRESO DEL DESCANSO'],'SELEÇÃO DE VOZ':['VOICE SELECTION','SELECCIÓN DE VOZ'],'MENSAGENS':['MESSAGES','MENSAJES'],'MASCULINA':['MALE','MASCULINA'],'FEMININA':['FEMALE','FEMENINA'],'ATIVAR COM ALERTA':['ENABLE WITH ALERT','ACTIVAR CON ALERTA'],'ATIVAR SEM ALERTA':['ENABLE WITHOUT ALERT','ACTIVAR SIN ALERTA'],'TESTAR MENSAGEM':['TEST MESSAGE','PROBAR MENSAJE'],'CONFIRMAR ATIVAÇÃO':['CONFIRM ACTIVATION','CONFIRMAR ACTIVACIÓN'],'MENSAGENS ATIVAS':['ACTIVE MESSAGES','MENSAJES ACTIVOS'],'CONCLUIR EDIÇÃO':['FINISH EDITING','FINALIZAR EDICIÓN'],'ALERTAS SONOROS':['SOUND ALERTS','ALERTAS SONORAS'],'MENSAGENS POR VOZ':['VOICE MESSAGES','MENSAJES DE VOZ'],'MENSAGENS DE TEXTO':['TEXT MESSAGES','MENSAJES DE TEXTO']
};
Object.entries(required).forEach(([pt,[en,es]])=>{must(patch.includes(`'${pt}':'${en}'`),`EN AUSENTE: ${pt}`);must(patch.includes(`'${pt}':'${es}'`),`ES AUSENTE: ${pt}`)});
if(failures.length){console.error(`ALERTS LANGUAGE RUNTIME AUDIT FALHOU: ${failures.length}`);failures.forEach(x=>console.error(' - '+x));process.exit(1)}
console.log(`ALERTS LANGUAGE RUNTIME AUDIT OK: ${Object.keys(required).length} TERMOS CRÍTICOS COBERTOS EM EN E ES + CACHE + VOZES + IDIOMA OFICIAL.`);
