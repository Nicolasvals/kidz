(function(){
  function initMembers(){
    const grid = document.getElementById('membersGrid');
    const gallery = document.getElementById('membersGallery');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addGalleryBtn = document.getElementById('addGalleryPhotoBtn');
    const memberPhotoInput = document.getElementById('memberPhotoInput');
    const galleryPhotoInput = document.getElementById('galleryPhotoInput');

    if(!grid || !gallery || grid.dataset.membersReady === '1') return;
    grid.dataset.membersReady = '1';

    const MEMBERS_KEY = 'kidzMembersV1';
    const GALLERY_KEY = 'kidzMembersGalleryV1';

    let members = load(MEMBERS_KEY, []);
    let photos = load(GALLERY_KEY, []);

    function isAdmin(){
      return document.body.classList.contains('role-admin');
    }

    function load(key, fallback){
      try{
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      }catch(_){
        return fallback;
      }
    }

    function save(){
      try{
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
        localStorage.setItem(GALLERY_KEY, JSON.stringify(photos));
      }catch(err){
        alert('No se pudo guardar. Puede que el navegador se haya quedado sin espacio para imágenes.');
      }
    }

    function esc(value=''){
      return String(value)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;');
    }

    function uid(){
      return 'kidz-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
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

      grid.innerHTML = members.map((m, index) => `
        <article class="member-card" data-member-id="${esc(m.id)}">
          <div class="member-photo-wrap">
            ${m.photo
              ? `<img class="member-photo" src="${m.photo}" alt="${esc(m.name)}">`
              : `<div class="member-photo-placeholder">${esc((m.name || '?').charAt(0).toUpperCase())}</div>`
            }
            <span class="member-index">${String(index + 1).padStart(2,'0')}</span>
          </div>

          <div class="member-card-info">
            <h3>${esc(m.name)}</h3>
            ${m.subtitle ? `<p>${esc(m.subtitle)}</p>` : ''}
          </div>

          <div class="member-admin-actions admin-only">
            <button type="button" data-edit-member="${esc(m.id)}">EDITAR</button>
            <button type="button" data-delete-member="${esc(m.id)}">BORRAR</button>
          </div>
        </article>
      `).join('');
    }

    function renderGallery(){
      if(!photos.length){
        gallery.innerHTML = `
          <div class="gallery-empty">
            <span>KIDZ // ARCHIVE</span>
            <strong>La biblioteca está vacía.</strong>
            <small>${isAdmin() ? 'Añadí fotos para empezar el archivo.' : ''}</small>
          </div>`;
        return;
      }

      gallery.innerHTML = photos.map(p => `
        <figure class="gallery-photo" data-photo-id="${esc(p.id)}">
          <img src="${p.src}" alt="${esc(p.caption || 'Foto Kidz')}" loading="lazy">
          <figcaption>
            ${p.caption ? `<span>${esc(p.caption)}</span>` : '<span>KIDZ</span>'}
            <button class="gallery-delete admin-only" type="button" data-delete-photo="${esc(p.id)}">×</button>
          </figcaption>
        </figure>
      `).join('');
    }

    function renderAll(){
      renderMembers();
      renderGallery();
    }

    function openMemberForm(existing=null){
      if(!isAdmin()) return;

      const name = prompt('Nombre del personaje:', existing?.name || '');
      if(name === null) return;

      const cleanName = name.trim();
      if(!cleanName) return;

      const subtitle = prompt('Apodo, rol o detalle opcional:', existing?.subtitle || '');
      if(subtitle === null) return;

      const id = existing?.id || uid();

      if(existing){
        const i = members.findIndex(m => m.id === id);
        if(i >= 0){
          members[i] = {...members[i], name:cleanName, subtitle:subtitle.trim()};
          save();
          renderMembers();
        }
        return;
      }

      memberPhotoInput.dataset.pendingMemberId = id;
      memberPhotoInput.dataset.pendingName = cleanName;
      memberPhotoInput.dataset.pendingSubtitle = subtitle.trim();

      const wantsPhoto = confirm('¿Querés agregarle una foto ahora?');
      if(wantsPhoto){
        memberPhotoInput.click();
      }else{
        members.push({
          id,
          name:cleanName,
          subtitle:subtitle.trim(),
          photo:''
        });
        save();
        renderMembers();
      }
    }

    async function resizeImage(file, maxSide=1100, quality=.84){
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const img = new Image();

          img.onload = () => {
            let {width, height} = img;
            const ratio = Math.min(1, maxSide / Math.max(width,height));
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,width,height);

            resolve(canvas.toDataURL('image/jpeg',quality));
          };

          img.onerror = reject;
          img.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    memberPhotoInput?.addEventListener('change', async () => {
      const file = memberPhotoInput.files?.[0];
      const id = memberPhotoInput.dataset.pendingMemberId;
      const name = memberPhotoInput.dataset.pendingName;
      const subtitle = memberPhotoInput.dataset.pendingSubtitle || '';

      if(!file || !id || !name){
        memberPhotoInput.value = '';
        return;
      }

      try{
        const photo = await resizeImage(file, 1000, .84);
        members.push({id,name,subtitle,photo});
        save();
        renderMembers();
      }catch(_){
        alert('No se pudo procesar esa imagen.');
      }

      memberPhotoInput.value = '';
      delete memberPhotoInput.dataset.pendingMemberId;
      delete memberPhotoInput.dataset.pendingName;
      delete memberPhotoInput.dataset.pendingSubtitle;
    });

    addMemberBtn?.addEventListener('click', () => openMemberForm());

    grid.addEventListener('click', e => {
      const edit = e.target.closest('[data-edit-member]');
      if(edit && isAdmin()){
        const member = members.find(m => m.id === edit.dataset.editMember);
        if(member) openMemberForm(member);
        return;
      }

      const del = e.target.closest('[data-delete-member]');
      if(del && isAdmin()){
        const id = del.dataset.deleteMember;
        const member = members.find(m => m.id === id);

        if(member && confirm(`¿Borrar a "${member.name}"?`)){
          members = members.filter(m => m.id !== id);
          save();
          renderMembers();
        }
      }
    });

    addGalleryBtn?.addEventListener('click', () => {
      if(isAdmin()) galleryPhotoInput?.click();
    });

    galleryPhotoInput?.addEventListener('change', async () => {
      const file = galleryPhotoInput.files?.[0];
      if(!file) return;

      const caption = prompt('Texto de la foto (opcional):', '');
      if(caption === null){
        galleryPhotoInput.value = '';
        return;
      }

      try{
        const src = await resizeImage(file, 1500, .85);
        photos.unshift({
          id:uid(),
          src,
          caption:caption.trim()
        });
        save();
        renderGallery();
      }catch(_){
        alert('No se pudo procesar esa imagen.');
      }

      galleryPhotoInput.value = '';
    });

    gallery.addEventListener('click', e => {
      const del = e.target.closest('[data-delete-photo]');
      if(!del || !isAdmin()) return;

      if(confirm('¿Borrar esta foto de la biblioteca?')){
        photos = photos.filter(p => p.id !== del.dataset.deletePhoto);
        save();
        renderGallery();
      }
    });

    const roleObserver = new MutationObserver(renderAll);
    roleObserver.observe(document.body, {
      attributes:true,
      attributeFilter:['class']
    });

    renderAll();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initMembers, {once:true});
  }else{
    initMembers();
  }
})();