(function(){
  const removeLegacy=()=>{
    document.getElementById('ftHandsCard')?.remove();
    document.getElementById('ftDealerHandControls')?.remove();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeLegacy,{once:true});else removeLegacy();
})();