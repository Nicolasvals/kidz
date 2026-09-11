(function(){
  function initIndependentCraftSidebar(){
    const grid = document.getElementById('craftsGrid');
    const sidebar = document.getElementById('liveCraftSidebar');
    const items = document.getElementById('liveCraftItems');
    const totals = document.getElementById('liveCraftTotals');
    const closeBtn = document.getElementById('closeLiveSidebar');
    const clearBtn = document.getElementById('clearLiveCrafts');

    if(!grid || !sidebar || !items || !totals) return;
    if(grid.dataset.independentSidebarReady === '1') return;
    grid.dataset.independentSidebarReady = '1';

    const selection = new Map();

    function num(v){
      const n = Number(String(v ?? '').replace(',','.').trim());
      return Number.isFinite(n) ? n : 0;
    }

    function clean(v){
      return String(v ?? '').trim();
    }

    function readCraft(button){
      const card = button.closest('.craft-workbench');
      if(!card) return null;

      const id =
        button.dataset.craftAdd ||
        card.dataset.craftId ||
        clean(card.querySelector('h3')?.textContent);

      const name = clean(card.querySelector('.craft-workbench-heading h3')?.textContent)
        || clean(card.querySelector('h3')?.textContent)
        || 'Crafteo';

      const qtyInput =
        card.querySelector(`[data-craft-qty="${CSS.escape(id)}"]`) ||
        card.querySelector('input[type="number"]');

      const craftQty = Math.max(1, num(qtyInput?.value) || 1);

      const materials = [...card.querySelectorAll('.craft-blueprint-row')].map(row => {
        const matName = clean(row.querySelector('span')?.textContent);
        const matQty = num(row.querySelector('b')?.textContent);
        return {name:matName, qty:matQty};
      }).filter(m => m.name && m.qty > 0);

      return {id,name,qty:craftQty,materials};
    }

    function openSidebar(){
      sidebar.classList.add('open');
      sidebar.setAttribute('aria-hidden','false');

      sidebar.style.setProperty('display','flex','important');
      sidebar.style.setProperty('visibility','visible','important');
      sidebar.style.setProperty('opacity','1','important');
      sidebar.style.setProperty('position','fixed','important');
      sidebar.style.setProperty('top','0','important');
      sidebar.style.setProperty('right','0','important');
      sidebar.style.setProperty('left','auto','important');
      sidebar.style.setProperty('width','min(330px, 92vw)','important');
      sidebar.style.setProperty('height','100vh','important');
      sidebar.style.setProperty('transform','translate3d(0,0,0)','important');
      sidebar.style.setProperty('pointer-events','auto','important');
      sidebar.style.setProperty('z-index','2147483000','important');

      document.body.classList.add('live-sidebar-open');
    }

    function closeSidebar(){
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden','true');

      sidebar.style.setProperty('transform','translate3d(105%,0,0)','important');
      sidebar.style.setProperty('pointer-events','none','important');

      document.body.classList.remove('live-sidebar-open');
    }

    function render(){
      if(!selection.size){
        items.innerHTML = '<div class="live-empty">Todavía no añadiste ningún crafteo.</div>';
        totals.innerHTML = '<div class="live-empty">Sin materiales calculados.</div>';
        return;
      }

      items.innerHTML = [...selection.values()].map(c => `
        <div class="live-item independent-live-item" data-sidebar-craft="${c.id}">
          <strong>${escapeHtml(c.name)}</strong>
          <input type="number" min="1" step="1" value="${c.qty}" data-sidebar-qty="${c.id}">
          <button type="button" data-sidebar-remove="${c.id}">×</button>
        </div>
      `).join('');

      const totalMap = new Map();

      selection.forEach(c => {
        c.materials.forEach(m => {
          const key = m.name.toLocaleLowerCase('es');
          const prev = totalMap.get(key) || {name:m.name, qty:0};
          prev.qty += m.qty * c.qty;
          totalMap.set(key,prev);
        });
      });

      const sorted = [...totalMap.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));

      totals.innerHTML = sorted.length
        ? sorted.map(m => `
            <div class="total-row">
              <span>${escapeHtml(m.name)}</span>
              <b>${Number.isInteger(m.qty) ? m.qty : m.qty.toFixed(2)}</b>
            </div>
          `).join('')
        : '<div class="live-empty">Sin materiales calculados.</div>';
    }

    function escapeHtml(v){
      return String(v)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;');
    }

    /*
      CAPTURE listener:
      intercepta el botón antes de los handlers viejos/inline.
    */
    grid.addEventListener('click', event => {
      const button = event.target.closest('.craft-add-action,[data-craft-add]');
      if(!button) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const craft = readCraft(button);
      if(!craft) return;

      if(selection.has(craft.id)){
        const current = selection.get(craft.id);
        current.qty += craft.qty;
        current.materials = craft.materials;
        current.name = craft.name;
      }else{
        selection.set(craft.id, craft);
      }

      render();
      openSidebar();
    }, true);

    items.addEventListener('input', event => {
      const input = event.target.closest('[data-sidebar-qty]');
      if(!input) return;

      const craft = selection.get(input.dataset.sidebarQty);
      if(!craft) return;

      craft.qty = Math.max(1, num(input.value) || 1);
      render();
    });

    items.addEventListener('click', event => {
      const remove = event.target.closest('[data-sidebar-remove]');
      if(!remove) return;

      selection.delete(remove.dataset.sidebarRemove);
      render();

      if(!selection.size) closeSidebar();
    });

    /*
      Capture para ganarle también a los onclick viejos de cerrar/vaciar.
    */
    closeBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSidebar();
    }, true);

    clearBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      selection.clear();
      render();
      closeSidebar();
    }, true);

    render();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initIndependentCraftSidebar, {once:true});
  }else{
    initIndependentCraftSidebar();
  }
})();