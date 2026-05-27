// 1. Configura tus credenciales de Supabase
const SUPABASE_URL = "https://rwancgtywwkhowkcvqpu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-g-s6xqJkEGZDrwpDj9GQg_0dnF7Pyw";

// 2. Inicializa el cliente de Supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);/* ═══════════════════════════════════════════════════════
   NEXUSFLOW — script.js
   ES6+ Native JavaScript — No dependencies
   Author: Jesús Roo / @jsusroo
═══════════════════════════════════════════════════════ */

'use strict';

// ── Utility ──────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

/* ══════════════════════════════════════════════════════
   1. PARTICLE CANVAS
══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;
  const COLORS = ['rgba(91,141,246,', 'rgba(240,165,0,', 'rgba(34,211,139,'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.vx = rand(-0.15, 0.15);
      this.vy = rand(-0.25, -0.05);
      this.r  = rand(1, 2.5);
      this.alpha = rand(0.06, 0.3);
      this.color = COLORS[Math.floor(rand(0, COLORS.length))];
      this.life = 0;
      this.maxLife = rand(300, 800);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      const fade = this.life < 60  ? this.life / 60 :
                   this.life > this.maxLife - 60 ? (this.maxLife - this.life) / 60 : 1;
      ctx.fillStyle = this.color + (this.alpha * fade) + ')';
      ctx.fill();
    }
  }

  // Connection lines
  function drawConnections() {
    const DIST = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91,141,246,${(1 - d / DIST) * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  resize();
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  loop();
  window.addEventListener('resize', resize);
})();


/* ══════════════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    trail.style.opacity  = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    trail.style.opacity  = '1';
  });

  function animTrail() {
    tx = lerp(tx, mx, 0.12);
    ty = lerp(ty, my, 0.12);
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();
})();


/* ══════════════════════════════════════════════════════
   3. NAVBAR SCROLL
══════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   4. HAMBURGER MENU
══════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn   = $('#hamburger');
  const links = $('#nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close on link click
  $$('.nav-link', links).forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════
   6. COUNTER ANIMATIONS
══════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1800, format = null) {
  const start = performance.now();
  const isFloat = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = eased * target;

    if (format) {
      el.textContent = format(current);
    } else if (isFloat) {
      el.textContent = current.toFixed(2);
    } else {
      el.textContent = Math.round(current).toLocaleString('es-ES');
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Hero stats
(function initHeroStats() {
  const stats = $$('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        animateCounter(el, target, 1600);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

// KPI counters
(function initKPICounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = target < 100;
        animateCounter(el, target, 2000, isDecimal ? v => (v / 100).toFixed(2) : null);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════
   7. HERO MINI CHART (Canvas)
══════════════════════════════════════════════════════ */
(function initHeroChart() {
  const canvas = $('#hero-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Responsive width
  function draw() {
    const W = canvas.offsetWidth;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = 120 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = [28, 42, 35, 55, 48, 70, 62, 80, 72, 90, 85, 95, 88, 100, 92, 108, 102, 115, 108, 125];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const padX = 12, padY = 10;
    const w = W - padX * 2;
    const h = 100;

    const xStep = w / (data.length - 1);
    const yScale = (v) => padY + h - ((v - min) / (max - min)) * h;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padY + (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Area gradient
    const grad = ctx.createLinearGradient(0, padY, 0, padY + h);
    grad.addColorStop(0, 'rgba(91,141,246,0.25)');
    grad.addColorStop(1, 'rgba(91,141,246,0)');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padX + i * xStep;
      const y = yScale(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(padX + (data.length - 1) * xStep, padY + h);
    ctx.lineTo(padX, padY + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padX + i * xStep;
      const y = yScale(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#5b8df6';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Last point dot
    const lx = padX + (data.length - 1) * xStep;
    const ly = yScale(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#5b8df6';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(91,141,246,0.2)';
    ctx.fill();
  }

  draw();
  window.addEventListener('resize', draw);
})();


/* ══════════════════════════════════════════════════════
   8. SPARKLINE (Feature card)
══════════════════════════════════════════════════════ */
(function initSparkline() {
  const canvas = $('#sparkline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    const W = canvas.offsetWidth;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = 50 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = [10, 25, 18, 42, 33, 55, 44, 60, 52, 70, 63, 78, 68, 85, 75, 90, 80, 95, 88, 100];
    const min = 0, max = 100;
    const h = 42, padX = 4, padY = 4;
    const xStep = (W - padX * 2) / (data.length - 1);
    const yScale = v => padY + h - ((v - min) / (max - min)) * h;

    // Amber line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padX + i * xStep;
      const y = yScale(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#f0a500';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  draw();
  window.addEventListener('resize', draw);
})();


/* ══════════════════════════════════════════════════════
   9. MAIN METRICS CHART (Interactive)
══════════════════════════════════════════════════════ */
(function initMainChart() {
  const canvas = $('#main-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Data sets for each range
  const datasets = {
    '7d': {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      exec:   [68000, 74000, 70000, 82000, 90000, 55000, 48000],
      err:    [120,   95,   140,   80,   60,   30,   22],
    },
    '30d': {
      labels: Array.from({length: 30}, (_, i) => `D${i+1}`),
      exec:   Array.from({length: 30}, (_, i) => 50000 + Math.sin(i * 0.4) * 20000 + rand(0, 15000)),
      err:    Array.from({length: 30}, (_, i) => 50 + rand(0, 150)),
    },
    '90d': {
      labels: Array.from({length: 12}, (_, i) => `S${i+1}`),
      exec:   Array.from({length: 12}, (_, i) => 400000 + Math.sin(i * 0.6) * 100000 + rand(0, 80000)),
      err:    Array.from({length: 12}, (_, i) => 300 + rand(0, 500)),
    },
    '1y': {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      exec:   [1800000, 2100000, 1950000, 2400000, 2200000, 2600000, 2800000, 3100000, 2900000, 3400000, 3200000, 3600000],
      err:    [800, 650, 900, 500, 750, 420, 380, 310, 450, 280, 320, 250],
    },
  };

  let currentRange = '7d';
  let tooltip = { visible: false, x: 0, y: 0, idx: -1 };

  function drawChart(range) {
    const d = datasets[range];
    const DPR = window.devicePixelRatio;
    const W = canvas.offsetWidth;
    const H = 260;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const padL = 48, padR = 20, padT = 16, padB = 36;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    const maxExec = Math.max(...d.exec) * 1.1;
    const maxErr  = Math.max(...d.err)  * 1.1;
    const n = d.labels.length;
    const barW = Math.max(4, (cW / n) * 0.5);

    // Background grid
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i <= 4; i++) {
      const y = padT + (cH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Y label
      const val = maxExec - (maxExec / 4) * i;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `${10 * 1}px 'DM Sans'`;
      ctx.textAlign = 'right';
      const label = val >= 1000000 ? (val/1000000).toFixed(1)+'M' : val >= 1000 ? (val/1000).toFixed(0)+'K' : val.toFixed(0);
      ctx.fillText(label, padL - 6, y + 4);
    }

    // Bars (executions)
    const barGrad = ctx.createLinearGradient(0, padT, 0, padT + cH);
    barGrad.addColorStop(0, 'rgba(91,141,246,0.8)');
    barGrad.addColorStop(1, 'rgba(91,141,246,0.1)');

    d.exec.forEach((v, i) => {
      const x = padL + (i / (n - 1)) * cW - barW / 2;
      const barH = (v / maxExec) * cH;
      const y = padT + cH - barH;

      // Hover highlight
      if (tooltip.visible && tooltip.idx === i) {
        ctx.fillStyle = 'rgba(91,141,246,0.15)';
        ctx.fillRect(padL + (i / (n-1)) * cW - barW - 8, padT, barW + 16, cH);
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fillStyle = barGrad;
      ctx.fill();
    });

    // Error line (secondary axis)
    ctx.beginPath();
    d.err.forEach((v, i) => {
      const x = padL + (i / (n - 1)) * cW;
      const y = padT + cH - (v / maxErr) * cH * 0.4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#f0a500';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.setLineDash([]);

    // Dots on error line
    d.err.forEach((v, i) => {
      const x = padL + (i / (n - 1)) * cW;
      const y = padT + cH - (v / maxErr) * cH * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f0a500';
      ctx.fill();
    });

    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${10}px 'DM Sans'`;
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(n / 10));
    d.labels.forEach((lbl, i) => {
      if (i % step !== 0 && i !== n - 1) return;
      const x = padL + (i / (n - 1)) * cW;
      ctx.fillText(lbl, x, H - 8);
    });

    // Tooltip
    if (tooltip.visible && tooltip.idx >= 0) {
      const i = tooltip.idx;
      const x = padL + (i / (n - 1)) * cW;
      const execVal = d.exec[i];
      const errVal  = d.err[i];
      const tw = 130, th = 58, tr = 6;
      let tx = x - tw / 2;
      tx = clamp(tx, padL, W - padR - tw);
      const ty = padT + 4;

      ctx.fillStyle = 'rgba(13,17,23,0.95)';
      ctx.strokeStyle = 'rgba(91,141,246,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, tr);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#5b8df6';
      ctx.font = `bold 11px 'DM Sans'`;
      ctx.textAlign = 'left';
      const execLabel = execVal >= 1000000 ? (execVal/1000000).toFixed(2)+'M' : execVal >= 1000 ? (execVal/1000).toFixed(1)+'K' : execVal;
      ctx.fillText(`Ejec: ${execLabel}`, tx + 10, ty + 20);
      ctx.fillStyle = '#f0a500';
      ctx.fillText(`Errores: ${errVal}`, tx + 10, ty + 38);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = `10px 'DM Sans'`;
      ctx.fillText(d.labels[i], tx + 10, ty + 52);
    }
  }

  // Mouse interaction
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const d = datasets[currentRange];
    const n = d.labels.length;
    const padL = 48, padR = 20;
    const cW = rect.width - padL - padR;
    let closest = -1, minDist = 999;
    for (let i = 0; i < n; i++) {
      const x = padL + (i / (n - 1)) * cW;
      const dist = Math.abs(mx - x);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    tooltip = { visible: true, x: mx, y: e.clientY - rect.top, idx: closest };
    drawChart(currentRange);
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip = { visible: false, x: 0, y: 0, idx: -1 };
    drawChart(currentRange);
  });

  // Range tab switching
  $$('.range-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.range-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRange = btn.dataset.range;
      tooltip.idx = -1;
      drawChart(currentRange);
    });
  });

  // IntersectionObserver to draw when visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      drawChart(currentRange);
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(canvas);

  window.addEventListener('resize', () => drawChart(currentRange));
})();


/* ══════════════════════════════════════════════════════
   10. PRICING TOGGLE
══════════════════════════════════════════════════════ */
(function initPricingToggle() {
  const toggleBtn = $('#billing-toggle');
  if (!toggleBtn) return;
  let isAnnual = false;

  function updatePrices() {
    $$('.price-num').forEach(el => {
      const monthly = el.dataset.monthly;
      const annual  = el.dataset.annual;
      if (!monthly || !annual) return;
      if (monthly === 'Custom') { el.textContent = 'Custom'; return; }
      const val = isAnnual ? annual : monthly;
      el.style.transition = 'opacity 0.2s';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = val;
        el.style.opacity = '1';
      }, 180);
    });
    const labelAnnual   = $('#label-annual');
    const labelMonthly  = $('#label-monthly');
    if (labelAnnual)  labelAnnual.style.color  = isAnnual ? 'var(--text-primary)' : '';
    if (labelMonthly) labelMonthly.style.color = isAnnual ? '' : 'var(--text-primary)';
  }

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggleBtn.classList.toggle('active', isAnnual);
    updatePrices();
  });
})();


/* ══════════════════════════════════════════════════════
   11. INTEGRATIONS FILTER GRID
══════════════════════════════════════════════════════ */
(function initIntegrations() {
  const grid = $('#integration-grid');
  if (!grid) return;

  const integrations = [
    { name: 'Salesforce', icon: '☁️', cat: 'crm' },
    { name: 'HubSpot',    icon: '🎯', cat: 'crm' },
    { name: 'Pipedrive',  icon: '🔄', cat: 'crm' },
    { name: 'Slack',      icon: '💬', cat: 'comunicacion' },
    { name: 'Teams',      icon: '📘', cat: 'comunicacion' },
    { name: 'Discord',    icon: '🟣', cat: 'comunicacion' },
    { name: 'Stripe',     icon: '💳', cat: 'pago' },
    { name: 'PayPal',     icon: '🅿️', cat: 'pago' },
    { name: 'Braintree',  icon: '💵', cat: 'pago' },
    { name: 'BigQuery',   icon: '📊', cat: 'datos' },
    { name: 'Snowflake',  icon: '❄️', cat: 'datos' },
    { name: 'Postgres',   icon: '🐘', cat: 'datos' },
    { name: 'GPT-4o',     icon: '🤖', cat: 'ia' },
    { name: 'Claude',     icon: '🧠', cat: 'ia' },
    { name: 'Gemini',     icon: '✨', cat: 'ia' },
    { name: 'Notion',     icon: '📝', cat: 'comunicacion' },
    { name: 'Shopify',    icon: '🛍️', cat: 'pago' },
    { name: 'Airtable',   icon: '📋', cat: 'datos' },
  ];

  function render(filter) {
    const items = filter === 'all' ? integrations : integrations.filter(i => i.cat === filter);
    grid.innerHTML = '';
    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'integration-item';
      el.style.animationDelay = `${idx * 40}ms`;
      el.innerHTML = `
        <span class="integration-icon">${item.icon}</span>
        <span class="integration-name">${item.name}</span>
        <span class="integration-cat">${item.cat}</span>
      `;
      grid.appendChild(el);
    });
  }

  render('all');

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.cat);
    });
  });
})();


/* ══════════════════════════════════════════════════════
   12. TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════════ */
(function initTestimonials() {
  const inner = $('#testimonials-inner');
  const prevBtn = $('#testi-prev');
  const nextBtn = $('#testi-next');
  const dotsContainer = $('#testi-dots');
  if (!inner) return;

  const cards = $$('.testimonial-card', inner);
  let current = 0;
  let perPage = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const total = cards.length;
  const maxIdx = Math.max(0, total - perPage);

  // Build dots
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsContainer.appendChild(dot);
    }
  }

  function go(idx) {
    current = clamp(idx, 0, maxIdx);
    const cardW = cards[0].offsetWidth + 16; // gap = 16
    inner.style.transform = `translateX(-${current * cardW}px)`;
    buildDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));

  // Auto-advance
  let autoplay = setInterval(() => go(current < maxIdx ? current + 1 : 0), 5000);
  inner.addEventListener('mouseenter', () => clearInterval(autoplay));
  inner.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => go(current < maxIdx ? current + 1 : 0), 5000);
  });

  window.addEventListener('resize', () => {
    perPage = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    go(0);
  });

  buildDots();
})();


/* ══════════════════════════════════════════════════════
   13. LIVE ACTIVITY FEED (Hero)
══════════════════════════════════════════════════════ */
(function initActivityFeed() {
  const items = ['act-1', 'act-2', 'act-3'].map(id => $('#' + id));
  if (!items[0]) return;

  let idx = 0;
  setInterval(() => {
    items.forEach(el => el && el.classList.remove('pulse'));
    const el = items[idx % items.length];
    if (el) {
      el.classList.add('pulse');
      // Update time
      const timeEl = el.querySelector('.activity-time');
      if (timeEl) {
        timeEl.textContent = idx === 0 ? 'ahora' : `${(idx % 10 + 1) * 2}s`;
      }
    }
    idx++;
  }, 2200);
})();


/* ══════════════════════════════════════════════════════
   14. SMOOTH ANCHOR SCROLL (override default)
══════════════════════════════════════════════════════ */
(function initAnchorScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = $(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════
   15. HERO CHART ANIMATED LINE REVEAL
══════════════════════════════════════════════════════ */
(function initHeroChartReveal() {
  // After page load, re-trigger hero chart draw with animation
  window.addEventListener('load', () => {
    const canvas = $('#hero-chart');
    if (!canvas) return;
    // Already drawn by initHeroChart; just ensure it's sized
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  });
})();


/* ══════════════════════════════════════════════════════
   16. NAVBAR ACTIVE LINK ON SCROLL
══════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


/* ══════════════════════════════════════════════════════
   17. FEATURE CARD TILT EFFECT
══════════════════════════════════════════════════════ */
(function initCardTilt() {
  $$('.feature-card, .price-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      card.style.transform = `translateY(-3px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════
   18. DASHBOARD HERO NUMBERS LIVE UPDATE
══════════════════════════════════════════════════════ */
(function initDashLive() {
  const vals = [
    { el: $('.dash-value', $('.dash-card:nth-child(1)')), base: 2847 },
    { el: $('.dash-value', $('.dash-card:nth-child(2)')), base: 18.2, isFloat: true, suffix: 'K' },
  ];

  setInterval(() => {
    vals.forEach(({ el, base, isFloat, suffix }) => {
      if (!el) return;
      const jitter = rand(-3, 5);
      const val = base + jitter;
      el.textContent = isFloat
        ? val.toFixed(1) + (suffix || '')
        : Math.round(val).toLocaleString('es-ES');
    });
  }, 3000);
})();

/* ══════════════════════════════════════════════════════
   INIT COMPLETE
══════════════════════════════════════════════════════ */
console.log('%cNexusFlow — Diseñado por Jesús Roo (@jsusroo)', 'color:#5b8df6;font-size:13px;font-weight:bold;');
 // 3. Escuchar el evento de registro del formulario
document.getElementById('tu-formulario-id').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Capturar lo que el usuario escribió en la pantalla
    const email = document.getElementById('tu-input-email').value;
    const password = document.getElementById('tu-input-password').value;
    const nombre = document.getElementById('tu-input-nombre').value;

    // Insertar los datos en la tabla de Supabase
    const { data, error } = await supabase
        .from('usuarios')
        .insert([
            { nombre: nombre, email: email, password: password }
        ]);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('¡Usuario registrado con éxito en NexusFlow!');
        document.getElementById('tu-formulario-id').reset(); 
    }
});
