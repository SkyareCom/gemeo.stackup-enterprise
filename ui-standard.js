(function(){
  if(typeof document==='undefined'||window.__stackupUiStandard)return;
  window.__stackupUiStandard=true;
  const style=document.createElement('style');
  style.id='stackup-ui-standard-v1';
  style.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Caacupe+One:wght@400&display=swap');
    html,body,body *,button,input,select,textarea,option,label,a,[role="button"],input::placeholder,textarea::placeholder,
    .stackup-select-trigger,.stackup-select-option,[data-stackup-drawer-trigger],[data-stackup-drawer-panel] *,
    #stackup-global-nav,#stackup-global-nav *,#stackup-global-nav button,#stackup-global-nav a,#stackup-back,#stackup-home{
      font-family:'Caacupe One'!important;
      font-style:normal!important;
      font-weight:400!important;
      letter-spacing:1px!important;
      text-transform:uppercase!important;
    }
    button,.primary,.btn:not(.card),.button:not(.card),a.btn:not(.card),a.button:not(.card),[role="button"]:not(.card),input[type="button"],input[type="submit"],input[type="reset"]{
      height:44px!important;
      min-height:44px!important;
      max-height:44px!important;
      box-sizing:border-box!important;
      padding:0 12px!important;
      border:1px solid #8DFC3B!important;
      border-radius:9px!important;
      background:linear-gradient(#0B100D,#060907)!important;
      color:#8DFC3B!important;
      box-shadow:none!important;
      outline:none!important;
      text-decoration:none!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      text-align:center!important;
      font-size:12px!important;
      line-height:1.15!important;
    }
    button.active,button.selected,button[aria-pressed="true"],button[aria-selected="true"],
    .toggleBtn.active,.lang.active,.stackup-select-option.active,.stackup-select-option.selected,
    [role="button"].active,[role="button"].selected,[role="button"][aria-pressed="true"],[role="button"][aria-selected="true"]{
      background:#8DFC3B!important;
      color:#020302!important;
      border-color:#8DFC3B!important;
    }
    button.active *,button.selected *,button[aria-pressed="true"] *,button[aria-selected="true"] *,
    .toggleBtn.active *,.lang.active *,.stackup-select-option.active *,.stackup-select-option.selected *,
    [role="button"].active *,[role="button"].selected *,[role="button"][aria-pressed="true"] *,[role="button"][aria-selected="true"] *{
      color:#020302!important;
    }
    button:disabled,.primary:disabled,.btn:disabled,.button:disabled,[role="button"][aria-disabled="true"],input[type="button"]:disabled,input[type="submit"]:disabled,input[type="reset"]:disabled{
      opacity:.5!important;cursor:not-allowed!important;
    }
    [data-stackup-new-action][hidden]{display:none!important}
  `;
  (document.head||document.documentElement).appendChild(style);
  if(!document.querySelector('script[data-stackup-confirmation-standard]')){
    const s=document.createElement('script');
    s.src='confirmation-standard.js?v=c5f762edc04fd6043d7bf8ebc624a97b002643d7';
    s.defer=true;
    s.dataset.stackupConfirmationStandard='1';
    (document.head||document.documentElement).appendChild(s);
  }
  if(!document.querySelector('script[data-stackup-environment-context]')){
    const e=document.createElement('script');
    e.src='environment-context.js?v=c201e5fbecff34df6c0bff811d05fa82cb435581';
    e.defer=true;
    e.dataset.stackupEnvironmentContext='1';
    (document.head||document.documentElement).appendChild(e);
  }
})();