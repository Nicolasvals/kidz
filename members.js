
(function(){
  function initMembers(){
    const grid = document.getElementById('membersGrid');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberPhotoInput = document.getElementById('memberPhotoInput');

    if(!grid || grid.dataset.membersReady === '1') return;
    grid.dataset.membersReady = '1';

    const API_URL = 'https://zlxcfpwmnksceagbcarl.supabase.co/functions/v1/kidz-members';
    const MEMBERS_CACHE = 'kidzMembersBackendCacheV1';

    const DEFAULT_MEMBERS = [
      {id:'member-lb', name:'LB', subtitle:'LÍDER', real_name:"La'Tray Banks", state_id:'40268', phone:'585-860-1997', photo:'assets/members/lb.png', sort_order:1},
      {id:'member-zoe', name:'Zoe Briggs', subtitle:'LA JEFA', real_name:'Zoe Briggs', state_id:'99760', phone:'167-316-9170', photo:'assets/members/zoe-briggs.png', sort_order:2},
      {id:'member-keith', name:'Keith Webb', subtitle:'SUBLÍDER', real_name:'Keith Webb', state_id:'43420', phone:'373-784-6810', photo:'assets/members/keith-webb.png', sort_order:3},
      {id:'member-cain', name:'Cain Crane', subtitle:'MIEMBRO', real_name:'Cain Crane', state_id:'64654', phone:'314-464-9339', photo:'assets/members/cain-crane.png', sort_order:4},
      {id:'member-twenty', name:'Twenty', subtitle:'MIEMBRO', real_name:'Caín Cross', state_id:'86163', phone:'728-625-5455', photo:'assets/members/twenty.png', sort_order:5},
      {id:'member-malik', name:'Malik Scott', subtitle:'MIEMBRO', real_name:'Malik Scott', state_id:'80016', phone:'297-127-7767', photo:'assets/members/malik-scott.png', sort_order:6},
      {id:'member-ayden', name:'Ayden Brown', subtitle:'MIEMBRO', real_name:'Ayden Brown', state_id:'47896', phone:'252-730-1038', photo:'assets/members/ayden-brown.png', sort_order:7},
      {id:'member-kb', name:'KB', subtitle:'MIEMBRO', real_name:'KB', state_id:'71563', phone:'848-049-4582', photo:'assets/members/orgulloso.png', sort_order:8}
    ];

    // Fix typo locally without affecting compatibility.

    let members = readCache(MEMBERS_CACHE, DEFAULT_MEMBERS.map(x=>({...x})));
    let pendingMemberFile = null;

    function isAdmin(){
      return !!window.KidzAuth?.isAdmin?.() || document.body.classList.contains('role-admin');
    }

    function adminPassword(){
      return window.KidzAuth?.getAdminPassword?.() || '';
    }

    function esc(v=''){
      return String(v)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;');
    }

    function uid(){
      return 'kidz-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
    }

    function readCache(key, fallback){
      try{
        const v = JSON.parse(localStorage.getItem(key) || 'null');
        return Array.isArray(v) ? v : fallback;
      }catch(_){ return fallback; }
    }

    function writeCache(){
      try{
        localStorage.setItem(MEMBERS_CACHE, JSON.stringify(members));
      }catch(_){}
    }

    async function apiGet(resource){
      const r = await fetch(`${API_URL}?resource=${encodeURIComponent(resource)}`, {
        headers:{'Accept':'application/json'}
      });
      const j = await r.json().catch(()=>({}));
      if(!r.ok || !j.ok) throw new Error(j.error || 'Backend no disponible');
      return Array.isArray(j.items) ? j.items : [];
    }

    async function apiWrite(resource, action, payload={}){
      if(!isAdmin()) throw new Error('Solo Admin puede modificar miembros.');
      const password = adminPassword();
      if(!password) throw new Error('Volvé a ingresar al modo Admin para guardar cambios.');

      const r = await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({resource,action,password,...payload})
      });
      const j = await r.json().catch(()=>({}));
      if(!r.ok || !j.ok) throw new Error(j.error || 'No se pudo guardar.');
      return j;
    }

    async function syncFromServer(){
      try{
        const remoteMembers = await apiGet('members');

        if(remoteMembers.length){
          members = remoteMembers;
        }else if(!members.length){
          members = DEFAULT_MEMBERS.map(x=>({...x}));
        }
        writeCache();
        renderAll();
        setSyncState('online');
      }catch(err){
        console.warn('Members backend fallback:',err);
        setSyncState('offline');
        renderAll();
      }
    }

    function setSyncState(state){
      const head = document.querySelector('#view-members .section-head');
      if(!head) return;
      let tag = head.querySelector('.members-sync-state');
      if(!tag){
        tag = document.createElement('span');
        tag.className = 'members-sync-state admin-only';
        head.appendChild(tag);
      }
      tag.textContent = state === 'online' ? '● GUARDADO ONLINE' : '● MODO LOCAL';
      tag.dataset.state = state;
      tag.style.display = isAdmin() ? '' : 'none';
    }

    function renderMembers(){
      if(!members.length){
        grid.innerHTML = `
          <div class="members-empty">
            <span>KIDZ // CREW</span>
            <strong>Todavía no hay miembros cargados.</strong>
            <small>${isAdmin() ? 'Usá “Nuevo miembro” para agregar el primero.' : ''}</small>
          </div>`;
        return;
      }

      const ordered = [...members].sort((a,b)=>(a.sort_order ?? 999)-(b.sort_order ?? 999));

      grid.innerHTML = ordered.map((m,index)=>`
        <article class="member-card" data-member-id="${esc(m.id)}" data-member-index="${String(index+1).padStart(2,'0')}">
          <div class="member-photo-wrap">
            ${m.photo
              ? `<img class="member-photo" src="${m.photo}" alt="${esc(m.name)}">`
              : `<div class="member-photo-placeholder">${esc((m.name||'?').charAt(0).toUpperCase())}</div>`}
            <span class="member-index">${String(index+1).padStart(2,'0')}</span>
          </div>

          <div class="member-card-info">
            ${m.subtitle ? `<span class="member-role">${esc(m.subtitle)}</span>` : ''}
            <h3>${esc(m.name)}</h3>
            <span class="member-line"></span>
            <p class="member-meta">KIDZ // MEMBER ${String(index+1).padStart(2,'0')}</p>
            ${(m.real_name || m.state_id || m.phone) ? `
              <div class="member-contact">
                ${m.real_name && m.real_name !== m.name ? `<span><b>NOMBRE</b>${esc(m.real_name)}</span>` : ''}
                ${m.state_id ? `<span><b>STATE ID</b>${esc(m.state_id)}</span>` : ''}
                ${m.phone ? `<span><b>TEL</b>${esc(m.phone)}</span>` : ''}
              </div>` : ''}
          </div>

          <div class="member-admin-actions admin-only">
            <button type="button" data-edit-member="${esc(m.id)}">EDITAR</button>
            <button type="button" data-photo-member="${esc(m.id)}">IMAGEN</button>
            <button type="button" data-delete-member="${esc(m.id)}">BORRAR</button>
          </div>
        </article>
      `).join('');
    }

    function renderAll(){
      renderMembers();
    }

    async function imageToDataURL(file, maxSide=1400, quality=.86){
      return new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.onload=()=>{
          const img = new Image();
          img.onload=()=>{
            let w=img.width,h=img.height;
            const scale=Math.min(1,maxSide/Math.max(w,h));
            w=Math.round(w*scale); h=Math.round(h*scale);
            const canvas=document.createElement('canvas');
            canvas.width=w; canvas.height=h;
            const ctx=canvas.getContext('2d');
            ctx.drawImage(img,0,0,w,h);
            const type = file.type === 'image/png' ? 'image/png' : 'image/webp';
            resolve(type === 'image/png'
              ? canvas.toDataURL('image/png')
              : canvas.toDataURL('image/webp',quality));
          };
          img.onerror=reject;
          img.src=reader.result;
        };
        reader.onerror=reject;
        reader.readAsDataURL(file);
      });
    }

    function ensureEditor(){
      let editor = document.getElementById('memberEditorModal');
      if(editor) return editor;

      editor = document.createElement('div');
      editor.id='memberEditorModal';
      editor.className='member-editor-modal hidden';
      editor.innerHTML=`
        <div class="member-editor-backdrop" data-close-member-editor></div>
        <form class="member-editor-card" id="memberEditorForm">
          <button type="button" class="member-editor-close" data-close-member-editor>×</button>
          <span class="member-editor-kicker">KIDZ // ADMIN</span>
          <h3 id="memberEditorTitle">Nuevo miembro</h3>

          <label>Nombre
            <input id="memberEditorName" maxlength="80" required>
          </label>

          <label>Rol / apodo
            <input id="memberEditorSubtitle" maxlength="80" placeholder="MIEMBRO">
          </label>

          <label>Nombre completo / alias real
            <input id="memberEditorRealName" maxlength="100" placeholder="Opcional">
          </label>

          <label>State ID
            <input id="memberEditorStateId" maxlength="5" inputmode="numeric" placeholder="00000">
          </label>

          <label>Teléfono
            <input id="memberEditorPhone" maxlength="20" placeholder="000-000-0000">
          </label>

          <label>Posición
            <input id="memberEditorOrder" type="number" min="1" max="999" value="1">
          </label>

          <label class="member-editor-file">Imagen
            <input id="memberEditorPhoto" type="file" accept="image/*">
            <span>SELECCIONAR PNG / JPG / WEBP</span>
          </label>

          <div class="member-editor-preview" id="memberEditorPreview"></div>
          <p class="member-editor-note">Si no elegís una nueva imagen al editar, se mantiene la actual.</p>

          <div class="member-editor-actions">
            <button type="button" class="ghost-btn" data-close-member-editor>CANCELAR</button>
            <button type="submit" class="primary-btn" id="memberEditorSave">GUARDAR</button>
          </div>
        </form>`;
      document.body.appendChild(editor);

      editor.querySelectorAll('[data-close-member-editor]').forEach(b=>{
        b.addEventListener('click',()=>closeEditor());
      });
      editor.querySelector('#memberEditorForm').addEventListener('submit', saveEditor);
      editor.querySelector('#memberEditorPhoto').addEventListener('change',()=>{
        const file=editor.querySelector('#memberEditorPhoto').files?.[0];
        if(file){
          const url=URL.createObjectURL(file);
          editor.querySelector('#memberEditorPreview').innerHTML=`<img src="${url}" alt="">`;
        }
      });
      return editor;
    }

    function openEditor(existing=null){
      if(!isAdmin()) return;
      const editor=ensureEditor();
      editor.dataset.editId=existing?.id || '';
      editor.querySelector('#memberEditorTitle').textContent=existing ? 'Editar miembro' : 'Nuevo miembro';
      editor.querySelector('#memberEditorName').value=existing?.name || '';
      editor.querySelector('#memberEditorSubtitle').value=existing?.subtitle || 'MIEMBRO';
      editor.querySelector('#memberEditorRealName').value=existing?.real_name || '';
      editor.querySelector('#memberEditorStateId').value=existing?.state_id || '';
      editor.querySelector('#memberEditorPhone').value=existing?.phone || '';
      editor.querySelector('#memberEditorOrder').value=existing?.sort_order || (members.length+1);
      editor.querySelector('#memberEditorPhoto').value='';
      editor.querySelector('#memberEditorPreview').innerHTML=existing?.photo ? `<img src="${existing.photo}" alt="">` : '';
      editor.classList.remove('hidden');
      document.body.classList.add('member-editor-open');
      setTimeout(()=>editor.querySelector('#memberEditorName').focus(),50);
    }

    function closeEditor(){
      const editor=document.getElementById('memberEditorModal');
      editor?.classList.add('hidden');
      document.body.classList.remove('member-editor-open');
    }

    async function saveEditor(e){
      e.preventDefault();
      if(!isAdmin()) return;

      const editor=ensureEditor();
      const btn=editor.querySelector('#memberEditorSave');
      const id=editor.dataset.editId || uid();
      const existing=members.find(m=>m.id===id);

      const name=editor.querySelector('#memberEditorName').value.trim();
      const subtitle=editor.querySelector('#memberEditorSubtitle').value.trim();
      const real_name=editor.querySelector('#memberEditorRealName').value.trim();
      const state_id=editor.querySelector('#memberEditorStateId').value.trim();
      const phone=editor.querySelector('#memberEditorPhone').value.trim();
      const sort_order=Math.max(1,Number(editor.querySelector('#memberEditorOrder').value)||members.length+1);
      const file=editor.querySelector('#memberEditorPhoto').files?.[0];

      if(!name) return;

      try{
        btn.disabled=true; btn.textContent='GUARDANDO...';
        let photo=existing?.photo || '';
        if(file) photo=await imageToDataURL(file,1400,.86);

        const item={id,name,subtitle,real_name,state_id,phone,photo,sort_order};
        await apiWrite('members','upsert',{item});

        const i=members.findIndex(m=>m.id===id);
        if(i>=0) members[i]=item; else members.push(item);
        writeCache();
        renderMembers();
        closeEditor();
        setSyncState('online');
      }catch(err){
        alert(err.message || 'No se pudo guardar.');
      }finally{
        btn.disabled=false; btn.textContent='GUARDAR';
      }
    }

    addMemberBtn?.classList.add('admin-only');
    addMemberBtn?.addEventListener('click',()=>openEditor());

    grid.addEventListener('click',async e=>{
      if(!isAdmin()) return;

      const edit=e.target.closest('[data-edit-member]');
      if(edit){
        const m=members.find(x=>x.id===edit.dataset.editMember);
        if(m) openEditor(m);
        return;
      }

      const changePhoto=e.target.closest('[data-photo-member]');
      if(changePhoto){
        const m=members.find(x=>x.id===changePhoto.dataset.photoMember);
        if(!m) return;
        pendingMemberFile=m.id;
        memberPhotoInput?.click();
        return;
      }

      const del=e.target.closest('[data-delete-member]');
      if(del){
        const id=del.dataset.deleteMember;
        const m=members.find(x=>x.id===id);
        if(m && confirm(`¿Borrar a "${m.name}"?`)){
          try{
            await apiWrite('members','delete',{id});
            members=members.filter(x=>x.id!==id);
            writeCache(); renderMembers(); setSyncState('online');
          }catch(err){ alert(err.message || 'No se pudo borrar.'); }
        }
      }
    });

    memberPhotoInput?.addEventListener('change',async()=>{
      const file=memberPhotoInput.files?.[0];
      const id=pendingMemberFile;
      pendingMemberFile=null;
      memberPhotoInput.value='';
      if(!file || !id || !isAdmin()) return;

      const m=members.find(x=>x.id===id);
      if(!m) return;

      try{
        const photo=await imageToDataURL(file,1400,.86);
        const item={...m,photo};
        await apiWrite('members','upsert',{item});
        Object.assign(m,item);
        writeCache(); renderMembers(); setSyncState('online');
      }catch(err){ alert(err.message || 'No se pudo cambiar la imagen.'); }
    });

    const observer=new MutationObserver(()=>{
      renderAll();
      const tag=document.querySelector('.members-sync-state');
      if(tag) tag.style.display=isAdmin()?'':'none';
    });
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});

    renderAll();
    syncFromServer();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initMembers,{once:true});
  }else{
    initMembers();
  }
})();
