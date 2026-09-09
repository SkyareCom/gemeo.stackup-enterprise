const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const allFiles=new Set(fs.readdirSync(root));
const failures=[];
const warnings=[];
let buttonCount=0, linkCount=0, inlineScriptCount=0;

const stripQuery=s=>String(s||'').split('#')[0].split('?')[0];
const isExternal=s=>/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(String(s||''));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const camel=s=>s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());

function localScripts(html,file){
  const out=[];
  for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)){
    const src=stripQuery(m[1]);
    if(!src||isExternal(src))continue;
    const local=path.basename(src);
    if(allFiles.has(local))out.push(fs.readFileSync(path.join(root,local),'utf8'));
    else failures.push(`${file}: SCRIPT AUSENTE -> ${local}`);
  }
  let i=0;
  for(const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)){
    const code=m[1]||'';
    out.push(code);
    if(code.trim()){
      inlineScriptCount++;
      try{new vm.Script(code,{filename:`${file}#inline-${i}`})}catch(e){failures.push(`${file}: ERRO DE SINTAXE NO SCRIPT INLINE ${i} -> ${String(e.message||e).split('\n')[0]}`)}
    }
    i++;
  }
  return out.join('\n');
}

function likelyBound(attrs, code){
  if(/\bonclick\s*=|\bonchange\s*=|\bonpointer|\bontouch|\bonmousedown|\bonmouseup/i.test(attrs))return true;
  const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1];
  const cls=(attrs.match(/\bclass=["']([^"']+)["']/i)||[])[1]||'';
  const dataAttrs=[...attrs.matchAll(/\bdata-([\w-]+)=/gi)].map(m=>m[1]);
  if(id){
    const e=esc(id);
    const patterns=[
      new RegExp(`\\b${e}\\s*\\.\\s*onclick\\s*=`),
      new RegExp(`\\b${e}\\s*\\.\\s*addEventListener\\(`),
      new RegExp(`getElementById\\(\\s*['\"]${e}['\"]\\s*\\)[\\s\\S]{0,180}?(?:onclick\\s*=|addEventListener\\()`),
      new RegExp(`querySelector\\(\\s*['\"]#${e}['\"]\\s*\\)[\\s\\S]{0,180}?(?:onclick\\s*=|addEventListener\\()`),
      new RegExp(`['\"]#${e}['\"]`),
      new RegExp(`['\"]${e}['\"]`)
    ];
    if(patterns.some(r=>r.test(code)))return true;
  }
  for(const c of cls.split(/\s+/).filter(Boolean)){
    const e=esc(c);
    if(new RegExp(`querySelectorAll\\(\\s*['\"][^'\"]*\\.${e}`).test(code)||new RegExp(`closest\\(\\s*['\"][^'\"]*\\.${e}`).test(code))return true;
  }
  for(const d of dataAttrs){
    const e=esc(d),prop=esc(camel(d));
    const patterns=[
      new RegExp(`data-${e}`),
      new RegExp(`dataset\\.${prop}\\b`),
      new RegExp(`dataset\\[['\"]${e}['\"]\\]`),
      new RegExp(`\\[data-${e}(?:=|\\])`)
    ];
    if(patterns.some(r=>r.test(code)))return true;
  }
  return false;
}

function insideAnchor(html,index){
  const before=html.slice(0,index);
  return before.lastIndexOf('<a')>before.lastIndexOf('</a>');
}

for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const code=localScripts(html,file);

  for(const m of html.matchAll(/<a\b([^>]*?)\bhref=["']([^"']+)["'][^>]*>/gi)){
    linkCount++;
    const href=m[2];
    if(!href||isExternal(href))continue;
    const target=stripQuery(href);
    if(target&&!allFiles.has(path.basename(target)))failures.push(`${file}: LINK LOCAL AUSENTE -> ${href}`);
  }

  for(const m of html.matchAll(/<button\b([^>]*)>/gi)){
    buttonCount++;
    const attrs=m[1]||'';
    if(/\bdisabled\b/i.test(attrs))continue;
    if(insideAnchor(html,m.index||0))continue;
    const type=(attrs.match(/\btype=["']([^"']+)["']/i)||[])[1]||'submit';
    if(type.toLowerCase()==='submit'&&/<form\b/i.test(html))continue;
    if(!likelyBound(attrs,code)){
      const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1]||'(sem id)';
      warnings.push(`${file}: BOTÃO SEM VÍNCULO ESTÁTICO EVIDENTE -> ${id}`);
    }
  }
}

console.log(`UI AUDIT: ${htmlFiles.length} páginas, ${buttonCount} botões, ${linkCount} links, ${inlineScriptCount} scripts inline verificados.`);
for(const w of warnings)console.log('WARN:',w);
if(failures.length){for(const f of failures)console.error('FAIL:',f);process.exit(1)}
if(warnings.length){for(const w of warnings)console.error('FAIL:',w);process.exit(1)}
console.log('UI AUDIT PASS: botões têm ação/navegação identificável, scripts inline compilam e alvos locais existem.');
