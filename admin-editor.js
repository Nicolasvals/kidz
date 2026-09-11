
(function(){
  const ROB_KEY='kidzRobberiesCMSV1';
  const DRUG_KEY='kidzDrugsCMSV1';
  const MAP_KEY='kidzMapLocationsV3_EMPTY';

  const robberySeeds=[
    {
      id:'rob-badulaque',name:'Badulaque',subtitle:'Ficha del robo dentro de Prodigy RP.',
      items:[],
      blocks:[
        {id:uid(),type:'heading',text:'Cómo se realiza'},
        {id:uid(),type:'text',text:'Espacio para escribir la explicación paso a paso del robo.'},
        {id:uid(),type:'heading',text:'Hackeo / minijuego'},
        {id:uid(),type:'text',text:'Espacio para explicar el hackeo correspondiente.'}
      ]
    },
    {
      id:'rob-licoreria',name:'Licorería',subtitle:'Ficha del robo dentro de Prodigy RP.',
      items:[],blocks:[
        {id:uid(),type:'heading',text:'Cómo se realiza'},
        {id:uid(),type:'text',text:'Espacio para escribir la explicación paso a paso del robo.'},
        {id:uid(),type:'heading',text:'Hackeo / minijuego'},
        {id:uid(),type:'text',text:'Espacio para explicar el hackeo correspondiente.'}
      ]
    },
    {
      id:'rob-pawnshop',name:'Pawnshop',subtitle:'Ficha del robo dentro de Prodigy RP.',
      items:[],blocks:[
        {id:uid(),type:'heading',text:'Cómo se realiza'},
        {id:uid(),type:'text',text:'Espacio para escribir la explicación paso a paso del robo.'},
        {id:uid(),type:'heading',text:'Hackeo / minijuego'},
        {id:uid(),type:'text',text:'Espacio para explicar el hackeo correspondiente.'}
      ]
    }
  ];

  const drugSeeds=[
    {id:'moonshine',name:'Moonshine',category:'DESTILADO',description:'Una rama centrada en conseguir suministros, preparar el equipo y completar lotes dentro del servidor.',steps:['Conseguir suministros','Preparar equipo','Procesar lote','Recoger producto','Ruta'],note:'Proceso provisional para la interfaz.',image:'assets/drugs/moonshine.png'},
    {id:'amapolas',name:'Amapolas',category:'CULTIVO',description:'El recorrido comienza con el cultivo y la recolección y continúa por sus distintas fases dentro del servidor.',steps:['Cultivar','Recolectar','Procesar','Mejorar','Empaquetar'],note:'Flujo de referencia editable desde Admin.',image:'assets/drugs/amapolas.png'},
    {id:'hongos',name:'Hongos',category:'GLOWCAP',description:'Los hongos pasan por distintas estaciones hasta convertirse en Glowcap.',steps:['Plantar','Secar','Grinder','Empty Jar','Encapsular','Ruta'],note:'Secuencia editable desde Admin.',image:'assets/drugs/hongos.png'},
    {id:'marihuana',name:'Marihuana',category:'CULTIVO',description:'Cadena orientada al cultivo, preparación y distribución dentro del rol.',steps:['Cultivar','Recolectar','Secar','Preparar','Empaquetar','Ruta'],note:'Proceso editable desde Admin.',image:'assets/drugs/marihuana.png'}
  ];

  function uid(){ return 'cms-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8); }
  function isAdmin(){ return document.body.classList.contains('role-admin'); }
  function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function load(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      return raw?JSON.parse(raw):structuredClone(fallback);
    }catch(_){ return structuredClone(fallback); }
  }
  function save(key,value){
    try{ localStorage.setItem(key,JSON.stringify(value)); }
    catch(_){ alert('No se pudo guardar. Probablemente el navegador se quedó sin espacio para imágenes.'); }
  }
  function slug(v){return String(v||'item').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||uid();}
  function modal(html,wide=true){
    if(typeof window.showModal==='function'){ window.showModal(html,wide); return; }
    const content=document.getElementById('modalContent');
    const root=document.getElementById('modal');
    if(content&&root){ content.innerHTML=html; root.classList.add('open'); }
  }
  function close(){ if(typeof window.closeModal==='function') window.closeModal(); else document.getElementById('modal')?.classList.remove('open'); }

  async function imageFileToDataURL(file,maxSide=1500,quality=.86){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const image=new Image();
        image.onload=()=>{
          let w=image.width,h=image.height;
          const ratio=Math.min(1,maxSide/Math.max(w,h));
          w=Math.round(w*ratio); h=Math.round(h*ratio);
          const c=document.createElement('canvas'); c.width=w;c.height=h;
          c.getContext('2d').drawImage(image,0,0,w,h);
          resolve(c.toDataURL('image/jpeg',quality));
        };
        image.onerror=reject; image.src=reader.result;
      };
      reader.onerror=reject; reader.readAsDataURL(file);
    });
  }

  let robberies=load(ROB_KEY,robberySeeds);
  let drugs=load(DRUG_KEY,drugSeeds);

  // -------- ROBBERIES --------
  const robSelector=document.getElementById('robberySelector');
  const robDetail=document.getElementById('robberyDetail');
  const robSearch=document.getElementById('robberySearch');
  const robHead=document.getElementById('robberiesMainHead');

  function mediaMarkup(block){
    if(block.type==='image') return `<figure class="cms-inline-image"><img src="${block.src}" alt=""><figcaption>${esc(block.caption||'')}</figcaption></figure>`;
    if(block.type==='video'){
      const url=String(block.url||'').trim();
      const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i);
      if(yt) return `<div class="cms-video-wrap"><iframe src="https://www.youtube.com/embed/${esc(yt[1])}" allowfullscreen loading="lazy"></iframe>${block.caption?`<small>${esc(block.caption)}</small>`:''}</div>`;
      return `<div class="cms-video-wrap"><video controls preload="metadata" src="${esc(url)}"></video>${block.caption?`<small>${esc(block.caption)}</small>`:''}</div>`;
    }
    return '';
  }

  function renderRobberyList(){
    if(!robSelector)return;
    const q=(robSearch?.value||'').trim().toLowerCase();
    const list=robberies.filter(r=>!q || [r.name,r.subtitle,(r.items||[]).join(' '),(r.blocks||[]).map(b=>b.text||b.caption||'').join(' ')].join(' ').toLowerCase().includes(q));
    robSelector.innerHTML=list.map((r,i)=>`
      <div class="robbery-entry-wrap">
        <button class="robbery-entry" type="button" data-cms-robbery="${esc(r.id)}">
          <span class="robbery-entry-index">${String(robberies.indexOf(r)+1).padStart(2,'0')}</span>
          <span class="robbery-entry-main"><strong>${esc(r.name)}</strong><small>${esc(r.subtitle||'Ver información')}</small></span>
          <span class="robbery-entry-arrow">↗</span>
        </button>
        <div class="cms-row-admin admin-only">
          <button type="button" data-edit-robbery="${esc(r.id)}">EDITAR</button>
          <button type="button" data-delete-robbery="${esc(r.id)}">BORRAR</button>
        </div>
      </div>`).join('') || `<div class="cms-empty">No hay robos que coincidan.</div>`;
  }

  function renderRobberyDetail(id){
    const r=robberies.find(x=>x.id===id);
    if(!r||!robDetail)return;
    const idx=robberies.indexOf(r)+1;
    const items=(r.items||[]).filter(Boolean);
    const blocks=(r.blocks||[]);
    robDetail.innerHTML=`
      <article class="robbery-panel active cms-robbery-panel">
        <div class="robbery-panel-title">
          <span>KIDZ // ROBBERY ${String(idx).padStart(2,'0')}</span>
          <button class="robbery-title-back" type="button" id="cmsRobberyBack"><span class="robbery-title-arrow">←</span><span>${esc(r.name)}</span></button>
          ${r.subtitle?`<p>${esc(r.subtitle)}</p>`:''}
          <button class="cms-detail-edit admin-only" type="button" data-edit-robbery="${esc(r.id)}">EDITAR ROBO</button>
        </div>
        <div class="robbery-flow cms-flow">
          <div class="robbery-items-inline">
            <div class="robbery-flow-label">ITEMS NECESARIOS</div>
            <div class="cms-items-display">
              ${items.length?items.map(x=>`<span>${esc(x)}</span>`).join(''):'<em>Sin items cargados.</em>'}
            </div>
          </div>
          <div class="cms-article-stream">
            ${blocks.map(b=>{
              if(b.type==='heading') return `<h4>${esc(b.text||'')}</h4>`;
              if(b.type==='text') return `<p>${esc(b.text||'').replace(/\n/g,'<br>')}</p>`;
              return mediaMarkup(b);
            }).join('')}
          </div>
        </div>
      </article>`;
    robSelector.hidden=true; robSearch?.parentElement && (robSearch.parentElement.hidden=true);
    robHead && (robHead.hidden=true);
    robDetail.hidden=false;
    requestAnimationFrame(()=>robDetail.classList.add('visible'));
    document.getElementById('cmsRobberyBack')?.addEventListener('click',closeRobberyDetail);
    robDetail.querySelectorAll('[data-edit-robbery]').forEach(b=>b.addEventListener('click',()=>openRobberyEditor(b.dataset.editRobbery)));
  }

  function closeRobberyDetail(){
    robDetail?.classList.remove('visible');
    setTimeout(()=>{
      if(robDetail)robDetail.hidden=true;
      if(robSelector)robSelector.hidden=false;
      if(robSearch?.parentElement)robSearch.parentElement.hidden=false;
      if(robHead)robHead.hidden=false;
    },160);
  }

  function blockEditorRow(block,index){
    const label={heading:'TÍTULO',text:'TEXTO',image:'IMAGEN',video:'VIDEO'}[block.type]||block.type;
    let body='';
    if(block.type==='heading') body=`<input class="cms-block-text" value="${esc(block.text||'')}" placeholder="Título del bloque">`;
    if(block.type==='text') body=`<textarea class="cms-block-text" placeholder="Escribí la explicación...">${esc(block.text||'')}</textarea>`;
    if(block.type==='image') body=`<div class="cms-media-preview">${block.src?`<img src="${block.src}">`:'<span>Sin imagen</span>'}</div><input class="cms-block-caption" value="${esc(block.caption||'')}" placeholder="Pie de imagen (opcional)"><button type="button" class="cms-pick-image">CAMBIAR IMAGEN</button><input type="file" accept="image/*" class="cms-hidden-file" hidden>`;
    if(block.type==='video') body=`<input class="cms-block-url" value="${esc(block.url||'')}" placeholder="URL de YouTube o video"><input class="cms-block-caption" value="${esc(block.caption||'')}" placeholder="Texto opcional">`;
    return `<div class="cms-editor-block" data-block-id="${esc(block.id)}" data-type="${esc(block.type)}">
      <div class="cms-editor-block-head"><span>${label}</span><div><button type="button" data-up>↑</button><button type="button" data-down>↓</button><button type="button" data-remove>×</button></div></div>
      ${body}
    </div>`;
  }

  function openRobberyEditor(id=null){
    if(!isAdmin())return;
    const existing=robberies.find(r=>r.id===id);
    const draft=structuredClone(existing||{id:uid(),name:'',subtitle:'',items:[],blocks:[{id:uid(),type:'heading',text:'Cómo se realiza'},{id:uid(),type:'text',text:''}]});
    modal(`
      <div class="cms-editor-title"><span>KIDZ // ADMIN EDITOR</span><h2>${existing?'Editar robo':'Nuevo robo'}</h2><p>Armá la guía en el mismo orden en que querés verla publicada.</p></div>
      <div class="cms-form-grid">
        <label><span>NOMBRE</span><input id="cmsRobName" value="${esc(draft.name)}"></label>
        <label><span>SUBTÍTULO</span><input id="cmsRobSubtitle" value="${esc(draft.subtitle||'')}"></label>
        <label class="cms-full"><span>ITEMS NECESARIOS</span><textarea id="cmsRobItems" placeholder="Uno por línea">${esc((draft.items||[]).join('\n'))}</textarea></label>
      </div>
      <div class="cms-editor-section-head"><div><span>CONTENIDO</span><b>Texto, imágenes y videos en el orden que quieras.</b></div>
        <div class="cms-add-blocks">
          <button type="button" data-add-block="heading">+ TÍTULO</button>
          <button type="button" data-add-block="text">+ TEXTO</button>
          <button type="button" data-add-block="image">+ IMAGEN</button>
          <button type="button" data-add-block="video">+ VIDEO</button>
        </div>
      </div>
      <div id="cmsBlocksEditor" class="cms-blocks-editor"></div>
      <div class="cms-form-actions"><button type="button" class="ghost-btn" id="cmsCancelRobbery">Cancelar</button><button type="button" class="primary-btn" id="cmsSaveRobbery">Guardar robo</button></div>
    `,true);
    const editor=document.getElementById('cmsBlocksEditor');

    function readCurrent(){
      [...editor.querySelectorAll('.cms-editor-block')].forEach(row=>{
        const b=draft.blocks.find(x=>x.id===row.dataset.blockId); if(!b)return;
        if(b.type==='heading'||b.type==='text')b.text=row.querySelector('.cms-block-text')?.value||'';
        if(b.type==='image')b.caption=row.querySelector('.cms-block-caption')?.value||'';
        if(b.type==='video'){b.url=row.querySelector('.cms-block-url')?.value||'';b.caption=row.querySelector('.cms-block-caption')?.value||'';}
      });
    }
    function renderBlocks(){
      editor.innerHTML=draft.blocks.map(blockEditorRow).join('');
      editor.querySelectorAll('.cms-editor-block').forEach(row=>{
        row.querySelector('[data-remove]')?.addEventListener('click',()=>{readCurrent();draft.blocks=draft.blocks.filter(b=>b.id!==row.dataset.blockId);renderBlocks();});
        row.querySelector('[data-up]')?.addEventListener('click',()=>{readCurrent();const i=draft.blocks.findIndex(b=>b.id===row.dataset.blockId);if(i>0){[draft.blocks[i-1],draft.blocks[i]]=[draft.blocks[i],draft.blocks[i-1]];renderBlocks();}});
        row.querySelector('[data-down]')?.addEventListener('click',()=>{readCurrent();const i=draft.blocks.findIndex(b=>b.id===row.dataset.blockId);if(i<draft.blocks.length-1){[draft.blocks[i+1],draft.blocks[i]]=[draft.blocks[i],draft.blocks[i+1]];renderBlocks();}});
        const pick=row.querySelector('.cms-pick-image'),input=row.querySelector('.cms-hidden-file');
        pick?.addEventListener('click',()=>input.click());
        input?.addEventListener('change',async()=>{const f=input.files?.[0];if(!f)return;const b=draft.blocks.find(x=>x.id===row.dataset.blockId);b.src=await imageFileToDataURL(f);renderBlocks();});
      });
    }
    renderBlocks();
    document.querySelectorAll('[data-add-block]').forEach(btn=>btn.addEventListener('click',()=>{
      readCurrent();
      const t=btn.dataset.addBlock;
      const b={id:uid(),type:t};
      if(t==='heading'||t==='text')b.text='';
      if(t==='image'){b.src='';b.caption='';}
      if(t==='video'){b.url='';b.caption='';}
      draft.blocks.push(b);renderBlocks();
      editor.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});
    }));
    document.getElementById('cmsCancelRobbery')?.addEventListener('click',close);
    document.getElementById('cmsSaveRobbery')?.addEventListener('click',()=>{
      readCurrent();
      draft.name=document.getElementById('cmsRobName').value.trim()||'Sin nombre';
      draft.subtitle=document.getElementById('cmsRobSubtitle').value.trim();
      draft.items=document.getElementById('cmsRobItems').value.split('\n').map(x=>x.trim()).filter(Boolean);
      const i=robberies.findIndex(r=>r.id===draft.id);
      if(i>=0)robberies[i]=draft; else robberies.push(draft);
      save(ROB_KEY,robberies);renderRobberyList();close();
      if(existing) renderRobberyDetail(draft.id);
    });
  }

  robSelector?.addEventListener('click',e=>{
    const open=e.target.closest('[data-cms-robbery]'); if(open){renderRobberyDetail(open.dataset.cmsRobbery);return;}
    const edit=e.target.closest('[data-edit-robbery]'); if(edit&&isAdmin()){e.stopPropagation();openRobberyEditor(edit.dataset.editRobbery);return;}
    const del=e.target.closest('[data-delete-robbery]'); if(del&&isAdmin()){e.stopPropagation();const r=robberies.find(x=>x.id===del.dataset.deleteRobbery);if(r&&confirm(`¿Borrar "${r.name}"?`)){robberies=robberies.filter(x=>x.id!==r.id);save(ROB_KEY,robberies);renderRobberyList();}}
  });
  robSearch?.addEventListener('input',renderRobberyList);
  document.getElementById('cmsAddRobberyBtn')?.addEventListener('click',()=>openRobberyEditor());

  // -------- DRUGS --------
  const drugSelector=document.getElementById('drugSelector');
  const drugShell=document.getElementById('drugDetailShell');

  function renderDrugsCMS(){
    if(!drugSelector||!drugShell)return;
    drugSelector.innerHTML=drugs.map(d=>`
      <div class="cms-drug-choice-wrap">
        <button class="drug-choice" type="button" data-drug="${esc(d.id)}" aria-label="Abrir ${esc(d.name)}">
          <span class="drug-choice-glow"></span>
          ${d.image?`<img src="${d.image}" alt="${esc(d.name)}">`:'<div class="cms-drug-placeholder">+</div>'}
          <span class="drug-choice-name">${esc(d.name)}</span>
        </button>

      </div>`).join('');

    drugShell.innerHTML=drugs.map(d=>`
      <article class="drug-detail" data-drug-panel="${esc(d.id)}">
        <div class="drug-detail-head"><div><small>${esc(d.category||'INFO')}</small><h3>${esc(d.name)}</h3></div><button type="button" class="cms-detail-edit admin-only" data-edit-drug="${esc(d.id)}">EDITAR</button></div>
        <p>${esc(d.description||'')}</p>
        ${(d.steps||[]).length?`<div class="drug-process">${d.steps.map((s,i)=>`<span>${esc(s)}</span>${i<d.steps.length-1?'<i>→</i>':''}`).join('')}</div>`:''}
        ${d.note?`<div class="drug-note">${esc(d.note)}</div>`:''}
      </article>`).join('');
  }

  function openDrugEditor(id=null){
    if(!isAdmin())return;
    const existing=drugs.find(d=>d.id===id);
    const draft=structuredClone(existing||{id:uid(),name:'',category:'INFO',description:'',steps:[],note:'',image:''});
    modal(`
      <div class="cms-editor-title"><span>KIDZ // ADMIN EDITOR</span><h2>${existing?'Editar droga':'Nueva droga'}</h2><p>La estética pública se mantiene automáticamente.</p></div>
      <div class="cms-form-grid">
        <label><span>NOMBRE</span><input id="cmsDrugName" value="${esc(draft.name)}"></label>
        <label><span>CATEGORÍA</span><input id="cmsDrugCategory" value="${esc(draft.category||'')}"></label>
        <label class="cms-full"><span>DESCRIPCIÓN</span><textarea id="cmsDrugDescription">${esc(draft.description||'')}</textarea></label>
        <label class="cms-full"><span>PROCESO</span><textarea id="cmsDrugSteps" placeholder="Un paso por línea">${esc((draft.steps||[]).join('\n'))}</textarea></label>
        <label class="cms-full"><span>NOTA FINAL</span><textarea id="cmsDrugNote">${esc(draft.note||'')}</textarea></label>
      </div>
      <div class="cms-form-actions"><button class="ghost-btn" id="cmsCancelDrug" type="button">Cancelar</button><button class="primary-btn" id="cmsSaveDrug" type="button">Guardar</button></div>`,true);
    document.getElementById('cmsCancelDrug').onclick=close;
    document.getElementById('cmsSaveDrug').onclick=()=>{
      draft.name=document.getElementById('cmsDrugName').value.trim()||'Sin nombre';
      draft.category=document.getElementById('cmsDrugCategory').value.trim();
      draft.description=document.getElementById('cmsDrugDescription').value;
      draft.steps=document.getElementById('cmsDrugSteps').value.split('\n').map(x=>x.trim()).filter(Boolean);
      draft.note=document.getElementById('cmsDrugNote').value;
      // La imagen es fija por código y nunca se modifica desde Admin.
      if(!existing) draft.id=slug(draft.name)+'-'+Date.now().toString(36);
      const i=drugs.findIndex(d=>d.id===draft.id); if(i>=0)drugs[i]=draft;else drugs.push(draft);
      save(DRUG_KEY,drugs);renderDrugsCMS();close();
    };
  }

  document.addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit-drug]');
    if(edit&&isAdmin()){e.preventDefault();e.stopPropagation();openDrugEditor(edit.dataset.editDrug);return;}
  });

  // -------- LOCATIONS ADMIN --------
  function getMapLocations(){return load(MAP_KEY,{});}
  function saveMapLocations(v){save(MAP_KEY,v);window.dispatchEvent(new CustomEvent('kidz-map-refresh'));}

  function openLocationsManager(){
    if(!isAdmin())return;
    const locs=getMapLocations();
    modal(`<div class="cms-editor-title"><span>KIDZ // ADMIN</span><h2>Ubicaciones</h2><p>Creá nuevas ubicaciones desde el mapa. Desde acá podés renombrarlas, describirlas o borrarlas.</p></div>
      <div class="cms-manager-list">${Object.entries(locs).map(([name,l])=>`
        <div class="cms-manager-row" data-loc="${esc(name)}"><div><strong>${esc(name)}</strong><small>${esc(l.description||'Sin descripción')}</small></div><div><button data-loc-edit>EDITAR</button><button data-loc-delete>BORRAR</button></div></div>`).join('')||'<div class="cms-empty">No hay ubicaciones creadas.</div>'}</div>
      <div class="cms-form-actions"><button class="primary-btn" id="cmsGoMap" type="button">Ir al mapa</button></div>`,true);
    document.querySelectorAll('.cms-manager-row').forEach(row=>{
      row.querySelector('[data-loc-edit]')?.addEventListener('click',()=>{
        const old=row.dataset.loc, all=getMapLocations(), l=all[old]; if(!l)return;
        const name=prompt('Nombre:',old); if(name===null)return;
        const clean=name.trim(); if(!clean)return;
        const desc=prompt('Descripción:',l.description||''); if(desc===null)return;
        if(clean!==old)delete all[old];
        all[clean]={...l,description:desc.trim()};saveMapLocations(all);openLocationsManager();
      });
      row.querySelector('[data-loc-delete]')?.addEventListener('click',()=>{
        const all=getMapLocations(),name=row.dataset.loc;if(confirm(`¿Borrar "${name}"?`)){delete all[name];saveMapLocations(all);openLocationsManager();}
      });
    });
    document.getElementById('cmsGoMap')?.addEventListener('click',()=>{close();document.querySelector('[data-view="locations"]')?.click();});
  }

  // -------- CENTRAL ADMIN PANEL --------
  function openAdminPanel(){
    if(!isAdmin())return;
    const locCount=Object.keys(getMapLocations()).length;
    modal(`<div class="cms-admin-panel-head"><span>KIDZ // CONTROL PANEL</span><h2>Administrar base</h2><p>Todo lo editable queda oculto para OG y visible únicamente desde Admin.</p></div>
      <div class="cms-admin-grid">
        <button class="cms-admin-card" data-admin-go="robberies"><span>01</span><strong>ROBOS</strong><small>${robberies.length} cargados · texto, items, imágenes y videos</small></button>
        <button class="cms-admin-card" data-admin-go="drugs"><span>02</span><strong>DROGAS</strong><small>${drugs.length} cargadas · imagen, proceso e información</small></button>
        <button class="cms-admin-card" data-admin-go="crafts"><span>03</span><strong>CRAFTEOS</strong><small>Agregar, editar, borrar, imágenes y materiales</small></button>
        <button class="cms-admin-card" data-admin-go="locations"><span>04</span><strong>UBICACIONES</strong><small>${locCount} puntos · crear, renombrar y borrar</small></button>
        <button class="cms-admin-card" data-admin-go="members"><span>05</span><strong>MIEMBROS</strong><small>Miembros y biblioteca de fotos</small></button>
      </div>`,true);
    document.querySelectorAll('[data-admin-go]').forEach(b=>b.addEventListener('click',()=>{
      const dest=b.dataset.adminGo;
      close();
      if(dest==='locations'){openLocationsManager();return;}
      document.querySelector(`[data-view="${dest}"]`)?.click();
      if(dest==='crafts') setTimeout(()=>document.getElementById('addCraftBtn')?.classList.add('cms-pulse'),100);
      if(dest==='members') setTimeout(()=>document.getElementById('addMemberBtn')?.classList.add('cms-pulse'),100);
    }));
  }
  document.getElementById('openAdminPanelBtn')?.addEventListener('click',openAdminPanel);

  // Global edit shortcuts for craft cards already produced by app.js.
  // Keep admin-only controls hidden in OG via existing role logic.
  renderRobberyList();
  renderDrugsCMS();

  // Re-render CMS admin controls when role changes.
  new MutationObserver(()=>{renderRobberyList();renderDrugsCMS();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
