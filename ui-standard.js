(function(){
  if(typeof document==='undefined'||window.__stackupUiStandard)return;
  window.__stackupUiStandard=true;
  const style=document.createElement('style');
  style.id='stackup-ui-standard-v1';
  style.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Caacupe+One:wght@400&display=swap');
    html,body,body *,button,input,select,textarea,option,label,a,[role="button"],input::placeholder,textarea::placeholder,
    .stackup-select-trigger,.stackup-select-option,[data-stackup-drawer-trigger],[data-stackup-drawer-panel] *{
      font-family:'Caacupe One',system-ui,sans-serif!important;
      font-style:normal!important;
      font-weight:400!important;
      letter-spacing:1px!important;
      text-transform:uppercase!important;
    }
    button,.primary,.btn,.button,a.btn,a.button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]{
      min-height:44px!important;
      padding:10px 12px!important;
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
    button:disabled,.primary:disabled,.btn:disabled,.button:disabled,[role="button"][aria-disabled="true"],input[type="button"]:disabled,input[type="submit"]:disabled,input[type="reset"]:disabled{
      opacity:.5!important;cursor:not-allowed!important;
    }
    [data-stackup-new-action][hidden]{display:none!important}
  `;
  (document.head||document.documentElement).appendChild(style);
  if(!document.querySelector('script[data-stackup-confirmation-standard]')){
    const s=document.createElement('script');
    s.src='confirmation-standard.js?v=7ae6ced1c57889b534d43e57d20098c2c94f4a11';
    s.defer=true;
    s.dataset.stackupConfirmationStandard='1';
    (document.head||document.documentElement).appendChild(s);
  }
})();