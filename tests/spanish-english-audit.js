const fs=require('fs');
const path=require('path');
const i18n=require('../app-language.js');
require('../app-language-extra.js');
require('../app-language-final.js');
require('../app-language-qa.js');
require('../app-language-alerts-v1.js');
const ROOT=path.resolve(__dirname,'..');
const EXCLUDE=new Set(['node_modules','.git','.github','tests','tools']);
const EXT=new Set(['.html','.js']);
const SKIP=new Set(['app-language.js','app-language-extra.js','app-language-final.js','app-language-qa.js','app-language-alerts-v1.js','screen-message-groups-v12.js']);
const allowed=new Set(['POKER','HOLD','EM','CASH','BUY','IN','BUY-IN','REBUY','REBUYS','RE-ENTRY','RE-ENTRIES','ADD-ON','ADD-ONS','BLINDS','ANTE','BOUNTY','PKO','STACK','STACKS','POT','POTS','DEALER','DEALERS','HAND','HAND-FOR-HAND','ITM','TDA','CRM','TV','SMS','WHATSAPP','EMAIL','FIRE','STICK','CAST','HOME','GAME','GAMES','FLOOR','TD','AI']);
const suspicious=new Set(['BACK','MAIN','MENU','PRIMARY','SECONDARY','SETTINGS','SAVE','CANCEL','EDIT','DELETE','OPEN','CLOSE','START','END','NEXT','PREVIOUS','PLAYER','PLAYERS','TOURNAMENT','TOURNAMENTS','LEVEL','LEVELS','MESSAGE','MESSAGES','VOICE','VOICES','SOUND','SOUNDS','TEXT','ALERT','ALERTS','ACTIVE','INACTIVE','MALE','FEMALE','SELECT','SELECTED','TEST','TESTING','ENABLE','ENABLED','DISABLE','DISABLED','ADD','REMOVE','NEW','GENERAL','MANAGEMENT','REGISTRATION','STRUCTURE','STRUCTURES','TABLE','TABLES','BREAK','BREAKS','WELCOME','OPENING','RETURN','FROM','WITHOUT','WITH','ENTRY','ENTRIES','AUTOMATIC','MANUAL','FINISH','SEARCH','VIEW','CREATE','CREATED','UPDATE','UPDATED','CONFIRM','CONFIRMED','FINANCE','FINANCIAL','CONTACT','LANGUAGE','LANGUAGES','ENVIRONMENT','ENVIRONMENTS','TEAM','PERMISSIONS','DATABASE','OPERATIONS','BROADCAST','SCORING','RULEBOOK','ROOM','CLOCK','SCREEN','SCREENS','BACKGROUND','COLOR','COLORS','PROGRESS','CENTER','PERFORMANCE','LOYALTY','SEGMENTATION','COMMUNICATIONS','NOTICES','MOVES','OPERATIONAL','INFORMATION','DIRECTLY','CASHIER','PAYMENTS','CREDITS','WALLET','CURRENCIES','EXCHANGE','RATES','CLOSING','IMPORT','SMART','RECOGNITION','ANALYTICS','AUTOMATIONS','ASSISTANT','REPORTS','NONE','PENDING','REGISTERED','REQUIRED','INVALID','VALUE','DESTINATION','SEAT','OCCUPIED','SESSION','RESULT','NET','SELECTED','CURRENT','TIME','REMAINING','ELAPSED','UPCOMING','HISTORY','RESULTS','STATISTICS']);
const clean=s=>String(s||'').replace(/\\n/g,' ').replace(/\s+/g,' ').trim();
const looksUi=s=>{const t=clean(s);if(t.length<2||t.length>360)return false;if(/https?:\/\//i.test(t)||/\$\{|<\/?[a-z]|=>|===|!==|&&|\|\||\.value\b|\.textContent\b|\.innerHTML\b|\b(function|const|let|var|return|if|else|for|while|querySelector|classList|dataset|localStorage|document|window)\b/i.test(t))return false;return /[A-Za-zÀ-ÿ]/.test(t)};
function walk(dir,out=[]){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(EXCLUDE.has(ent.name))continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p,out);else if(EXT.has(path.extname(ent.name))&&!SKIP.has(ent.name))out.push(p)}return out}
function extractHtml(src){const out=[];let m;const textRx=/>\s*([^<>]+?)\s*</g;while((m=textRx.exec(src)))out.push(m[1]);const attrRx=/(?:placeholder|title|aria-label|value)\s*=\s*["']([^"']+)["']/gi;while((m=attrRx.exec(src)))out.push(m[1]);return out}
function extractJs(src){const out=[];let m;const rx=/'([^'\n]{2,360})'|"([^"\n]{2,360})"|`([^`\n]{2,360})`/g;while((m=rx.exec(src)))out.push(m[1]||m[2]||m[3]||'');return out}
const failures=[];let candidates=0;
for(const file of walk(ROOT)){const rel=path.relative(ROOT,file).replace(/\\/g,'/'),src=fs.readFileSync(file,'utf8'),strings=rel.endsWith('.html')?extractHtml(src):extractJs(src);for(const raw of strings){const source=clean(raw);if(!looksUi(source))continue;candidates++;const es=clean(i18n.translateString(source,'es'));const words=(es.toUpperCase().match(/[A-ZÁÉÍÓÚÜÑ-]+/g)||[]).filter(w=>suspicious.has(w)&&!allowed.has(w));if(words.length)failures.push(`${rel} :: ${source} => ${es} :: ENGLISH=[${[...new Set(words)].join(', ')}]`)}}
const unique=[...new Set(failures)];
if(unique.length){console.error(`SPANISH ENGLISH-RESIDUE AUDIT FALHOU: ${unique.length} PROBLEMA(S) EM ${candidates} STRING(S).`);unique.slice(0,1500).forEach(x=>console.error(' - '+x));process.exit(1)}
console.log(`SPANISH ENGLISH-RESIDUE AUDIT OK: ${candidates} STRING(S) VERIFICADAS, SEM INGLÊS INDEVIDO NO ESPANHOL.`);
