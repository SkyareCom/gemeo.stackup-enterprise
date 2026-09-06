const fs=require('fs');
const path=require('path');
const i18n=require('../app-language.js');
require('../app-language-extra.js');

const ROOT=path.resolve(__dirname,'..');
const EXCLUDE=new Set(['node_modules','.git','.github','tests']);
const EXT=new Set(['.html','.js']);
const SKIP_FILES=new Set(['app-language.js','app-language-extra.js']);
const sourceTerms=[
  'CADASTRAR','CADASTRADO','CADASTRADOS','CADASTRADA','CADASTRADAS','CADASTRO','JOGADOR','JOGADORES','TORNEIO','TORNEIOS','CONFIGURAÇÃO','CONFIGURAÇÕES','GESTÃO','OPERAÇÃO','ESTRUTURA','ESTRUTURAS','NÍVEL','NÍVEIS','HISTÓRICO','SELECIONE','SELECIONAR','SELECIONADO','SELECIONADA','CONFIRMAR','CONFIRMADO','SALVAR','SALVO','APAGAR','EXCLUIR','EDITAR','CANCELAR','ANTERIOR','VOLTAR','FECHAR','ADICIONAR','REMOVER','ATUALIZAR','RETOMAR','GERAR','LIMPAR','NENHUM','NENHUMA','INFORMAÇÃO','INFORMAÇÕES','PERMISSÃO','PERMISSÕES','FUNÇÃO','FUNÇÕES','ACESSO','ACESSOS','TRANSMISSÃO','FINANCEIRO','ASSISTÊNCIA','REGULAMENTO','PONTUAÇÃO','POSIÇÃO','POSIÇÕES','RESUMO','DETALHES','DESCRIÇÃO','OBSERVAÇÃO','OBSERVAÇÕES','ENDEREÇO','CIDADE','PAÍS','QUANTIDADE','MÉDIA','ELIMINAÇÃO','ELIMINAÇÕES','MOVIMENTAÇÃO','MOVIMENTAÇÕES','NECESSÁRIA','NECESSÁRIO','AGUARDANDO','DISPONÍVEL','DISPONÍVEIS','INSCRIÇÕES','PREMIAÇÃO','COLOCAÇÕES','TAXAS','RECORRENTE','DOBRAR','FICHAS','MESAS','MESA','CADEIRA','ASSENTO','TEMPO','VALORES','VALOR','COMPOSIÇÃO','TEMPORIZADOR','CATÁLOGO','RELATÓRIO','RELATÓRIOS','DADOS','OPERACIONAIS','INTERPRETAÇÃO'
];
const residualEn=[...sourceTerms];
const residualEs=[
  'CADASTRAR','CADASTRADO','CADASTRADOS','CADASTRADA','CADASTRADAS','CADASTRO','JOGADOR','JOGADORES','TORNEIO','TORNEIOS','CONFIGURAÇÃO','CONFIGURAÇÕES','GESTÃO','OPERAÇÃO','ESTRUTURA','ESTRUTURAS','NÍVEL','NÍVEIS','HISTÓRICO','SELECIONE','SELECIONAR','SELECIONADO','SELECIONADA','SALVAR','SALVO','APAGAR','ANTERIOR','VOLTAR','FECHAR','ADICIONAR','REMOVER','ATUALIZAR','RETOMAR','LIMPAR','NENHUM','NENHUMA','INFORMAÇÃO','INFORMAÇÕES','PERMISSÃO','PERMISSÕES','FUNÇÃO','FUNÇÕES','ACESSO','ACESSOS','TRANSMISSÃO','FINANCEIRO','ASSISTÊNCIA','REGULAMENTO','PONTUAÇÃO','POSIÇÃO','POSIÇÕES','RESUMO','DETALHES','DESCRIÇÃO','OBSERVAÇÃO','OBSERVAÇÕES','ENDEREÇO','CIDADE','QUANTIDADE','MÉDIA','ELIMINAÇÃO','ELIMINAÇÕES','MOVIMENTAÇÃO','MOVIMENTAÇÕES','NECESSÁRIA','NECESSÁRIO','AGUARDANDO','DISPONÍVEL','DISPONÍVEIS','INSCRIÇÕES','PREMIAÇÃO','COLOCAÇÕES','TAXAS','DOBRAR','COMPOSIÇÃO','RELATÓRIOS','OPERACIONAIS','INTERPRETAÇÃO'
];
const esc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const hasTerm=(text,terms)=>terms.some(t=>new RegExp(`(^|[^\\p{L}\\p{N}_])${esc(t)}(?=$|[^\\p{L}\\p{N}_])`,'u').test(text));
const clean=s=>String(s||'').replace(/\\n/g,' ').replace(/\s+/g,' ').trim();
const looksUi=s=>{
  const t=clean(s);
  if(t.length<2||t.length>320)return false;
  if(/https?:\/\//i.test(t)||/[{}<>]=|function\b|const\b|let\b|var\b|=>|querySelector|classList|dataset|localStorage|Date\.|Math\.|JSON\.|document\.|window\./.test(t))return false;
  return hasTerm(t.toUpperCase(),sourceTerms);
};
function walk(dir,out=[]){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(EXCLUDE.has(ent.name))continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p,out);else if(EXT.has(path.extname(ent.name))&&!SKIP_FILES.has(ent.name))out.push(p)}return out}
function extractHtml(src){const out=[];const textRx=/>\s*([^<>]+?)\s*</g;let m;while((m=textRx.exec(src)))out.push(m[1]);const attrRx=/(?:placeholder|title|aria-label|value)\s*=\s*["']([^"']+)["']/gi;while((m=attrRx.exec(src)))out.push(m[1]);return out}
function extractJs(src){const out=[];const rx=/'([^'\n]{2,320})'|"([^"\n]{2,320})"|`([^`\n]{2,320})`/g;let m;while((m=rx.exec(src)))out.push(m[1]||m[2]||m[3]||'');return out}
const files=walk(ROOT),missingLoader=[],failures=[];let candidates=0;
for(const file of files){const rel=path.relative(ROOT,file).replace(/\\/g,'/'),src=fs.readFileSync(file,'utf8');if(rel.endsWith('.html')){const hasLoader=/shared\.js|app-language\.js|input-masks\.js|ui-standard\.js/.test(src);if(!hasLoader)missingLoader.push(rel)}const strings=rel.endsWith('.html')?extractHtml(src):extractJs(src);for(const raw of strings){const text=clean(raw);if(!looksUi(text))continue;candidates++;const en=clean(i18n.translateString(text,'en')),es=clean(i18n.translateString(text,'es'));if(en===text||hasTerm(en.toUpperCase(),residualEn))failures.push(`${rel} :: EN :: ${text} => ${en}`);if(hasTerm(es.toUpperCase(),residualEs))failures.push(`${rel} :: ES :: ${text} => ${es}`)}}
if(!/^3\./.test(i18n.version||''))failures.push(`VERSÃO DO MOTOR INESPERADA: ${i18n.version}`);const engine=fs.readFileSync(path.join(ROOT,'app-language.js'),'utf8');if(!/characterData:true/.test(engine))failures.push('MOTOR NÃO OBSERVA ALTERAÇÕES DE TEXTO DINÂMICAS.');if(!/iframe/i.test(engine))failures.push('MOTOR NÃO COBRE IFRAMES SAME-ORIGIN.');if(missingLoader.length)failures.push(`TELAS SEM CARREGAMENTO GLOBAL DE IDIOMA: ${missingLoader.join(', ')}`);
if(failures.length){console.error(`LANGUAGE AUDIT FALHOU: ${failures.length} PROBLEMA(S) EM ${candidates} STRING(S) DE UI.`);failures.slice(0,250).forEach(x=>console.error(' - '+x));if(failures.length>250)console.error(` - ... ${failures.length-250} PROBLEMA(S) ADICIONAIS`);process.exit(1)}
console.log(`LANGUAGE AUDIT OK: ${files.length} ARQUIVOS, ${candidates} STRING(S) DE UI, PT/EN/ES COBERTOS.`);