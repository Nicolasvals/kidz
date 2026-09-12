(function(){
  function initMedia(){
    const grid=document.getElementById('mediaGrid');
    const addGroupBtn=document.getElementById('addMediaGroupBtn');
    const addImageBtn=document.getElementById('addMediaImageBtn');
    const addVideoBtn=document.getElementById('addMediaVideoBtn');
    const legacyImageInput=document.getElementById('mediaImageInput');

    const modal=document.getElementById('mediaUploadModal');
    const modalTitle=document.getElementById('mediaUploadTitle');
    const modalFile=document.getElementById('mediaModalFile');
    const modalPreview=document.getElementById('mediaModalPreview');
    const dropzone=document.getElementById('mediaDropzone');
    const imageArea=document.getElementById('mediaUploadImageArea');
    const videoArea=document.getElementById('mediaUploadVideoArea');
    const videoUrl=document.getElementById('mediaModalVideoUrl');
    const captionInput=document.getElementById('mediaModalCaption');
    const groupSelect=document.getElementById('mediaModalGroup');
    const newGroupWrap=document.getElementById('mediaNewGroupWrap');
    const newGroupInput=document.getElementById('mediaModalNewGroup');
    const modalSave=document.getElementById('mediaModalSave');
    const modalStatus=document.getElementById('mediaModalStatus');

    const viewer=document.getElementById('mediaViewer');
    const viewerImage=document.getElementById('mediaViewerImage');
    const viewerCaption=document.getElementById('mediaViewerCaption');
    const viewerGroup=document.getElementById('mediaViewerGroup');
    const viewerDownload=document.getElementById('mediaViewerDownload');

    if(!grid||grid.dataset.mediaReady==='1') return;
    grid.dataset.mediaReady='1';

    const API_URL='https://zlxcfpwmnksceagbcarl.supabase.co/functions/v1/kidz-members';
    const CACHE_ITEMS='kidzMediaBackendCacheV2';
    const CACHE_GROUPS='kidzMediaGroupsCacheV1';

    let items=readCache(CACHE_ITEMS);
    let groups=readCache(CACHE_GROUPS);
    let modalMode='image';
    let selectedFile=null;

    function isAdmin(){
      return !!window.KidzAuth?.isAdmin?.()||document.body.classList.contains('role-admin');
    }
    function isOG(){
      return !!window.KidzAuth?.isOG?.()||document.body.classList.contains('role-og');
    }
    function canUploadMedia(){return isAdmin()||isOG()}
    function adminPassword(){return window.KidzAuth?.getAdminPassword?.()||''}
    function esc(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
    function uid(prefix='media'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
    function readCache(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}}
    function writeCache(){try{localStorage.setItem(CACHE_ITEMS,JSON.stringify(items));localStorage.setItem(CACHE_GROUPS,JSON.stringify(groups))}catch(_){}}

    async function apiGet(resource){
      const r=await fetch(`${API_URL}?resource=${encodeURIComponent(resource)}`,{headers:{Accept:'application/json'}});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok) throw new Error(j.error||'No se pudo cargar multimedia.');
      return Array.isArray(j.items)?j.items:[];
    }

    async function apiWrite(resource,action,payload={}){
      if(resource==='gallery'&&action==='upsert'){
        if(!canUploadMedia()) throw new Error('No tenés permisos para subir contenido.');
      }else if(resource==='media_groups'&&action==='upsert'){
        if(!canUploadMedia()) throw new Error('No tenés permisos para crear grupos.');
      }else{
        if(!isAdmin()) throw new Error('Esta acción está disponible solo para Admin.');
      }

      const password=isAdmin()?adminPassword():'';
      if(isAdmin()&&!password) throw new Error('Volvé a ingresar al modo Admin para guardar cambios.');

      const r=await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({resource,action,password,...payload})
      });
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok) throw new Error(j.error||'No se pudo guardar.');
      return j;
    }

    async function imageToDataURL(file,maxSide=1800,quality=.88){
      return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>{
          const img=new Image();
          img.onload=()=>{
            let w=img.width,h=img.height;
            const scale=Math.min(1,maxSide/Math.max(w,h));
            w=Math.round(w*scale);h=Math.round(h*scale);
            const c=document.createElement('canvas');c.width=w;c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            resolve(file.type==='image/png'?c.toDataURL('image/png'):c.toDataURL('image/webp',quality));
          };
          img.onerror=reject;img.src=reader.result;
        };
        reader.onerror=reject;reader.readAsDataURL(file);
      });
    }

    function normalizeVideo(url){
      url=(url||'').trim();
      const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      if(yt)return{kind:'embed',src:`https://www.youtube.com/embed/${yt[1]}`};
      const vm=url.match(/vimeo\.com\/(\d+)/);
      if(vm)return{kind:'embed',src:`https://player.vimeo.com/video/${vm[1]}`};
      return{kind:'video',src:url};
    }

    function groupTypeLabel(type){return type==='video'?'VIDEOS':type==='image'?'IMÁGENES':'MIXTO'}
    function groupName(id){return groups.find(g=>g.id===id)?.name||'General'}

    function mediaCard(it,index){
      const type=it.media_type||'image';
      let visual='';
      if(type==='video'){
        const v=normalizeVideo(it.src||'');
        visual=v.kind==='embed'
          ? `<iframe src="${esc(v.src)}" title="${esc(it.caption||'Video Kidz')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
          : `<video controls preload="metadata" src="${esc(v.src)}"></video>`;
      }else{
        visual=`<img src="${it.src}" alt="${esc(it.caption||'Imagen Kidz')}" loading="lazy">`;
      }

      return `
        <article class="media-card ${type==='video'?'is-video':'is-image'}" data-media-id="${esc(it.id)}">
          <div class="media-index">${String(index+1).padStart(2,'0')}</div>
          <div class="media-visual" ${type==='image'?`data-open-image="${esc(it.id)}"`:''}>${visual}</div>
          <div class="media-caption">
            <span>${esc(it.caption||(type==='video'?'VIDEO':'IMAGEN'))}</span>
            ${isAdmin()?`<button class="media-delete" type="button" data-delete-media="${esc(it.id)}">BORRAR</button>`:''}
          </div>
        </article>`;
    }

    function render(){
      const orderedGroups=[...groups].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
      const groupHtml=orderedGroups.map(g=>{
        const children=items.filter(it=>(it.group_id||'')===g.id);
        return `
          <section class="media-group" data-group-id="${esc(g.id)}">
            <div class="media-group-head">
              <div>
                <span class="media-group-kicker">${groupTypeLabel(g.group_type)}</span>
                <h2>${esc(g.name)}</h2>
                ${g.description?`<p>${esc(g.description)}</p>`:''}
              </div>
              ${isAdmin()?`
                <div class="media-group-actions">
                  <button type="button" data-add-image-group="${esc(g.id)}">+ IMAGEN</button>
                  <button type="button" data-add-video-group="${esc(g.id)}">+ VIDEO</button>
                  <button type="button" data-edit-group="${esc(g.id)}">EDITAR</button>
                  <button type="button" data-delete-group="${esc(g.id)}">BORRAR GRUPO</button>
                </div>`:''}
            </div>
            <div class="media-group-grid">
              ${children.length?children.map((it,i)=>mediaCard(it,i)).join(''):`<div class="media-group-empty">Todavía no hay contenido en este grupo.</div>`}
            </div>
          </section>`;
      }).join('');

      const loose=items.filter(it=>!it.group_id);
      const looseHtml=loose.length?`
        <section class="media-group media-group-ungrouped">
          <div class="media-group-head"><div><span class="media-group-kicker">ARCHIVO</span><h2>General</h2></div></div>
          <div class="media-group-grid">${loose.map((it,i)=>mediaCard(it,i)).join('')}</div>
        </section>`:'';

      if(!orderedGroups.length&&!loose.length){
        grid.innerHTML=`<div class="media-empty"><span>KIDZ // VISUAL ARCHIVE</span><strong>Todavía no hay imágenes ni videos.</strong><small>${canUploadMedia()?'Usá los botones superiores para cargar contenido.':''}</small></div>`;
        return;
      }
      grid.innerHTML=groupHtml+looseHtml;
    }

    async function sync(){
      try{
        const [remoteItems,remoteGroups]=await Promise.all([apiGet('gallery'),apiGet('media_groups')]);
        items=remoteItems;groups=remoteGroups;writeCache();
      }catch(err){console.warn('Media backend fallback:',err)}
      render();
    }

    function fillGroupSelect(preselect=''){
      if(!groupSelect)return;
      groupSelect.innerHTML=
        `<option value="">General (sin grupo)</option>`+
        groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')+
        `<option value="__new__">+ Crear grupo nuevo</option>`;
      groupSelect.value=preselect||'';
      newGroupWrap?.classList.toggle('hidden',groupSelect.value!=='__new__');
    }

    function resetModal(){
      selectedFile=null;
      if(modalFile)modalFile.value='';
      if(modalPreview){modalPreview.removeAttribute('src')}
      dropzone?.classList.remove('has-image','dragover');
      if(captionInput)captionInput.value='';
      if(videoUrl)videoUrl.value='';
      if(newGroupInput)newGroupInput.value='';
      if(modalStatus){modalStatus.textContent='';modalStatus.className='media-modal-status'}
    }

    function openUploadModal(mode='image',groupId=''){
      if(!canUploadMedia())return;
      modalMode=mode;
      resetModal();
      fillGroupSelect(groupId);
      if(modalTitle)modalTitle.textContent=mode==='video'?'Añadir video':'Añadir imagen';
      imageArea?.classList.toggle('hidden',mode!=='image');
      videoArea?.classList.toggle('hidden',mode!=='video');
      modal?.classList.add('open');
      modal?.setAttribute('aria-hidden','false');
    }

    function closeUploadModal(){
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden','true');
      resetModal();
    }

    function setSelectedFile(file){
      if(!file||!file.type?.startsWith('image/'))return;
      selectedFile=file;
      const reader=new FileReader();
      reader.onload=()=>{
        if(modalPreview)modalPreview.src=reader.result;
        dropzone?.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    }

    modalFile?.addEventListener('change',()=>setSelectedFile(modalFile.files?.[0]));
    dropzone?.addEventListener('dragover',e=>{e.preventDefault();dropzone.classList.add('dragover')});
    dropzone?.addEventListener('dragleave',()=>dropzone.classList.remove('dragover'));
    dropzone?.addEventListener('drop',e=>{
      e.preventDefault();dropzone.classList.remove('dragover');
      setSelectedFile(e.dataTransfer?.files?.[0]);
    });

    groupSelect?.addEventListener('change',()=>{
      newGroupWrap?.classList.toggle('hidden',groupSelect.value!=='__new__');
      if(groupSelect.value==='__new__')newGroupInput?.focus();
    });

    modal?.querySelectorAll('[data-media-modal-close]').forEach(el=>el.addEventListener('click',closeUploadModal));

    async function ensureSelectedGroup(){
      const value=groupSelect?.value||'';
      if(value!=='__new__')return value;

      const name=newGroupInput?.value.trim()||'';
      if(!name)throw new Error('Escribí un nombre para el grupo nuevo.');

      const type=modalMode==='video'?'video':'image';
      const item={
        id:uid('group'),
        name,
        description:'',
        group_type:type,
        sort_order:groups.length+1
      };
      await apiWrite('media_groups','upsert',{item});
      groups.push(item);
      writeCache();
      return item.id;
    }

    modalSave?.addEventListener('click',async()=>{
      if(!canUploadMedia())return;
      try{
        modalSave.disabled=true;
        modalStatus.textContent='Guardando...';
        modalStatus.className='media-modal-status';

        const groupId=await ensureSelectedGroup();
        const caption=captionInput?.value.trim()||'';

        let item;
        if(modalMode==='image'){
          if(!selectedFile)throw new Error('Seleccioná una imagen.');
          const src=await imageToDataURL(selectedFile);
          item={id:uid(),src,caption,sort_order:0,media_type:'image',group_id:groupId||''};
        }else{
          const url=videoUrl?.value.trim()||'';
          if(!url)throw new Error('Pegá el enlace del video.');
          item={id:uid(),src:url,caption,sort_order:0,media_type:'video',group_id:groupId||''};
        }

        await apiWrite('gallery','upsert',{item});
        items.unshift(item);
        writeCache();
        render();

        modalStatus.textContent='Guardado.';
        modalStatus.className='media-modal-status success';
        setTimeout(closeUploadModal,350);
      }catch(err){
        modalStatus.textContent=err.message||'No se pudo guardar.';
        modalStatus.className='media-modal-status error';
      }finally{
        modalSave.disabled=false;
      }
    });

    function openImageViewer(id){
      const it=items.find(x=>x.id===id&&x.media_type!=='video');
      if(!it)return;
      viewerImage.src=it.src;
      viewerCaption.textContent=it.caption||'Imagen';
      viewerGroup.textContent=groupName(it.group_id||'');
      viewerDownload.href=it.src;
      viewerDownload.download=(it.caption||'kidz-image').replace(/[^\w\-]+/g,'-')+'.png';
      viewer?.classList.add('open');
      viewer?.setAttribute('aria-hidden','false');
    }

    function closeImageViewer(){
      viewer?.classList.remove('open');
      viewer?.setAttribute('aria-hidden','true');
      if(viewerImage)viewerImage.removeAttribute('src');
    }
    viewer?.querySelectorAll('[data-media-viewer-close]').forEach(el=>el.addEventListener('click',closeImageViewer));

    addImageBtn?.addEventListener('click',()=>openUploadModal('image'));
    addVideoBtn?.addEventListener('click',()=>openUploadModal('video'));

    async function createGroup(existing=null){
      if(!isAdmin())return;
      const name=prompt(existing?'Nombre del grupo:':'Nombre del nuevo grupo:',existing?.name||'');
      if(!name)return;
      const typeRaw=prompt('Tipo de grupo: imagen / video / mixto',existing?.group_type||'image');
      if(typeRaw===null)return;
      const clean=typeRaw.trim().toLowerCase();
      const type=['image','video','mixed'].includes(clean)?clean:(clean.startsWith('vid')?'video':clean.startsWith('mix')?'mixed':'image');
      const description=prompt('Descripción del grupo (opcional):',existing?.description||'');
      if(description===null)return;
      const item={id:existing?.id||uid('group'),name:name.trim(),description:description.trim(),group_type:type,sort_order:existing?.sort_order??groups.length+1};
      await apiWrite('media_groups','upsert',{item});
      const i=groups.findIndex(g=>g.id===item.id);
      if(i>=0)groups[i]=item;else groups.push(item);
      writeCache();render();
    }

    addGroupBtn?.addEventListener('click',()=>createGroup());

    grid.addEventListener('click',async e=>{
      const open=e.target.closest('[data-open-image]');
      if(open){openImageViewer(open.dataset.openImage);return}

      const addImg=e.target.closest('[data-add-image-group]');
      if(addImg&&isAdmin()){openUploadModal('image',addImg.dataset.addImageGroup);return}

      const addVid=e.target.closest('[data-add-video-group]');
      if(addVid&&isAdmin()){openUploadModal('video',addVid.dataset.addVideoGroup);return}

      const edit=e.target.closest('[data-edit-group]');
      if(edit&&isAdmin()){
        const g=groups.find(x=>x.id===edit.dataset.editGroup);
        if(g)await createGroup(g);
        return;
      }

      const deleteGroup=e.target.closest('[data-delete-group]');
      if(deleteGroup&&isAdmin()){
        const id=deleteGroup.dataset.deleteGroup;
        const g=groups.find(x=>x.id===id);
        if(!g)return;
        const children=items.filter(x=>x.group_id===id);
        const msg=children.length
          ? `El grupo "${g.name}" tiene ${children.length} elemento(s).\n\nSi borrás el grupo, esos elementos pasarán a General. ¿Continuar?`
          : `¿Borrar el grupo "${g.name}"?`;
        if(!confirm(msg))return;
        try{
          await apiWrite('media_groups','delete',{id});
          groups=groups.filter(x=>x.id!==id);
          items=items.map(x=>x.group_id===id?{...x,group_id:''}:x);
          writeCache();render();
        }catch(err){alert(err.message||'No se pudo borrar el grupo.')}
        return;
      }

      const del=e.target.closest('[data-delete-media]');
      if(del&&isAdmin()){
        if(!confirm('¿Borrar este contenido?'))return;
        try{
          await apiWrite('gallery','delete',{id:del.dataset.deleteMedia});
          items=items.filter(x=>x.id!==del.dataset.deleteMedia);
          writeCache();render();
        }catch(err){alert(err.message||'No se pudo borrar.')}
      }
    });

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){closeUploadModal();closeImageViewer()}
    });

    const observer=new MutationObserver(()=>render());
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});

    // legacy input is no longer used by the new modal
    if(legacyImageInput)legacyImageInput.style.display='none';

    render();sync();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMedia,{once:true});
  else initMedia();
})();
