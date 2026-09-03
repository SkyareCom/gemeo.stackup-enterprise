(() => {
  const STORAGE_KEY = 'stackup.broadcast.layouts.v1';

  const PRESETS = {
    tv720:   { label: '16:9 • 1280×720',  type: 'wide',   width: 1280, height: 720 },
    tv900:   { label: '16:9 • 1600×900',  type: 'wide',   width: 1600, height: 900 },
    tv1080:  { label: '16:9 • 1920×1080', type: 'wide',   width: 1920, height: 1080 },
    tv4k:    { label: '16:9 • 3840×2160', type: 'wide',   width: 3840, height: 2160 },
    mobile:  { label: 'MOBILE • 390×844', type: 'mobile', width: 390,  height: 844 },
    tablet:  { label: 'TABLET • 768×1024',type: 'tablet', width: 768,  height: 1024 },
    compact: { label: 'COMPACT • 1024×768',type:'compact',width: 1024, height: 768 }
  };

  const EDITABLE = [
    ['brand', '.brand'],
    ['event', '.eventHead'],
    ['lang', '.lang'],
    ['players', '.metric:nth-child(1)'],
    ['prize', '.metric:nth-child(2)'],
    ['reentries', '.metric:nth-child(3)'],
    ['addons', '.metric:nth-child(4)'],
    ['stage', '.stage'],
    ['elapsed', '.lowerCard:nth-child(1)'],
    ['nextBreak', '.lowerCard:nth-child(2)'],
    ['avgStack', '.lowerCard:nth-child(3)'],
    ['lateReg', '.lowerCard:nth-child(4)'],
    ['buyin', '.lowerCard:nth-child(5)'],
    ['footLeft', '.footer > div:nth-child(1)'],
    ['announcement', '.footer > div:nth-child(2)'],
    ['footRight', '.footer > div:nth-child(3)']
  ];

  const params = new URLSearchParams(location.search);
  const editMode = params.get('edit') === '1';
  let currentPreset = resolvePreset(params.get('preset'));
  let selected = null;
  let dragState = null;

  function resolvePreset(requested) {
    if (requested && PRESETS[requested]) return requested;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = w / Math.max(1, h);
    if (ratio < 0.72) return w < 600 ? 'mobile' : 'tablet';
    if (ratio < 1.5) return 'compact';
    if (w >= 3000) return 'tv4k';
    if (w >= 1800) return 'tv1080';
    if (w >= 1450) return 'tv900';
    return 'tv720';
  }

  function readAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function presetData() {
    const all = readAll();
    return all[currentPreset] || {};
  }

  function setPresetData(data) {
    const all = readAll();
    all[currentPreset] = data;
    writeAll(all);
  }

  function transformFor(id) {
    const d = presetData()[id] || {};
    return {
      x: Number.isFinite(+d.x) ? +d.x : 0,
      y: Number.isFinite(+d.y) ? +d.y : 0,
      scale: Number.isFinite(+d.scale) ? +d.scale : 1,
      font: Number.isFinite(+d.font) ? +d.font : 1
    };
  }

  function applyElementTransform(el) {
    const d = transformFor(el.dataset.layoutId);
    el.style.setProperty('--layout-x', `${d.x}px`);
    el.style.setProperty('--layout-y', `${d.y}px`);
    el.style.setProperty('--layout-scale', d.scale);
    el.style.setProperty('--layout-font', d.font);
  }

  function applySavedLayout() {
    document.querySelectorAll('[data-layout-id]').forEach(applyElementTransform);
  }

  function registerEditables() {
    EDITABLE.forEach(([id, selector]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.dataset.layoutId = id;
      el.classList.add('layout-editable');
    });
  }

  function applyPreset(name) {
    currentPreset = PRESETS[name] ? name : 'tv1080';
    const p = PRESETS[currentPreset];
    document.documentElement.dataset.broadcastPreset = currentPreset;
    document.documentElement.dataset.broadcastType = p.type;
    document.documentElement.style.setProperty('--design-w', p.width);
    document.documentElement.style.setProperty('--design-h', p.height);
    const app = document.getElementById('app');
    if (app) app.dataset.preset = currentPreset;
    applySavedLayout();
    fitCanvas();
    if (editMode) updateToolbar();
  }

  function fitCanvas() {
    const app = document.getElementById('app');
    if (!app) return;
    const p = PRESETS[currentPreset];
    const scale = Math.min(window.innerWidth / p.width, window.innerHeight / p.height);
    document.documentElement.style.setProperty('--canvas-scale', Math.max(.05, scale));
  }

  function updateTransform(id, patch) {
    const data = presetData();
    data[id] = { ...transformFor(id), ...patch };
    setPresetData(data);
    const el = document.querySelector(`[data-layout-id="${id}"]`);
    if (el) applyElementTransform(el);
  }

  function select(el) {
    document.querySelectorAll('.layout-selected').forEach(x => x.classList.remove('layout-selected'));
    selected = el || null;
    if (selected) selected.classList.add('layout-selected');
    updateToolbar();
  }

  function startDrag(e, el, mode) {
    if (!editMode || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    select(el);
    const id = el.dataset.layoutId;
    const d = transformFor(id);
    dragState = { id, mode, sx: e.clientX, sy: e.clientY, start: d };
    document.body.classList.add('layout-dragging');
  }

  function onMove(e) {
    if (!dragState) return;
    const p = PRESETS[currentPreset];
    const scaleCanvas = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-scale')) || 1;
    const dx = (e.clientX - dragState.sx) / scaleCanvas;
    const dy = (e.clientY - dragState.sy) / scaleCanvas;
    if (dragState.mode === 'move') {
      updateTransform(dragState.id, { x: Math.round(dragState.start.x + dx), y: Math.round(dragState.start.y + dy) });
    } else {
      const sensitivity = Math.max(180, Math.min(p.width, p.height) * .35);
      const delta = (dx + dy) / sensitivity;
      updateTransform(dragState.id, { scale: Math.max(.35, Math.min(2.5, +(dragState.start.scale + delta).toFixed(3))) });
    }
    updateToolbar();
  }

  function onUp() {
    dragState = null;
    document.body.classList.remove('layout-dragging');
  }

  function bindEditor() {
    document.body.classList.add('layout-editor-mode');
    document.querySelectorAll('[data-layout-id]').forEach(el => {
      el.addEventListener('pointerdown', e => startDrag(e, el, e.shiftKey ? 'resize' : 'move'));
      const handle = document.createElement('span');
      handle.className = 'layout-resize-handle';
      handle.title = 'Arraste para redimensionar';
      handle.addEventListener('pointerdown', e => startDrag(e, el, 'resize'));
      el.appendChild(handle);
    });
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('[data-layout-id]') && !e.target.closest('#layoutToolbar')) select(null);
    });
    createToolbar();
  }

  function createToolbar() {
    const bar = document.createElement('aside');
    bar.id = 'layoutToolbar';
    bar.innerHTML = `
      <div class="lt-title">STACKUP LAYOUT STUDIO</div>
      <select id="ltPreset">${Object.entries(PRESETS).map(([k,p]) => `<option value="${k}">${p.label}</option>`).join('')}</select>
      <div class="lt-selected" id="ltSelected">NENHUM ITEM</div>
      <div class="lt-row">
        <button data-act="fontDown">A−</button><button data-act="fontUp">A+</button>
        <button data-act="smaller">−</button><button data-act="bigger">+</button>
      </div>
      <div class="lt-row">
        <button data-act="resetItem">RESET ITEM</button>
        <button data-act="resetPreset">RESET TELA</button>
      </div>
      <div class="lt-row">
        <button data-act="copy">COPIAR JSON</button>
        <button data-act="done">VISUALIZAR</button>
      </div>
      <div class="lt-help">ARRASTE = MOVER • ALÇA = TAMANHO</div>`;
    document.body.appendChild(bar);
    const selectPreset = bar.querySelector('#ltPreset');
    selectPreset.value = currentPreset;
    selectPreset.addEventListener('change', () => applyPreset(selectPreset.value));
    bar.addEventListener('click', async e => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'done') {
        const u = new URL(location.href); u.searchParams.delete('edit'); u.searchParams.set('preset', currentPreset); location.href = u.toString(); return;
      }
      if (act === 'copy') {
        const payload = JSON.stringify({ preset: currentPreset, layout: presetData() }, null, 2);
        try { await navigator.clipboard.writeText(payload); btn.textContent = 'COPIADO ✓'; setTimeout(() => btn.textContent='COPIAR JSON',1200); }
        catch { prompt('COPIE O JSON:', payload); }
        return;
      }
      if (act === 'resetPreset') {
        if (!confirm('Restaurar todos os itens desta tela?')) return;
        setPresetData({}); applySavedLayout(); select(null); return;
      }
      if (!selected) return;
      const id = selected.dataset.layoutId;
      const d = transformFor(id);
      if (act === 'fontDown') updateTransform(id, { font: Math.max(.55, +(d.font - .05).toFixed(2)) });
      if (act === 'fontUp') updateTransform(id, { font: Math.min(2.2, +(d.font + .05).toFixed(2)) });
      if (act === 'smaller') updateTransform(id, { scale: Math.max(.35, +(d.scale - .05).toFixed(2)) });
      if (act === 'bigger') updateTransform(id, { scale: Math.min(2.5, +(d.scale + .05).toFixed(2)) });
      if (act === 'resetItem') { const data=presetData(); delete data[id]; setPresetData(data); applyElementTransform(selected); }
      updateToolbar();
    });
    updateToolbar();
  }

  function updateToolbar() {
    const preset = document.getElementById('ltPreset');
    if (preset) preset.value = currentPreset;
    const out = document.getElementById('ltSelected');
    if (!out) return;
    if (!selected) { out.textContent = `TELA: ${PRESETS[currentPreset].label} • SELECIONE UM ITEM`; return; }
    const d = transformFor(selected.dataset.layoutId);
    out.textContent = `${selected.dataset.layoutId.toUpperCase()} • X ${d.x} • Y ${d.y} • ${Math.round(d.scale*100)}% • FONTE ${Math.round(d.font*100)}%`;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      html,body{width:100%;height:100%;overflow:hidden;background:#000}
      body{display:flex!important;align-items:center;justify-content:center!important}
      .screen{width:calc(var(--design-w) * 1px)!important;height:calc(var(--design-h) * 1px)!important;max-width:none!important;max-height:none!important;min-width:calc(var(--design-w) * 1px);min-height:calc(var(--design-h) * 1px);transform:scale(var(--canvas-scale));transform-origin:center center;flex:none}
      .layout-editable{transform:translate(var(--layout-x,0px),var(--layout-y,0px)) scale(var(--layout-scale,1));transform-origin:center center;font-size:calc(1em * var(--layout-font,1))!important}

      html[data-broadcast-type="mobile"] .screen{padding:26px 20px 18px;grid-template-rows:92px 118px 340px 214px 42px}
      html[data-broadcast-type="mobile"] .top{grid-template-columns:1fr auto;grid-template-areas:'brand lang' 'event event';gap:8px}
      html[data-broadcast-type="mobile"] .brand{grid-area:brand;font-size:12px}.eventHead{grid-area:event}.lang{grid-area:lang;font-size:10px}
      html[data-broadcast-type="mobile"] .event{font-size:26px}.live{font-size:9px}.game{font-size:10px}
      html[data-broadcast-type="mobile"] .metrics{grid-template-columns:1fr 1fr;gap:8px;padding:0}
      html[data-broadcast-type="mobile"] .metric{border:1px solid #262626;border-radius:10px;padding:10px 6px;background:#070707}
      html[data-broadcast-type="mobile"] .metric:not(:last-child)::after{display:none}
      html[data-broadcast-type="mobile"] .metric .v{font-size:24px}.metric .k{font-size:9px}.metric .s{font-size:8px}
      html[data-broadcast-type="mobile"] .stage{width:100%;padding-top:0}.arcBox{width:94%;height:58%}
      html[data-broadcast-type="mobile"] .timer{font-size:84px}.levelTop{font-size:18px}.blinds{width:94%;gap:2%;margin-top:18px}.blind .v{font-size:22px}.blind .k{font-size:9px}.next{width:92%;font-size:9px}
      html[data-broadcast-type="mobile"] .lower{grid-template-columns:1fr 1fr;gap:8px;overflow:visible}.lowerCard{padding:10px 12px;border-radius:10px}.lowerCard:nth-child(5){grid-column:1/3}.lowerCard .v{font-size:17px}.lowerCard .k{font-size:8px}.lowerCard .s{font-size:8px}
      html[data-broadcast-type="mobile"] .footer{grid-template-columns:1fr 1.6fr .7fr;font-size:8px;gap:6px}.alert{font-size:8px}

      html[data-broadcast-type="tablet"] .screen{padding:36px 38px 24px;grid-template-rows:130px 150px 470px 190px 50px}
      html[data-broadcast-type="tablet"] .event{font-size:46px}.timer{font-size:142px}.stage{width:86%}.metrics{padding:0;gap:12px}.lower{gap:10px}.lowerCard{padding:14px}
      html[data-broadcast-type="tablet"] .metric .v{font-size:34px}.lowerCard .v{font-size:21px}

      html[data-broadcast-type="compact"] .screen{padding:26px 34px 18px;grid-template-rows:105px 108px 365px 130px 36px}
      html[data-broadcast-type="compact"] .event{font-size:40px}.timer{font-size:128px}.stage{width:74%}.metric .v{font-size:31px}.lowerCard .v{font-size:20px}

      body.layout-editor-mode{background:#101010!important;touch-action:none}
      .layout-editor-mode [data-layout-id]{outline:1px dashed rgba(244,180,42,.42);cursor:move;position:relative}
      .layout-editor-mode [data-layout-id]:hover{outline-color:#f4b42a}
      .layout-editor-mode .layout-selected{outline:2px solid #f4b42a!important;box-shadow:0 0 0 4px rgba(244,180,42,.12)}
      .layout-resize-handle{display:none;position:absolute;right:-7px;bottom:-7px;width:16px;height:16px;border-radius:3px;background:#f4b42a;border:2px solid #111;cursor:nwse-resize;z-index:9999}
      .layout-editor-mode .layout-selected>.layout-resize-handle{display:block}
      #layoutToolbar{position:fixed;z-index:999999;left:12px;top:12px;width:270px;padding:12px;border:1px solid #4a3b18;border-radius:10px;background:rgba(7,7,7,.96);box-shadow:0 12px 40px rgba(0,0,0,.55);font:600 11px/1.2 Arial,sans-serif;color:#fff;transform:none!important}
      #layoutToolbar .lt-title{color:#f4b42a;letter-spacing:.11em;margin-bottom:9px}
      #layoutToolbar select,#layoutToolbar button{background:#151515;color:#fff;border:1px solid #353535;border-radius:6px;height:30px;font:600 10px Arial,sans-serif}
      #layoutToolbar select{width:100%;padding:0 8px;margin-bottom:8px}
      #layoutToolbar .lt-selected{min-height:30px;padding:7px 8px;background:#0d0d0d;border-radius:6px;color:#cfcfcf;margin-bottom:7px}
      #layoutToolbar .lt-row{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:5px;margin-top:5px}
      #layoutToolbar button:hover{border-color:#f4b42a;color:#f4b42a}
      #layoutToolbar .lt-help{margin-top:8px;color:#777;font-size:9px;text-align:center;letter-spacing:.04em}
      .layout-dragging *{user-select:none!important}
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
    registerEditables();
    applyPreset(currentPreset);
    if (editMode) bindEditor();
    window.addEventListener('resize', fitCanvas);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();