(function(){
  function initDrugSelector(){
    const view = document.getElementById('view-drugs');
    const selector = document.getElementById('drugSelector');
    if(!view || !selector || view.dataset.drugsReady === '1') return;

    view.dataset.drugsReady = '1';

    const shell = view.querySelector('.drug-detail-shell');

    function choices(){
      return [...selector.querySelectorAll('.drug-choice')];
    }

    function panels(){
      return [...view.querySelectorAll('[data-drug-panel]')];
    }

    function clearDrugSelection(immediate=true){
      choices().forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed','false');
      });

      panels().forEach(panel => panel.classList.remove('active'));
      shell?.classList.remove('has-selection');

      if(immediate){
        view.classList.remove('drug-focus-mode','drug-returning');
      }else{
        view.classList.add('drug-returning');
        window.setTimeout(() => {
          view.classList.remove('drug-focus-mode','drug-returning');
        }, 280);
      }
    }

    function selectDrug(drug){
      const selectedButton = choices().find(btn => btn.dataset.drug === drug);
      const selectedPanel = panels().find(panel => panel.dataset.drugPanel === drug);

      if(!selectedButton || !selectedPanel) return;

      choices().forEach(btn => {
        const selected = btn === selectedButton;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      panels().forEach(panel => {
        panel.classList.toggle('active', panel === selectedPanel);
      });

      shell?.classList.add('has-selection');
      view.classList.remove('drug-returning');
      view.classList.add('drug-focus-mode');
    }

    /*
      Delegación: aunque el resto de app.js tenga un problema,
      los botones de drogas siguen respondiendo.
    */
    selector.addEventListener('click', event => {
      const button = event.target.closest('.drug-choice');
      if(!button) return;

      event.preventDefault();
      event.stopPropagation();

      const same =
        view.classList.contains('drug-focus-mode') &&
        button.classList.contains('active');

      if(same){
        clearDrugSelection(false);
      }else{
        selectDrug(button.dataset.drug);
      }
    });

    document.addEventListener('keydown', event => {
      if(
        event.key === 'Escape' &&
        view.classList.contains('drug-focus-mode')
      ){
        clearDrugSelection(false);
      }
    });

    /*
      Si se vuelve a entrar a Drogas desde el menú, conserva una pantalla
      estable aunque antes se haya cambiado de sección durante una animación.
    */
    document.querySelectorAll('[data-view="drugs"],[data-go="drugs"]')
      .forEach(button => {
        button.addEventListener('click', () => {
          window.setTimeout(() => {
            view.classList.remove('drug-returning');
          }, 0);
        });
      });

    clearDrugSelection(true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initDrugSelector, {once:true});
  }else{
    initDrugSelector();
  }
})();