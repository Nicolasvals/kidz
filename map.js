(function(){
  function initKidzMap(){
    const shell = document.getElementById('gtaMapShell');
    const stage = document.getElementById('gtaMapStage');
    const image = document.getElementById('gtaMapImage');
    const markerLayer = document.getElementById('mapMarkersLayer');

    if(!shell || !stage || !markerLayer || shell.dataset.mapReady === 'admin-locations') return;
    shell.dataset.mapReady = 'admin-locations';

    const STORAGE_KEY = 'kidzMapLocationsV3_EMPTY';

    const DEFAULT_LOCATIONS = {};

    const list = document.getElementById('mapLocationList');
    const search = document.getElementById('mapSearchInput');
    const results = document.getElementById('mapSearchResults');
    const zoomIn = document.getElementById('mapZoomIn');
    const zoomOut = document.getElementById('mapZoomOut');
    const resetBtn = document.getElementById('mapReset');
    const zoomReadout = document.getElementById('mapZoomReadout');
    const addBtn = document.getElementById('mapAddLocationBtn');

    let locations = loadLocations();

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let moved = false;
    let placing = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    const MIN_SCALE = 1;
    const MAX_SCALE = 12;
    const WHEEL_FACTOR = 1.16;

    const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

    function isAdmin(){
      return document.body.classList.contains('role-admin');
    }

    function loadLocations(){
      try{
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved){
          const parsed = JSON.parse(saved);
          if(parsed && typeof parsed === 'object') return parsed;
        }
      }catch(_){}
      return JSON.parse(JSON.stringify(DEFAULT_LOCATIONS));
    }

    function saveLocations(){
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
      }catch(_){}
    }

    function updateReadout(){
      if(zoomReadout) zoomReadout.textContent = `${Math.round(scale * 100)}%`;
    }

    function apply(animated=false){
      stage.style.transition = animated
        ? 'transform 420ms cubic-bezier(.2,.8,.2,1)'
        : 'none';

      stage.style.transform =
        `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;

      updateReadout();

      if(animated){
        window.setTimeout(() => {
          stage.style.transition = 'none';
        }, 440);
      }
    }

    function zoomAt(clientX, clientY, nextScale, animated=false){
      const rect = shell.getBoundingClientRect();
      const oldScale = scale;
      nextScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

      if(Math.abs(nextScale - oldScale) < 0.0001) return;

      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      const ratio = nextScale / oldScale;

      tx = px - (px - tx) * ratio;
      ty = py - (py - ty) * ratio;
      scale = nextScale;

      if(scale === MIN_SCALE){
        tx = 0;
        ty = 0;
      }

      apply(animated);
    }

    function centerZoom(multiplier){
      const r = shell.getBoundingClientRect();
      zoomAt(
        r.left + r.width / 2,
        r.top + r.height / 2,
        scale * multiplier,
        true
      );
    }

    function reset(){
      scale = 1;
      tx = 0;
      ty = 0;
      cancelPlacement();

      markerLayer.querySelectorAll('.gta-map-marker')
        .forEach(m => m.classList.remove('active'));

      list?.querySelectorAll('.map-location-item')
        .forEach(b => b.classList.remove('active'));

      apply(true);
    }

    function focusLocation(name){
      const loc = locations[name];
      if(!loc) return;

      scale = 5.5;

      const r = shell.getBoundingClientRect();

      tx = ((50 - loc.x) / 100) * r.width * scale;
      ty = ((50 - loc.y) / 100) * r.height * scale;

      markerLayer.querySelectorAll('.gta-map-marker')
        .forEach(m => m.classList.toggle('active', m.dataset.location === name));

      list?.querySelectorAll('.map-location-item')
        .forEach(b => b.classList.toggle('active', b.dataset.name === name));

      if(search) search.value = name;
      results?.classList.remove('visible');

      apply(true);
    }

    function esc(value){
      return String(value)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;');
    }

    function renderMarkers(){
      markerLayer.innerHTML = Object.entries(locations).map(([name,loc]) => `
        <button
          type="button"
          class="gta-map-marker"
          data-location="${esc(name)}"
          aria-label="${esc(name)}"
          style="--x:${Number(loc.x)}%;--y:${Number(loc.y)}%;"
        ><span></span></button>
      `).join('');
    }

    function renderList(){
      if(!list) return;

      list.innerHTML = Object.keys(locations).map(name => `
        <div class="map-location-row">
          <button type="button" class="map-location-item" data-name="${esc(name)}">${esc(name)}</button>
          <button type="button" class="map-location-delete" data-delete="${esc(name)}" aria-label="Borrar ${esc(name)}">×</button>
        </div>
      `).join('');
    }

    function renderAll(){
      renderMarkers();
      renderList();
    }

    markerLayer.addEventListener('click', e => {
      const marker = e.target.closest('.gta-map-marker');
      if(!marker) return;
      e.preventDefault();
      e.stopPropagation();
      focusLocation(marker.dataset.location);
    });

    list?.addEventListener('click', e => {
      const del = e.target.closest('[data-delete]');
      if(del){
        e.preventDefault();
        e.stopPropagation();

        if(!isAdmin()) return;

        const name = del.dataset.delete;
        if(!locations[name]) return;

        if(confirm(`¿Borrar "${name}"?`)){
          delete locations[name];
          saveLocations();
          renderAll();

          if(search && search.value === name) search.value = '';
        }
        return;
      }

      const button = e.target.closest('.map-location-item');
      if(button) focusLocation(button.dataset.name);
    });

    function startPlacement(){
      if(!isAdmin()) return;

      placing = !placing;
      shell.classList.toggle('map-placing', placing);
      addBtn?.classList.toggle('active', placing);

      if(addBtn){
        addBtn.textContent = placing
          ? '× CANCELAR'
          : '+ NUEVA UBICACIÓN';
      }
    }

    function cancelPlacement(){
      placing = false;
      shell.classList.remove('map-placing');
      addBtn?.classList.remove('active');
      if(addBtn) addBtn.textContent = '+ NUEVA UBICACIÓN';
    }

    addBtn?.addEventListener('click', e => {
      e.preventDefault();
      startPlacement();
    });

    /*
      Convierte el click actual en coordenadas X/Y del stage transformado.
      Esto permite crear ubicaciones incluso estando muy acercado.
    */
    function createLocationAt(clientX, clientY){
      if(!placing || !isAdmin()) return false;

      const rect = stage.getBoundingClientRect();

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      if(x < 0 || x > 100 || y < 0 || y > 100) return false;

      let name = prompt('Nombre de la nueva ubicación:');
      if(name === null) return true;

      name = name.trim();
      if(!name) return true;

      if(locations[name]){
        alert('Ya existe una ubicación con ese nombre.');
        return true;
      }

      const description = prompt('Descripción opcional de la ubicación:', '') ?? '';
      locations[name] = {
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
        description: description.trim()
      };

      saveLocations();
      renderAll();
      cancelPlacement();
      focusLocation(name);

      return true;
    }

    shell.addEventListener('wheel', e => {
      e.preventDefault();
      e.stopPropagation();

      const next = e.deltaY < 0
        ? scale * WHEEL_FACTOR
        : scale / WHEEL_FACTOR;

      zoomAt(e.clientX, e.clientY, next, false);
    }, {passive:false});

    shell.addEventListener('pointerdown', e => {
      if(e.button !== 0) return;

      if(
        e.target.closest('.map-image-controls') ||
        e.target.closest('.gta-map-marker')
      ) return;

      if(placing){
        e.preventDefault();
        return;
      }

      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      originX = tx;
      originY = ty;

      shell.classList.add('dragging');

      try{ shell.setPointerCapture(e.pointerId); }catch(_){}

      e.preventDefault();
    });

    shell.addEventListener('pointermove', e => {
      if(!dragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if(Math.abs(dx) + Math.abs(dy) > 3) moved = true;

      tx = originX + dx;
      ty = originY + dy;

      apply(false);
      e.preventDefault();
    });

    function endDrag(e){
      if(!dragging) return;

      dragging = false;
      shell.classList.remove('dragging');

      try{ shell.releasePointerCapture(e.pointerId); }catch(_){}
    }

    shell.addEventListener('pointerup', endDrag);
    shell.addEventListener('pointercancel', endDrag);

    shell.addEventListener('click', e => {
      if(
        e.target.closest('.map-image-controls') ||
        e.target.closest('.gta-map-marker')
      ) return;

      if(placing){
        e.preventDefault();
        e.stopPropagation();
        createLocationAt(e.clientX, e.clientY);
      }
    });

    shell.addEventListener('dblclick', e => {
      if(
        placing ||
        e.target.closest('.map-image-controls') ||
        e.target.closest('.gta-map-marker')
      ) return;

      e.preventDefault();
      zoomAt(e.clientX, e.clientY, scale * 1.75, true);
    });

    zoomIn?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      centerZoom(1.45);
    });

    zoomOut?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      centerZoom(1 / 1.45);
    });

    resetBtn?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      reset();
    });

    function renderSearch(){
      if(!search || !results) return;

      const q = search.value.trim().toLowerCase();

      if(!q){
        results.innerHTML = '';
        results.classList.remove('visible');
        return;
      }

      const found = Object.keys(locations)
        .filter(name => name.toLowerCase().includes(q));

      results.innerHTML = found
        .map(name =>
          `<button class="map-search-result" type="button" data-map-result="${esc(name)}">${esc(name)}</button>`
        )
        .join('');

      results.classList.toggle('visible', found.length > 0);
    }

    search?.addEventListener('input', renderSearch);

    results?.addEventListener('click', e => {
      const button = e.target.closest('[data-map-result]');
      if(button) focusLocation(button.dataset.mapResult);
    });

    search?.addEventListener('keydown', e => {
      if(e.key !== 'Enter') return;

      const q = search.value.trim().toLowerCase();

      const found =
        Object.keys(locations).find(name => name.toLowerCase() === q) ||
        Object.keys(locations).find(name => name.toLowerCase().includes(q));

      if(found) focusLocation(found);
    });

    image?.addEventListener('dragstart', e => e.preventDefault());

    /*
      Si cambia Admin/OG, se actualiza el modo edición sin recargar.
    */
    const roleObserver = new MutationObserver(() => {
      if(!isAdmin()) cancelPlacement();
    });

    roleObserver.observe(document.body, {
      attributes:true,
      attributeFilter:['class']
    });

    window.addEventListener('kidz-map-refresh', () => {
      locations = loadLocations();
      renderAll();
      renderSearch();
    });

    renderAll();
    apply(false);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initKidzMap, {once:true});
  }else{
    initKidzMap();
  }
})();