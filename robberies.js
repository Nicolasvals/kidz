(function(){
  function initRobberies(){
    const selector = document.getElementById('robberySelector');
    const detail = document.getElementById('robberyDetail');
    const search = document.getElementById('robberySearch');
    const backButtons = [...document.querySelectorAll('.robbery-title-back')];
    const mainHead = document.getElementById('robberiesMainHead');
    if(!selector || !detail) return;

    const entries = [...selector.querySelectorAll('.robbery-entry')];
    const panels = [...detail.querySelectorAll('.robbery-panel')];

    function openRobbery(key){
      entries.forEach(el => el.classList.toggle('active', el.dataset.robbery === key));
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.robberyPanel === key);
      });
      selector.hidden = true;
      if(search) search.parentElement.hidden = true;
      if(mainHead) mainHead.hidden = true;
      detail.hidden = false;
      requestAnimationFrame(()=>detail.classList.add('visible'));
      window.scrollTo({top:0,behavior:'smooth'});
    }

    function closeRobbery(){
      detail.classList.remove('visible');
      setTimeout(()=>{
        detail.hidden = true;
        selector.hidden = false;
        if(search) search.parentElement.hidden = false;
        if(mainHead) mainHead.hidden = false;
        entries.forEach(el=>el.classList.remove('active'));
        panels.forEach(panel=>panel.classList.remove('active'));
      },180);
    }

    selector.addEventListener('click',e=>{
      const entry=e.target.closest('.robbery-entry');
      if(entry) openRobbery(entry.dataset.robbery);
    });

    backButtons.forEach(button=>button.addEventListener('click',closeRobbery));

    search?.addEventListener('input',()=>{
      const q=search.value.trim().toLocaleLowerCase('es');
      entries.forEach(entry=>{
        entry.hidden = !!q && !entry.textContent.toLocaleLowerCase('es').includes(q);
      });
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initRobberies,{once:true});
  }else{
    initRobberies();
  }
})();