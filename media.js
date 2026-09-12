
(function(){
  function initMedia(){
    const grid = document.getElementById('mediaGrid');
    const addGroupBtn = document.getElementById('addMediaGroupBtn');
    const addImageBtn = document.getElementById('addMediaImageBtn');
    const addVideoBtn = document.getElementById('addMediaVideoBtn');
    const imageInput = document.getElementById('mediaImageInput');
    if(!grid || grid.dataset.mediaReady === '1') return;
    grid.dataset.mediaReady = '1';

    const API_URL = 'https://zlxcfpwmnksceagbcarl.supabase.co/functions/v1/kidz-members';
    const CACHE_ITEMS = 'kidzMediaBackendCacheV2';
    const CACHE_GROUPS = 'kidzMediaGroupsCacheV1';

    let items = readCache(CACHE_ITEMS);
    let groups = readCache(CACHE_GROUPS);
    let pendingImageGroupId = '';

    function isAdmin(){
      return !!window.KidzAuth?.isAdmin?.() || document.body.classList.contains('role-admin');
    }
    function isOG(){
      return !!window.KidzAuth?.isOG?.() || document.body.classList.contains('role-og');
    }
    function canUploadMedia(){
      return isAdmin() || isOG();
    }
    function adminPassword(){
      return window.KidzAuth?.getAdminPassword?.() || '';
    }
    function esc(v=''){
      return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    }
    function uid(prefix='media'){
      return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
    }
    function readCache(key){
      try{
        const v=JSON.parse(localStorage.getItem(key)||'[]');
        return Array.isArray(v)?v:[];
      }catch(_){return [];}
    }
    function writeCache(){
      try{
        localStorage.setItem(CACHE_ITEMS,JSON.stringify(items));
        localStorage.setItem(CACHE_GROUPS,JSON.stringify(groups));
      }catch(_){}
    }
    async function apiGet(resource){
      const r=await fetch(`${API_URL}?resource=${encodeURIComponent(resource)}`,{headers:{Accept:'application/json'}});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok) throw new Error(j.error||'No se pudo cargar multimedia.');
      return Array.isArray(j.items)?j.items:[];
    }
    async function apiWrite(resource,action,payload={}){
      // Fotos/videos: Admin + OG pueden SUBIR.
      // Borrar contenido y administrar grupos: solo Admin.
      if(resource === 'gallery' && action === 'upsert'){
        if(!canUploadMedia()) throw new Error('No tenés permisos para subir contenido.');
      }else{
        if(!isAdmin()) throw new Error('Esta acción está disponible solo para Admin.');
      }

      const password = isAdmin() ? adminPassword() : '';

      if(isAdmin() && !password){
        throw new Error('Volvé a ingresar al modo Admin para guardar cambios.');
      }

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
      if(yt) return {kind:'embed',src:`https://www.youtube.com/embed/${yt[1]}`};
      const vm=url.match(/vimeo\.com\/(\d+)/);
      if(vm) return {kind:'embed',src:`https://player.vimeo.com/video/${vm[1]}`};
      return {kind:'video',src:url};
    }

    function groupTypeLabel(type){
      return type==='video' ? 'VIDEOS' : type==='image' ? 'IMÁGENES' : 'MIXTO';
    }

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
          <div class="media-visual">${visual}</div>
          <div class="media-caption">
            <span>${esc(it.caption || (type==='video'?'VIDEO':'IMAGEN'))}</span>
            <button class="media-delete admin-only" type="button" data-delete-media="${esc(it.id)}">BORRAR</button>
          </div>
        </article>`;
    }

    function render(){
      const orderedGroups=[...groups].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));

      const groupHtml=orderedGroups.map((g,gIndex)=>{
        const children=items.filter(it=>(it.group_id||'')===g.id);
        return `
          <section class="media-group" data-group-id="${esc(g.id)}">
            <div class="media-group-head">
              <div>
                <span class="media-group-kicker">${groupTypeLabel(g.group_type)}</span>
                <h2>${esc(g.name)}</h2>
                ${g.description?`<p>${esc(g.description)}</p>`:''}
              </div>
              <div class="media-group-actions admin-only">
                <button type="button" data-add-image-group="${esc(g.id)}">+ IMAGEN</button>
                <button type="button" data-add-video-group="${esc(g.id)}">+ VIDEO</button>
                <button type="button" data-edit-group="${esc(g.id)}">EDITAR</button>
                <button type="button" data-delete-group="${esc(g.id)}">BORRAR GRUPO</button>
              </div>
            </div>
            <div class="media-group-grid">
              ${children.length
                ? children.map((it,i)=>mediaCard(it,i)).join('')
                : `<div class="media-group-empty">${isAdmin()?'Este grupo está vacío. Añadí contenido desde los botones del grupo.':'Todavía no hay contenido en este grupo.'}</div>`}
            </div>
          </section>`;
      }).join('');

      const loose=items.filter(it=>!it.group_id);
      const looseHtml=loose.length ? `
        <section class="media-group media-group-ungrouped">
          <div class="media-group-head">
            <div>
              <span class="media-group-kicker">ARCHIVO</span>
              <h2>Sin grupo</h2>
            </div>
          </div>
          <div class="media-group-grid">${loose.map((it,i)=>mediaCard(it,i)).join('')}</div>
        </section>` : '';

      if(!orderedGroups.length && !loose.length){
        grid.innerHTML=`
          <div class="media-empty">
            <span>KIDZ // VISUAL ARCHIVE</span>
            <strong>Todavía no hay imágenes ni videos.</strong>
            <small>${isAdmin()?'Creá un grupo de fotos, videos o mixto para empezar.':''}</small>
          </div>`;
        return;
      }
      grid.innerHTML=groupHtml+looseHtml;
    }

    async function sync(){
      try{
        const [remoteItems,remoteGroups]=await Promise.all([apiGet('gallery'),apiGet('media_groups')]);
        items=remoteItems;groups=remoteGroups;writeCache();
      }catch(err){
        console.warn('Media backend fallback:',err);
      }
      render();
    }

    async function createGroup(existing=null){
      if(!isAdmin()) return;
      const name=prompt(existing?'Nombre del grupo:':'Nombre del nuevo grupo:',existing?.name||'');
      if(!name) return;
      const typeRaw=prompt('Tipo de grupo: imagen / video / mixto',existing?.group_type||'image');
      if(typeRaw===null) return;
      const type=['image','video','mixed'].includes(typeRaw.trim().toLowerCase())
        ? typeRaw.trim().toLowerCase()
        : (typeRaw.toLowerCase().startsWith('vid')?'video':typeRaw.toLowerCase().startsWith('mix')?'mixed':'image');
      const description=prompt('Descripción del grupo (opcional):',existing?.description||'');
      if(description===null) return;

      const item={
        id:existing?.id||uid('group'),
        name:name.trim(),
        description:description.trim(),
        group_type:type,
        sort_order:existing?.sort_order ?? groups.length+1
      };

      await apiWrite('media_groups','upsert',{item});
      const i=groups.findIndex(g=>g.id===item.id);
      if(i>=0) groups[i]=item; else groups.push(item);
      writeCache();render();
    }

    addGroupBtn?.addEventListener('click',()=>createGroup());

    function chooseGroup(expectedType){
      const compatible=groups.filter(g=>g.group_type==='mixed'||g.group_type===expectedType);
      if(!compatible.length) return '';
      const listing=compatible.map((g,i)=>`${i+1}. ${g.name}`).join('\n');
      const answer=prompt(`¿En qué grupo?\n${listing}\n\nDejá vacío para "Sin grupo".`,'');
      if(!answer) return '';
      const idx=Number(answer)-1;
      return compatible[idx]?.id || '';
    }

    addImageBtn?.addEventListener('click',()=>{
      if(!canUploadMedia()) return;
      pendingImageGroupId=chooseGroup('image');
      imageInput?.click();
    });

    imageInput?.addEventListener('change',async()=>{
      const file=imageInput.files?.[0];
      imageInput.value='';
      if(!file||!canUploadMedia()) return;
      const caption=prompt('Nombre o descripción de la imagen (opcional):','');
      if(caption===null) return;
      try{
        const src=await imageToDataURL(file);
        const item={id:uid(),src,caption:caption.trim(),sort_order:0,media_type:'image',group_id:pendingImageGroupId||''};
        pendingImageGroupId='';
        await apiWrite('gallery','upsert',{item});
        items.unshift(item);writeCache();render();
      }catch(err){alert(err.message||'No se pudo guardar la imagen.');}
    });

    async function addVideo(groupId=''){
      if(!canUploadMedia()) return;
      if(!groupId) groupId=chooseGroup('video');
      const url=prompt('Pegá el enlace del video (YouTube, Vimeo o MP4):','');
      if(!url) return;
      const caption=prompt('Nombre o descripción del video (opcional):','');
      if(caption===null) return;
      try{
        const item={id:uid(),src:url.trim(),caption:caption.trim(),sort_order:0,media_type:'video',group_id:groupId||''};
        await apiWrite('gallery','upsert',{item});
        items.unshift(item);writeCache();render();
      }catch(err){alert(err.message||'No se pudo guardar el video.');}
    }

    addVideoBtn?.addEventListener('click',()=>addVideo());

    grid.addEventListener('click',async e=>{

      const addImg=e.target.closest('[data-add-image-group]');
      if(addImg){
        pendingImageGroupId=addImg.dataset.addImageGroup;
        imageInput?.click();
        return;
      }

      const addVid=e.target.closest('[data-add-video-group]');
      if(addVid){ await addVideo(addVid.dataset.addVideoGroup); return; }

      const edit=e.target.closest('[data-edit-group]');
      if(edit){
        const g=groups.find(x=>x.id===edit.dataset.editGroup);
        if(g) await createGroup(g);
        return;
      }

      const deleteGroup=e.target.closest('[data-delete-group]');
      if(deleteGroup){
        const id=deleteGroup.dataset.deleteGroup;
        const g=groups.find(x=>x.id===id);
        if(!g) return;
        const children=items.filter(x=>x.group_id===id);
        const msg=children.length
          ? `El grupo "${g.name}" tiene ${children.length} elemento(s).\n\nSi borrás el grupo, esos elementos pasarán a "Sin grupo". ¿Continuar?`
          : `¿Borrar el grupo "${g.name}"?`;
        if(!confirm(msg)) return;
        try{
          await apiWrite('media_groups','delete',{id});
          groups=groups.filter(x=>x.id!==id);
          items=items.map(x=>x.group_id===id?{...x,group_id:''}:x);
          writeCache();render();
        }catch(err){alert(err.message||'No se pudo borrar el grupo.');}
        return;
      }

      const del=e.target.closest('[data-delete-media]');
      if(del){
        if(!confirm('¿Borrar este contenido?')) return;
        try{
          await apiWrite('gallery','delete',{id:del.dataset.deleteMedia});
          items=items.filter(x=>x.id!==del.dataset.deleteMedia);
          writeCache();render();
        }catch(err){alert(err.message||'No se pudo borrar.');}
      }
    });

    const observer=new MutationObserver(()=>render());
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});

    render();sync();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initMedia,{once:true});
  else initMedia();
})();
