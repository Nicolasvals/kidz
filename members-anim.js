(function () {
  function isReady() {
    return !!window.gsap && !!window.ScrollTrigger;
  }

  function prefersReduced() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) { return false; }
  }

  // No muta el DOM si el estado no cambia: corta el bucle que genera el
  // MutationObserver de body de members.js (que re-renderiza el grid).
  function setCinematic(on) {
    const body = document.body;
    const has = body.classList.contains('kidz-cinematic');
    if (on && !has) body.classList.add('kidz-cinematic');
    if (!on && has) body.classList.remove('kidz-cinematic');
  }

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }

  // ---- Interacción del collage "TODOS JUNTOS" ----------------------
  // Hover: la card y su figura en la franja familiar se iluminan a la vez.
  function setLit(fig, on) {
    if (!fig) return;
    fig.classList.toggle('is-lit', on);
    if (!window.gsap) return;
    if (prefersReduced()) { gsap.set(fig, { y: 0, scale: 1 }); return; }
    gsap.to(fig, {
      y: on ? -12 : 0,
      scale: on ? 1.08 : 1,
      duration: on ? .4 : .45,
      ease: on ? 'power2.out' : 'power2.inOut',
      overwrite: 'auto'
    });
  }

  // Click → scroll al turno pineado de ese miembro (o hasta su card si no
  // hay secuencia cinematográfica).
  function goToMember(i) {
    const pf = pinFlags;
    const smooth = prefersReduced() ? 'auto' : 'smooth';
    if (pf.pinned && pf.st && pf.snapPoints[i + 1] != null) {
      const p = pf.snapPoints[i + 1];
      const target = pf.st.start + p * (pf.st.end - pf.st.start);
      window.scrollTo({ top: target, behavior: smooth });
    } else {
      const card = pf.cards[i];
      if (!card) return;
      const y = card.getBoundingClientRect().top +
        (window.pageYOffset || window.scrollY) - 90;
      window.scrollTo({ top: y, behavior: smooth });
    }
  }

  // Conecta cards del grid con sus figuras (mismo índice) y el scroll.
  function wireGrid(group) {
    const cells = [...group.querySelectorAll('.member-group-cell')];
    const figs = [...group.querySelectorAll('.member-strip-fig')];
    cells.forEach((cell, i) => {
      const fig = figs[i];
      cell.addEventListener('mouseenter', () => setLit(fig, true));
      cell.addEventListener('mouseleave', () => setLit(fig, false));
      cell.addEventListener('click', () => goToMember(i));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToMember(i);
        }
      });
    });
  }

  // ---- Estado ----------------------------------------------------
  let tls = [];
  let prevCards = [];
  let reinitTimer = 0;
  let hiddenRetries = 0;
  // Contexto que el grid "TODOS JUNTOS" usa para el click → scroll al turno
  // pineado de cada miembro (también cae al grid estático si no hay pin).
  let pinFlags = { pinned: false, cards: [], n: 0, snapPoints: [], st: null };

  // ---- Limpieza completa ------------------------------------------
  // revert() de ScrollTrigger desenvuelve el HTML a su estado original:
  // quita pin-spacers, restaura estilos inline y deshace la propiedad
  // initial de los tweens. Aplicado a TODOS los triggers evita que quede
  // ningún wrapper fantasma o anidado entre re-init()s.
  function reset() {
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(st => {
        try { st.revert(); } catch (_) { }
      });
    }

    tls.forEach(t => { try { t.kill(); } catch (_) { } });
    tls = [];

    if (window.gsap) {
      const group = document.getElementById('membersGroup');
      if (group) gsap.set(group, { clearProps: 'all' });

      // El intro y el overlay final solo existen en modo cinematic: eliminarlos
      // siempre al limpiar para que el grid vuelva a su flujo normal sin
      // overlays huérfanos.
      const igrid = document.getElementById('membersGrid');
      igrid && igrid.querySelectorAll('.members-intro, .members-final').forEach(el => {
        gsap.killTweensOf(el);
        gsap.killTweensOf(el.querySelectorAll('*'));
        el.remove();
      });

      prevCards.forEach(card => {
        try {
          gsap.killTweensOf(card);
          gsap.killTweensOf(card.querySelectorAll('*'));
          gsap.set(card, { clearProps: 'all' });
          gsap.set(card.querySelectorAll('.member-card-info > *, .member-index'), { clearProps: 'all' });
        } catch (_) { }
        card.style.zIndex = '';
        card.style.left = '';
        card.style.top = '';
      });
    }

    // Red de seguridad: por si un .pin-spacer huérfano quedara igualmente.
    unwrapSpacer(document.getElementById('membersGrid'));

    // Devolvemos el contenedor a su estado normal: la próxima vez que se
    // active la vista, la animación kidzViewIn volverá a correr y
    // buildMaster() la neutralizará de nuevo antes de pinear.
    const view = document.getElementById('view-members');
    if (view) {
      view.style.animation = '';
      view.style.transform = '';
    }

    prevCards = [];
    pinFlags = { pinned: false, cards: [], n: 0, snapPoints: [], st: null };
  }

  // Si GSAP dejara un .pin-spacer alrededor del grid, lo desanidamos a mano.
  function unwrapSpacer(grid) {
    if (!grid) return;
    let p = grid.parentElement;
    while (p && p.classList && p.classList.contains('pin-spacer') && p.parentElement) {
      const parent = p.parentElement;
      parent.insertBefore(grid, p);
      p.remove();
      p = grid.parentElement;
    }
  }

  // ---- Scheduler single-flight ------------------------------------
  function scheduleInit() {
    clearTimeout(reinitTimer);
    reinitTimer = setTimeout(() => {
      reinitTimer = 0;
      init();
    }, 120);
  }

  function scheduleRefresh() {
    requestAnimationFrame(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    setTimeout(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 140);
  }

  // ---- Collage "TODOS JUNTOS" -------------------------------------
  // En modo cinematic el titular "TODOS JUNTOS." no se dibuja aquí: la
  // secuencia pineada lo muestra en su fase final (overlay .members-final).
  // Así evita duplicar el título entre el pin y la sección.
  function buildCollage(cards, cinematic) {
    const group = document.getElementById('membersGroup');
    if (!group) return;
    if (!cards.length) {
      group.innerHTML = '';
      return;
    }

    const headHtml = cinematic
      ? ''
      : `<div class="members-group-head">
        <span class="members-group-kicker">KIDZ // CREW COMPLETA</span>
        <h3>TODOS<br>JUNTOS.</h3>
        <p>Los miembros de Kidz, la familia entera en un solo lugar.</p>
      </div>`;

    // Franja "todos en pose": la primera fila ABARCA MÁS — más miembros y más
    // ancha que las traseras (pirámide). Cada capa de atrás tiene un miembro
    // menos, hasta un mínimo; los que se repiten van apilados detrás arriba.
    // La franja nunca se alarga sin límite: el ancho lo manda la fila frontal.
    const MAX_FRONT = 8;
    const capOf = s => Math.max(3, MAX_FRONT - s);
    const sliceCards = [];
    let rest = cards.slice();
    for (let s = 0; rest.length; s++) {
      sliceCards.push(rest.slice(0, capOf(s)));
      rest = rest.slice(capOf(s));
    }
    // Índice global en la franja: cada figura guarda su data-midx para poder
    // sincronizar el hover/click con la card equivalente del grid (mismo orden).
    const figHtml = (card, gi) => {
      const img = card.querySelector('.member-photo');
      const src = img ? (img.getAttribute('src') || '') : '';
      const letter = card.querySelector('.member-photo-placeholder')?.textContent || '?';
      const name = card.querySelector('.member-card-info h3')?.textContent || '';
      return `<figure class="member-strip-fig" data-midx="${gi}">
        ${src
          ? `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy">`
          : `<div class="member-strip-pholder">${esc(letter)}</div>`}
      </figure>`;
    };
    let gi = 0;
    const stripHtml =
      `<div class="members-group-strip">` +
      sliceCards.map((layer, s) =>
        `<div class="members-strip-slice ${s === 0 ? 'slice-front' : 'slice-back slice-back-' + s}">` +
        layer.map(card => figHtml(card, gi++)).join('') +
        `</div>`
      ).join('') +
      `</div>`;

    group.innerHTML =
      headHtml +
      stripHtml +
      `<div class="members-group-grid">` +
      cards.map((card, i) => {
        const img = card.querySelector('.member-photo');
        const src = img ? (img.getAttribute('src') || '') : '';
        const letter = card.querySelector('.member-photo-placeholder')?.textContent || '?';
        const role = card.querySelector('.member-role')?.textContent || 'MIEMBRO';
        const name = card.querySelector('.member-card-info h3')?.textContent || '';
        const index = card.querySelector('.member-index')?.textContent || '--';
        return `<figure class="member-group-cell" data-midx="${i}" tabindex="0" role="button" aria-label="${esc(name)} — ir a su sección">
          <div class="member-group-photo">
            ${src
            ? `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy">`
            : `<div class="member-group-pholder">${esc(letter)}</div>`}
            <span class="member-group-index">${esc(index)}</span>
          </div>
          <figcaption>
            <span class="member-group-role">${esc(role)}</span>
            <strong>${esc(name)}</strong>
          </figcaption>
        </figure>`;
      }).join('') +
      `</div>`;

    // Interacción hover/click (independiente de la animación de entrada).
    wireGrid(group);

    if (prefersReduced() || !isReady()) return;

    const headEls = [...group.querySelectorAll('.members-group-head > *')];
    const cells = [...group.querySelectorAll('.member-group-cell')];
    const stripFigs = [...group.querySelectorAll('.member-strip-fig')];
    const slices = [...group.querySelectorAll('.members-strip-slice')];
    gsap.set([...headEls, ...cells], { autoAlpha: 0, y: 46 });
    // La franja llega lateral, como si cada miembro diera un paso al frente.
    gsap.set(stripFigs, { autoAlpha: 0, x: 70, rotate: 0 });

    // Índice de figura → índice de capa (slice) en la que vive.
    const figSlice = [];
    let f = 0;
    sliceCards.forEach((layer, s) => {
      layer.forEach((_, j) => { figSlice.push({ slice: s, idx: j }); });
    });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: group, start: 'top 86%', toggleActions: 'play none none none' }
    });
    tls.push(tl);
    // El gradiente vertical (delante abajo, atrás más arriba capa a capa) y el
    // tamaño decreciente lo resuelve el CSS por capa; GSAP solo hace la entrada.
    gsap.set(slices, { autoAlpha: 0, y: 40 });
    tl.to(headEls, { autoAlpha: 1, y: 0, duration: .7, stagger: .1, ease: 'power3.out' })
      .to(slices, { autoAlpha: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out' }, '-=.25')
      .to(stripFigs, {
        autoAlpha: 1, x: 0,
        rotate: i => figSlice[i].slice === 0 ? (figSlice[i].idx % 2 ? .9 : -.9) : -1.8,
        duration: .8, stagger: .06, ease: 'power3.out'
      }, '-=1.2')
      .to(cells, { autoAlpha: 1, y: 0, duration: .75, stagger: .08, ease: 'power3.out' }, '-=.4');
  }

  // ---- Construcción del pin maestro --------------------------------
  function buildMaster(cards) {
    // GUARD DE VISIBILIDAD: nunca medir ni pinear un elemento que está en
    // display:none (las medidas quedarían en 0 y el pin se rompe). Si la
    // vista aún no está visible, reintentamos en el siguiente tick.
    const view = document.getElementById('view-members');
    if (!view || !view.classList.contains('active') || getComputedStyle(view).display === 'none') {
      if (hiddenRetries < 40) {
        hiddenRetries++;
        scheduleInit();
      }
      return;
    }

    // Limpieza total ANTES de volver a calcular (revert en vez de kill simple).
    reset();

    // Neutralizar la animación/transform del contenedor: kidzViewIn usa
    // transform + fill-mode:both, y un ancestro transformado anula el
    // position:fixed que GSAP aplica al pinear. Forzamos por inline.
    view.style.animation = 'none';
    view.style.transform = 'none';

    const grid = document.getElementById('membersGrid');
    if (!grid) return;

    const cinematic = !prefersReduced();
    buildCollage(cards, cinematic);
    if (!cards.length) return;
    prevCards = cards;
    // Contexto para el click del collage: sin pin todavía → scroll estático a la card.
    pinFlags = { pinned: false, cards, n: cards.length, snapPoints: [], st: null };

    if (!cinematic) {
      setCinematic(false);
      return;
    }
    setCinematic(true);

    // Reflow fresco tras aplicar .kidz-cinematic (el grid pasa a 100vh).
    void grid.offsetHeight;

    const n = cards.length;
    // Ritmo más lento: cada miembro ocupa ~1.6 alturas de ventana de scroll,
    // con entradas más largas y pausa final. La transición ya no se "macanea".
    const step = 1.6;
    const dur = 1.2;
    const hold = 1.0;
    // Presupuesto de scroll de la intro inicial (en unidades).
    const introUnits = 2.4;
    // Fase final "TODOS JUNTOS": swipe lateral del último miembro + entrada
    // lateral del titular + pausa. Por encima del hold del último miembro.
    const finalUnits = 2.0;

    // Single member: simple strong reveal, no pin.
    if (n === 1) {
      const card = cards[0];
      gsap.set(card, { autoAlpha: 0, y: 60 });
      gsap.set(card.querySelectorAll('.member-card-info > *, .member-index'), { autoAlpha: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 78%', toggleActions: 'play none none reverse' }
      });
      tl.to(card, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' })
        .to(card.querySelectorAll('.member-card-info > *, .member-index'), {
          autoAlpha: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out'
        }, '-.5');

      return;
    }

    // ----- Pantalla intro animada (ocupa la primera pantalla del pin) -----
    let intro = grid.querySelector('.members-intro');
    if (!intro) {
      intro = document.createElement('div');
      intro.className = 'members-intro';
      intro.innerHTML = `
        <span class="members-intro-kicker">KIDZ // CREW</span>
        <h3 class="members-intro-title">
          <span class="mi-line"><span>LA</span></span>
          <span class="mi-line"><span>FAMILIA.</span></span>
        </h3>
        <p class="members-intro-sub">Un miembro a la vez: recorré la crew completa de Kidz.</p>`;
      grid.appendChild(intro);
    }
    const introTitle = [...intro.querySelectorAll('.mi-line > span')];
    const introKicker = intro.querySelector('.members-intro-kicker');
    const introSub = intro.querySelector('.members-intro-sub');
    // Estado inicial: el título entra con una máscara (línea tras línea),
    // kicker y subtítulo se esfuman con un deslizamiento suave.
    gsap.set(introTitle, { yPercent: 112, autoAlpha: 0 });
    gsap.set([introKicker, introSub], { autoAlpha: 0, y: 40 });

    // ----- Overlay final "TODOS JUNTOS" (entra en la última fase) -----
    let fin = grid.querySelector('.members-final');
    if (!fin) {
      fin = document.createElement('div');
      fin.className = 'members-final';
      fin.innerHTML = `
        <span class="members-final-kicker">KIDZ // CREW COMPLETA</span>
        <h3 class="members-final-title">TODOS<br>JUNTOS.</h3>`;
      grid.appendChild(fin);
    }
    const finalEls = [...fin.querySelectorAll('.members-final-kicker, .members-final-title')];
    gsap.set(fin, { autoAlpha: 0 });
    gsap.set(finalEls, { autoAlpha: 0, xPercent: -30, y: 26 });

    // ----- Master pinned sequence: one member per screen -----
    // La intro ocupa las primeras `introUnits`; a partir de ahí entran los
    // miembros cada `step` unidades. Tras el último miembro, la fase final
    // desliza el titular "TODOS JUNTOS" antes de desanclar.
    const base = introUnits;
    const lastIn = base + (n - 1) * step + dur; // último miembro, ya fijo
    const swipeStart = lastIn + hold;            // arranca el swipe lateral
    const totalUnits = swipeStart + finalUnits;

    const snapPoints = [];
    // Punto de reposo de la intro (ya revelada) para que al detenerse en la
    // primera pantalla no salte directo al primer miembro.
    snapPoints.push((base - .9) / totalUnits);
    for (let i = 0; i < n; i++) {
      // El snap cae justo cuando el miembro anterior terminó de salir
      // (entrance + dur + margen): se ve SOLO el miembro actual, sin rastro
      // del que quedaba desvaneciéndose detrás.
      snapPoints.push((base + i * step + dur + .05) / totalUnits);
    }
    // Descanso sobre el titular "TODOS JUNTOS." (fase final ya revelada).
    snapPoints.push((swipeStart + 1.3) / totalUnits);

    // Hidden initial states + z-index escalonado (las absolutas se apilan:
    // la que entra tiene mayor z que la que sale).
    cards.forEach((card, i) => {
      card.style.zIndex = String(i + 1);
      gsap.set(card.querySelectorAll('.member-card-info > *'), { autoAlpha: 0, y: 52 });
      gsap.set(card.querySelector('.member-index'), { autoAlpha: 0, y: 18 });
      gsap.set(card, { autoAlpha: 0 });
    });

    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    tls.push(tl);

    const st = ScrollTrigger.create({
      trigger: grid,
      start: 'top top',
      end: () => '+=' + Math.round(totalUnits * window.innerHeight),
      pin: true,
      pinType: 'transform',
      anticipatePin: 1,

      // 1. CAMBIA scrub: true POR UN NÚMERO (tiempo en segundos de suavizado)
      scrub: 1.2,

      snap: {
        snapTo: snapPoints,
        duration: .6,
        ease: 'power2.inOut',

        // 2. AUMENTA LIGERAMENTE EL DELAY
        // Para evitar que el snap pelee con la inercia del scrub numérico, 
        // dale un respiro (ej. 0.1 o 0.15) antes de forzar el punto.
        delay: 0.15
      },
      animation: tl
    });

    // Ahora sí: el click del collage puede saltar al turno pineado exacto.
    pinFlags.pinned = true;
    pinFlags.snapPoints = snapPoints;
    pinFlags.st = st;

    // --- FASE INTRO ---
    // Revelado máscara línea a línea del titular, con kicker, subtítulo
    // y la flecha que invita a bajar.
    tl.to(introTitle, {
      yPercent: 0, autoAlpha: 1, duration: 1, stagger: .13, ease: 'power3.out'
    }, .1)
      .to([introKicker, introSub], {
        autoAlpha: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out'
      }, .06)
      // La intro se desliza LATERAL hacia la izquierda mientras el primer
      // miembro entra desde la derecha (relevo horizontal).
      .to(intro, {
        xPercent: -100, autoAlpha: 0, duration: 1.2, ease: 'power3.inOut'
      }, base - .65);

    // --- FASE MIEMBROS ---
    cards.forEach((card, i) => {
      const entrance = base + i * step;

      if (i === 0) {
        // El primer miembro entra LATERAL desde la derecha (relevo con la intro).
        tl.fromTo(card, {
          autoAlpha: 0, xPercent: 100, scale: 1.04
        }, {
          autoAlpha: 1, xPercent: 0, scale: 1, duration: dur, ease: 'power3.inOut'
        }, entrance)
          .fromTo(card.querySelectorAll('.member-card-info > *'), {
            autoAlpha: 0, y: 52
          }, {
            autoAlpha: 1, y: 0, duration: .6, stagger: .09, ease: 'power3.out'
          }, entrance + .3)
          .fromTo(card.querySelector('.member-index'), {
            autoAlpha: 0, y: 18
          }, {
            autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out'
          }, entrance + .27);
      } else {
        tl.fromTo(card, {
          autoAlpha: 0, scale: 1.06, yPercent: 1
        }, {
          autoAlpha: 1, scale: 1, yPercent: 0, duration: dur, ease: 'power2.inOut'
        }, entrance)
          .fromTo(card.querySelectorAll('.member-card-info > *'), {
            autoAlpha: 0, y: 52
          }, {
            autoAlpha: 1, y: 0, duration: .6, stagger: .09, ease: 'power3.out'
          }, entrance + .3)
          .fromTo(card.querySelector('.member-index'), {
            autoAlpha: 0, y: 18
          }, {
            autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out'
          }, entrance + .27);
      }

      // Current card steps out while the next one steps in.
      if (i > 0) {
        tl.to(cards[i - 1], {
          autoAlpha: 0, scale: .94, duration: dur, ease: 'power2.inOut'
        }, entrance);
      }
    });

    // Breve pausa en el último miembro antes del swipe a "TODOS JUNTOS".
    tl.to({}, { duration: hold });

    // --- FASE FINAL: ÚLTIMO MIEMBRO → TODOS JUNTOS (lateral "volviendo") ---
    // El último miembro "vuelve" deslizándose hacia la derecha...
    tl.to(cards[n - 1], {
      xPercent: 100, autoAlpha: 0, duration: 1.05, ease: 'power3.inOut'
    }, swipeStart)
      // ...mientras el titular TODOS JUNTOS entra desde la izquierda.
      .set(fin, { autoAlpha: 1 }, swipeStart + .25)
      .fromTo(finalEls, {
        autoAlpha: 0, xPercent: -30, y: 26
      }, {
        autoAlpha: 1, xPercent: 0, y: 0, duration: 1, stagger: .12, ease: 'power3.inOut'
      }, swipeStart + .3)
      // Pausa sobre el título antes de desanclar.
      .to({}, { duration: finalUnits - 1.3 });

    hiddenRetries = 0;
  }

  function init() {
    if (!isReady()) return;
    gsap.registerPlugin(window.ScrollTrigger);

    const grid = document.getElementById('membersGrid');
    if (!grid) return;

    buildMaster([...grid.querySelectorAll('.member-card')]);
  }

  function playHero() {
    const hero = document.querySelector('#view-members .members-hero');
    if (!hero || hero.dataset.kidzHeroPlayed) return;
    hero.dataset.kidzHeroPlayed = '1';
    if (!isReady()) return;
    gsap.from(hero.querySelectorAll('.members-kicker, h2, p, .members-hero-scroll'), {
      y: 38,
      autoAlpha: 0,
      duration: .85,
      stagger: .1,
      ease: 'power3.out'
    });
  }

  // ---- Observadores ------------------------------------------------
  function watchView() {
    const view = document.getElementById('view-members');
    if (!view) return;

    const observer = new MutationObserver(() => {
      if (view.classList.contains('active')) {
        playHero();
        scheduleInit();
        scheduleRefresh();
      } else {
        // El usuario se fue de la pestaña: limpiar pins y wrappers.
        clearTimeout(reinitTimer);
        reinitTimer = 0;
        hiddenRetries = 0;
        reset();
      }
    });
    observer.observe(view, { attributes: true, attributeFilter: ['class'] });

    if (view.classList.contains('active')) {
      playHero();
      scheduleInit();
      scheduleRefresh();
    }
  }

  function watchGrid() {
    const grid = document.getElementById('membersGrid');
    const view = document.getElementById('view-members');
    if (!grid) return;
    let timer = 0;

    const observer = new MutationObserver((mutations) => {
      // Ignorar los cambios que produce el propio buildMaster al insertar o
      // quitar los overlays de intro/final: si no, cada re-init se
      // auto-dispararía en bucle. Solo reaccionamos a cambios de datos.
      const real = mutations.some(m =>
        [...m.addedNodes, ...m.removedNodes].some(node =>
          node.nodeType === 1 &&
          !node.classList.contains('members-intro') &&
          !node.classList.contains('members-final')
        )
      );
      if (!real) return;

      clearTimeout(timer);
      // Debounce generoso (140ms): da tiempo a que members.js inyecte los
      // datos de la base y a que el layout se asiente antes de recalcular.
      timer = setTimeout(() => {
        if (view && view.classList.contains('active')) {
          scheduleInit();
          scheduleRefresh();
        }
      }, 140);
    });
    observer.observe(grid, { childList: true });
  }

  function boot() {
    if (!isReady()) return;
    gsap.registerPlugin(window.ScrollTrigger);

    watchView();
    watchGrid();

    window.addEventListener('load', () => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      const view = document.getElementById('view-members');
      if (view && view.classList.contains('active')) scheduleInit();
    });

    // Seguridad: si GSAP se cargaba aún, reintentamos cuando aparezca.
    const checkReady = setInterval(() => {
      if (isReady()) {
        clearInterval(checkReady);
        const view = document.getElementById('view-members');
        if (view && view.classList.contains('active')) scheduleInit();
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();