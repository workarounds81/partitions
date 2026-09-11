/* ============================================================
   partitionwork.com — behaviour
   Plain JS, no dependencies, no build step.
   You shouldn't need to edit this file — edit config.js instead.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.SITE || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- WhatsApp / email / config injection ---------- */
  function waLink(message) {
    var num = String(CFG.whatsapp || '').replace(/\D/g, '');
    var txt = encodeURIComponent(message || CFG.whatsappMessage || '');
    return 'https://wa.me/' + num + (txt ? '?text=' + txt : '');
  }

  function applyConfig() {
    $$('[data-site]').forEach(function (el) {
      var v = CFG[el.getAttribute('data-site')];
      if (v) el.textContent = v;
    });
    $$('[data-site-text]').forEach(function (el) {
      var v = CFG[el.getAttribute('data-site-text')];
      if (v) el.textContent = v;
    });
    $$('[data-wa-link]').forEach(function (el) {
      el.href = waLink();
      el.target = '_blank';
      el.rel = 'noopener';
    });
    $$('[data-email-link]').forEach(function (el) {
      if (CFG.email) el.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Quote enquiry via website');
    });
    if (CFG.uen) {
      var uen = $('[data-uen]');
      if (uen) { uen.textContent = 'UEN ' + CFG.uen; uen.hidden = false; }
    }
    var yr = $('#year');
    if (yr) yr.textContent = new Date().getFullYear();
    if (CFG.name) document.title = CFG.name + ' — Partition Walls, Painting & Ceiling Specialists in Singapore';
  }

  /* ---------- Header state + scroll progress ---------- */
  function initHeader() {
    var header = $('#siteHeader');
    var bar = $('#scrollProgress');
    var ticking = false;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle('is-stuck', y > 8);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var burger = $('#hamburger');
    var nav = $('#nav');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 880) close(); });
  }

  /* ---------- Reveal on scroll + number counters ---------- */
  function initReveal() {
    var items = $$('.reveal');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduce) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      $$('[data-count]').forEach(function (el) { setCount(el, +el.getAttribute('data-count')); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('[data-count]', entry.target).concat(
          entry.target.hasAttribute('data-count') ? [entry.target] : []
        ).forEach(runCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });
    $$('.step').forEach(function (el) { io.observe(el); });
  }

  function setCount(el, value) {
    el.textContent = (el.getAttribute('data-prefix') || '') + value + (el.getAttribute('data-suffix') || '');
  }

  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = +el.getAttribute('data-count');
    if (!target) { setCount(el, 0); return; }
    var start = performance.now();
    var dur = 1100;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      setCount(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- Hero carousel ---------- */
  function initHeroCarousel() {
    var root = $('#heroCarousel');
    if (!root) return;
    var track = $('.hc-track', root);
    var slides = $$('.hc-slide', root);
    var dots = $$('.hc-dot', root);
    var prevBtn = $('.hc-prev', root);
    var nextBtn = $('.hc-next', root);
    var n = slides.length;
    if (n < 2) return;
    var i = 0;
    var timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(idx) {
      i = (idx + n) % n;
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, di) {
        var on = di === i;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', String(on));
      });
    }
    function next() { show(i + 1); }
    function prev() { show(i - 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() { if (reduce) return; stop(); timer = setInterval(next, 5000); }

    nextBtn.addEventListener('click', function () { next(); play(); });
    prevBtn.addEventListener('click', function () { prev(); play(); });
    dots.forEach(function (d, di) { d.addEventListener('click', function () { show(di); play(); }); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', play);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); play(); }
      if (e.key === 'ArrowRight') { next(); play(); }
    });

    // Swipe on touch — a hero carousel that only responds to a mouse
    // is a broken carousel on the phones most visitors will use.
    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; stop(); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      touchX = null;
      play();
    }, { passive: true });

    show(0);
    play();
  }

  /* ---------- Before / after slider ---------- */
  function initBeforeAfter() {
    var range = $('#baRange'), before = $('#baBefore'), handle = $('#baHandle');
    if (!range) return;
    function set(v) {
      before.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    }
    range.addEventListener('input', function () { set(+range.value); });
    set(+range.value);
  }

  /* ---------- Gallery filter ---------- */
  function initFilters() {
    var buttons = $$('.filter');
    var shots = $$('.shot');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        shots.forEach(function (s) {
          s.hidden = !(cat === 'all' || s.getAttribute('data-cat') === cat);
        });
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    $$('.faq-q').forEach(function (btn) {
      var panel = btn.nextElementSibling;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        // close siblings for a tidy single-open accordion
        $$('.faq-q').forEach(function (other) {
          if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
            other.setAttribute('aria-expanded', 'false');
            other.nextElementSibling.style.height = '0px';
          }
        });
        btn.setAttribute('aria-expanded', String(!open));
        panel.style.height = open ? '0px' : panel.scrollHeight + 'px';
      });
    });
    window.addEventListener('resize', function () {
      $$('.faq-q').forEach(function (btn) {
        if (btn.getAttribute('aria-expanded') === 'true') {
          btn.nextElementSibling.style.height = btn.nextElementSibling.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Scope builder ---------- */
  function initBuilder() {
    var root = $('#builder');
    if (!root) return;

    var steps   = $$('.bstep', root);
    var fill    = $('#builderFill');
    var now     = $('#stepNow');
    var total   = $('#stepTotal');
    var prevBtn = $('#bPrev');
    var nextBtn = $('#bNext');
    var result  = $('#builderResult');
    var summary = $('#summaryText');
    var stepsBox = $('#builderSteps');
    var i = 0;

    total.textContent = steps.length;

    var LABELS = {
      property: 'Property',
      services: 'Work needed',
      scale: 'Size of job',
      timing: 'Timeline',
      drawings: 'Drawings'
    };

    function show(n) {
      i = n;
      steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === n); });
      now.textContent = n + 1;
      fill.style.width = ((n + 1) / steps.length) * 100 + '%';
      prevBtn.disabled = n === 0;
      nextBtn.textContent = n === steps.length - 1 ? 'See my summary' : 'Next';
    }

    function answersFor(step) {
      return $$('input:checked', step).map(function (input) { return input.value; });
    }

    function build() {
      var lines = ['My project:'];
      steps.forEach(function (step) {
        var key = step.getAttribute('data-key');
        var vals = answersFor(step);
        if (vals.length) lines.push('• ' + LABELS[key] + ': ' + vals.join(', '));
      });
      if (lines.length === 1) lines.push('• (No answers selected yet)');
      lines.push('');
      lines.push('Please send me a quote. Thanks!');
      return lines.join('\n');
    }

    nextBtn.addEventListener('click', function () {
      if (i < steps.length - 1) { show(i + 1); return; }
      var text = build();
      summary.textContent = text;
      stepsBox.hidden = true;
      $('.builder-bar', root).hidden = true;
      $('.builder-count', root).hidden = true;
      $('.builder-nav', root).hidden = true;
      result.hidden = false;
      result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      var waBtn = $('#toWhatsapp');
      if (waBtn) waBtn.href = waLink(text);

      var msg = $('#f-message');
      if (msg) msg.value = text;
      var propSel = $('#f-property');
      var prop = answersFor(steps[0])[0];
      if (propSel && prop) {
        $$('option', propSel).forEach(function (o) {
          if (o.textContent.toLowerCase().indexOf(prop.split(' ')[0].toLowerCase()) === 0) propSel.value = o.value || o.textContent;
        });
      }
      answersFor(steps[1]).forEach(function (v) {
        var box = $$('input[name="work_needed"]').filter(function (b) { return b.value === v; })[0];
        if (box) box.checked = true;
      });
    });

    prevBtn.addEventListener('click', function () { if (i > 0) show(i - 1); });

    $('#bReset').addEventListener('click', function () {
      $$('input', stepsBox).forEach(function (input) { input.checked = false; });
      stepsBox.hidden = false;
      $('.builder-bar', root).hidden = false;
      $('.builder-count', root).hidden = false;
      $('.builder-nav', root).hidden = false;
      result.hidden = true;
      show(0);
      root.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    // Picking a radio moves you along — feels quick, doesn't trap you
    steps.forEach(function (step, idx) {
      $$('input[type="radio"]', step).forEach(function (input) {
        input.addEventListener('change', function () {
          if (idx < steps.length - 1) setTimeout(function () { show(idx + 1); }, 220);
        });
      });
    });

    show(0);
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    var img = $('#lbImg'), cap = $('#lbCap'), count = $('#lbCount');
    var closeBtn = $('#lbClose'), prevBtn = $('#lbPrev'), nextBtn = $('#lbNext');
    var set = [], idx = 0, lastFocus = null;

    function heroItems() {
      return $$('.hc-slide img').map(function (im) {
        return { src: im.currentSrc || im.src, alt: im.alt, title: '', sub: im.alt };
      });
    }
    // Only the shots currently passing the filter, so prev/next doesn't
    // wander through hidden cards.
    function galleryItems() {
      return $$('.shot').filter(function (f) { return !f.hidden; }).map(function (f) {
        var im = $('.shot-img', f), t = $('figcaption strong', f), sub = $('figcaption span', f);
        return {
          src: im ? im.src : '', alt: im ? im.alt : '',
          title: t ? t.textContent : '', sub: sub ? sub.textContent : ''
        };
      });
    }

    function render() {
      var it = set[idx];
      if (!it) return;
      img.src = it.src;
      img.alt = it.alt || '';
      cap.textContent = '';
      if (it.title) {
        var st = document.createElement('strong');
        st.textContent = it.title;
        cap.appendChild(st);
      }
      if (it.sub) {
        var sp = document.createElement('span');
        sp.textContent = it.sub;
        cap.appendChild(sp);
      }
      count.textContent = (idx + 1) + ' / ' + set.length;
      var many = set.length > 1;
      prevBtn.hidden = !many;
      nextBtn.hidden = !many;
      count.hidden = !many;
    }

    function open(items, i) {
      if (!items.length) return;
      set = items;
      idx = Math.max(0, Math.min(i, items.length - 1));
      lastFocus = document.activeElement;
      lb.hidden = false;
      lb.classList.add('is-open');
      document.body.classList.add('lb-open');
      render();
      closeBtn.focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.hidden = true;
      document.body.classList.remove('lb-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function step(d) {
      if (!set.length) return;
      idx = (idx + d + set.length) % set.length;
      render();
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    function wire(im, build) {
      im.setAttribute('tabindex', '0');
      function go() {
        var items = build();
        var i = 0;
        for (var k = 0; k < items.length; k++) {
          if (items[k].src === (im.currentSrc || im.src)) { i = k; break; }
        }
        open(items, i);
      }
      im.addEventListener('click', go);
      im.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    }
    $$('.hc-slide img').forEach(function (im) { wire(im, heroItems); });
    $$('.shot-img').forEach(function (im) { wire(im, galleryItems); });
  }

  /* ---------- Floorplan trace behind the page ---------- */
  function initFloorPlan() {
    var cv = $('#sitePlan');
    var data = window.FLOORPLAN;
    if (!cv || !data || !data.r || !data.r.length) return;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var runs = data.r, g = data.g, count = runs.length / 3;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var INK = '#0E1620', ACCENT = '#E8562A';
    var DRAW_MS = 5200, ALPHA = 0.2;

    // The plan is painted once at source resolution onto an offscreen
    // canvas, then scaled up per frame. Run-length rectangles butt against
    // each other, so it reads as continuous line work, and scaling one
    // bitmap is far cheaper than re-stroking 2,700 runs every frame.
    var plan = document.createElement('canvas');
    plan.width = g; plan.height = g;
    var pctx = plan.getContext('2d');
    pctx.fillStyle = INK;
    for (var i = 0; i < count; i++) {
      pctx.fillRect(runs[i * 3], runs[i * 3 + 1], runs[i * 3 + 2], 1);
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, size = 0, baseX = 0, baseY = 0;
    var progress = 0, phase = 'draw';
    var mx = 0, my = 0, ox = 0, oy = 0, boost = 0, scrollY = 0;
    var raf = null, last = 0;

    function layout() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;

      // Sized to sit fully inside the viewport — the whole plan is readable
      // rather than cropped at the edges.
      var narrow = W < 900;
      size = narrow ? Math.min(W * 0.8, H * 0.46) : Math.min(W * 0.38, H * 0.62);
      size = Math.max(210, Math.min(size, 580));
      baseX = (narrow ? W * 0.5 : W * 0.66) - size / 2;
      baseY = H * 0.5 - size / 2;
    }

    function paint() {
      var x = baseX + ox, y = baseY + oy - scrollY * 0.02;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = ALPHA;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, size * progress, size);
      ctx.clip();
      ctx.drawImage(plan, x, y, size, size);
      ctx.restore();

      if (phase === 'draw' && progress > 0.01 && progress < 0.99) {
        var edge = x + size * progress;
        var grad = ctx.createLinearGradient(edge - 44, 0, edge, 0);
        grad.addColorStop(0, 'rgba(232,86,42,0)');
        grad.addColorStop(1, 'rgba(232,86,42,.5)');
        ctx.globalAlpha = 0.34;
        ctx.fillStyle = grad;
        ctx.fillRect(edge - 44, y, 44, size);
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      if (!last) last = t;
      var dt = Math.min(t - last, 50);
      last = t;

      if (phase === 'draw') {
        progress += (dt * (1 + boost)) / DRAW_MS;
        if (progress >= 1) { progress = 1; phase = 'done'; }
      }
      boost *= 0.94;

      ox += (mx - ox) * 0.06;
      oy += (my - oy) * 0.06;
      paint();
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    document.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * -30;
      my = (e.clientY / window.innerHeight - 0.5) * -20;
      boost = Math.min(boost + 0.2, 1.4);
    }, { passive: true });

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY || document.documentElement.scrollTop;
    }, { passive: true });

    // Don't burn a rAF loop on a tab nobody is looking at.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { layout(); paint(); }, 180);
    });

    layout();
    if (reduce) { progress = 1; phase = 'done'; paint(); return; }
    start();
  }

  /* ---------- Enquiry form ---------- */
  function initForm() {
    var form = $('#enquiryForm');
    if (!form) return;
    var status = $('#formStatus');
    var btn = $('#submitBtn');

    function setError(id, message) {
      var input = document.getElementById(id);
      var slot = $('[data-err-for="' + id + '"]');
      if (slot) slot.textContent = message || '';
      if (input) input.classList.toggle('is-invalid', !!message);
      return !message;
    }

    function validate() {
      var ok = true;
      var name = $('#f-name').value.trim();
      var phone = $('#f-phone').value.trim();
      var email = $('#f-email').value.trim();
      var msg = $('#f-message').value.trim();

      ok = setError('f-name', name ? '' : 'Please tell us your name.') && ok;
      ok = setError('f-phone', /^[0-9+()\s-]{7,}$/.test(phone) ? '' : 'Please enter a contactable number.') && ok;
      ok = setError('f-email', (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? '' : 'That email address looks incomplete.') && ok;
      ok = setError('f-message', msg.length >= 10 ? '' : 'A sentence or two about the job helps us quote faster.') && ok;
      ok = setError('f-consent', $('#f-consent').checked ? '' : 'Please tick the box so we can reply to you.') && ok;
      return ok;
    }

    ['f-name', 'f-phone', 'f-email', 'f-message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { if (el.classList.contains('is-invalid')) validate(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      if (!validate()) {
        status.className = 'form-status bad';
        status.textContent = 'Please check the highlighted fields above.';
        return;
      }

      if (!CFG.formspreeId || CFG.formspreeId === 'XXXXXXX') {
        status.className = 'form-status bad';
        status.textContent = 'The form isn’t connected yet. Add your Formspree ID in assets/js/config.js, or reach us on WhatsApp in the meantime.';
        return;
      }

      var data = new FormData(form);
      data.append('work_needed_list', $$('input[name="work_needed"]:checked').map(function (c) { return c.value; }).join(', '));
      data.append('_subject', 'New quote enquiry from ' + (CFG.domain || 'the website'));

      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch('https://formspree.io/f/' + CFG.formspreeId, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) return res.json().then(function (j) { throw new Error((j.errors && j.errors[0] && j.errors[0].message) || 'Submission failed'); });
          form.innerHTML =
            '<div class="form-success">' +
            '<h3>Thanks — we’ve got it.</h3>' +
            '<p>We’ll be in touch within one working day, usually sooner. If your job is urgent, or you’ve got drawings to send, message us on WhatsApp and we’ll pick it up straight away.</p>' +
            '<a class="btn btn-wa btn-lg" target="_blank" rel="noopener" href="' + waLink() + '">Continue on WhatsApp</a>' +
            '</div>';
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = 'Send my enquiry';
          status.className = 'form-status bad';
          status.textContent = 'Sorry — that didn’t go through (' + err.message + '). Please WhatsApp or email us instead.';
        });
    });
  }

  /* ---------- Go ---------- */
  function init() {
    applyConfig();
    initHeader();
    initNav();
    initReveal();
    initHeroCarousel();
    initBeforeAfter();
    initFilters();
    initFaq();
    initBuilder();
    initLightbox();
    initFloorPlan();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
