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
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
