/* ============================================================
   app.js — Cosmic Library Frontend v2
   Connects to FastAPI backend at http://127.0.0.1:8000
   ============================================================ */

const API = 'http://127.0.0.1:8000';

/* ---- STATE ---- */
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  books: [],
  categories: [],
  borrows: [],
  history: [],        // navigation history for back button
  currentView: 'home',
};

/* ============================================================
   DEEP SPACE BG CANVAS
   ============================================================ */
(function initBg() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], nebulae = [], shooters = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNebulae();
  }

  function buildNebulae() {
    nebulae = [
      { x: W*0.15, y: H*0.2,  rx: W*0.38, ry: H*0.35, hue: 270, a: 0.18 },
      { x: W*0.85, y: H*0.75, rx: W*0.32, ry: H*0.30, hue: 240, a: 0.14 },
      { x: W*0.55, y: H*0.45, rx: W*0.20, ry: H*0.22, hue: 290, a: 0.10 },
    ];
    buildStars();
  }

  function buildStars() {
    stars = [];
    const n = Math.floor((W * H) / 2400);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.2,
        a: Math.random(),
        da: (0.003 + Math.random() * 0.007) * (Math.random() > 0.5 ? 1 : -1),
        hue: [260, 270, 280, 230][Math.floor(Math.random()*4)],
      });
    }
  }

  function spawnShooter() {
    if (Math.random() < 0.25) {
      shooters.push({
        x: Math.random() * W * 0.6,
        y: Math.random() * H * 0.35,
        vx: 5 + Math.random() * 7,
        vy: 2 + Math.random() * 4,
        len: 80 + Math.random() * 130,
        life: 1.0,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Nebulae
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
      g.addColorStop(0,   `hsla(${n.hue},70%,55%,${n.a})`);
      g.addColorStop(0.5, `hsla(${n.hue},60%,40%,${n.a*0.4})`);
      g.addColorStop(1,   'transparent');
      ctx.save();
      ctx.scale(n.rx / Math.max(n.rx, n.ry), n.ry / Math.max(n.rx, n.ry));
      ctx.beginPath();
      const scale = Math.max(n.rx, n.ry) / Math.max(n.rx, n.ry);
      ctx.ellipse(
        n.x / (n.rx / Math.max(n.rx, n.ry)),
        n.y / (n.ry / Math.max(n.rx, n.ry)),
        Math.max(n.rx, n.ry), Math.max(n.rx, n.ry), 0, 0, Math.PI*2
      );
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    });

    // Stars
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue},80%,80%,${s.a})`;
      ctx.fill();
    });

    // Shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      const g = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len*(ss.vx/8), ss.y - ss.len*(ss.vy/8));
      g.addColorStop(0, `rgba(192,132,252,${ss.life})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.len*(ss.vx/8), ss.y - ss.len*(ss.vy/8));
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.022;
      if (ss.life <= 0) shooters.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  setInterval(spawnShooter, 2800);
  window.addEventListener('resize', resize);
})();

/* ============================================================
   LOGO CANVAS
   ============================================================ */
(function initLogo() {
  const c = document.getElementById('logoCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, 36, 36);
    // Planet
    const g = ctx.createRadialGradient(14, 14, 2, 18, 18, 16);
    g.addColorStop(0, '#c084fc');
    g.addColorStop(0.5, '#7c3aed');
    g.addColorStop(1, '#2e0066');
    ctx.beginPath();
    ctx.arc(18, 18, 13, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
    // Ring
    ctx.save();
    ctx.translate(18, 18);
    ctx.rotate(0.5);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(192,132,252,${0.6 + 0.3*Math.sin(t)})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    // Orbiting dot
    const ox = 18 + 17 * Math.cos(t);
    const oy = 18 + 5  * Math.sin(t);
    ctx.beginPath();
    ctx.arc(ox, oy, 2.5, 0, Math.PI*2);
    ctx.fillStyle = '#e9d5ff';
    ctx.fill();
    t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   PLANET CANVAS (Hero)
   ============================================================ */
(function initPlanet() {
  const c = document.getElementById('planetCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = 400, H = 400;
  let t = 0;

  // Stars in planet scene
  const stars = Array.from({length: 60}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.2+0.2,
    a: Math.random(),
    da: (0.005+Math.random()*0.01)*(Math.random()>0.5?1:-1),
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.a += s.da; if (s.a>1||s.a<0.1) s.da*=-1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(192,132,252,${s.a})`; ctx.fill();
    });

    const cx = W/2, cy = H/2;

    // Orbit rings
    [{ r:80, speed:0.018, col:'rgba(168,85,247,0.25)' },
     { r:120, speed:-0.011, col:'rgba(129,140,248,0.18)' },
     { r:165, speed:0.007, col:'rgba(232,121,249,0.12)' }].forEach((o,i) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.38);
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, Math.PI*2);
      ctx.strokeStyle = o.col;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Orbiting dot on ring
      const angle = t * o.speed * 60 + i * 2.1;
      const dx = o.r * Math.cos(angle);
      const dy = o.r * 0.38 * Math.sin(angle);
      const dotSize = [4, 3, 5][i];
      const dotGlow = ctx.createRadialGradient(cx+dx, cy+dy, 0, cx+dx, cy+dy, dotSize*3);
      dotGlow.addColorStop(0, ['#c084fc','#818cf8','#e879f9'][i]);
      dotGlow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx+dx, cy+dy, dotSize*3, 0, Math.PI*2);
      ctx.fillStyle = dotGlow; ctx.fill();
      ctx.beginPath(); ctx.arc(cx+dx, cy+dy, dotSize, 0, Math.PI*2);
      ctx.fillStyle = ['#c084fc','#818cf8','#e879f9'][i]; ctx.fill();
    });

    // Planet glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
    glow.addColorStop(0, 'rgba(168,85,247,0.5)');
    glow.addColorStop(0.5, 'rgba(124,58,237,0.2)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI*2);
    ctx.fillStyle = glow; ctx.fill();

    // Planet body
    const planet = ctx.createRadialGradient(cx-18, cy-18, 5, cx, cy, 60);
    planet.addColorStop(0, 'rgba(220,180,255,0.7)');
    planet.addColorStop(0.35, 'rgba(168,85,247,0.85)');
    planet.addColorStop(0.7, 'rgba(100,40,200,0.9)');
    planet.addColorStop(1, 'rgba(30,5,70,0.95)');
    ctx.beginPath(); ctx.arc(cx, cy + 3*Math.sin(t*0.6), 58, 0, Math.PI*2);
    ctx.fillStyle = planet; ctx.fill();

    // Planet ring
    ctx.save();
    ctx.translate(cx, cy + 3*Math.sin(t*0.6));
    ctx.scale(1, 0.3);
    const ringGrad = ctx.createLinearGradient(-80, 0, 80, 0);
    ringGrad.addColorStop(0, 'transparent');
    ringGrad.addColorStop(0.3, 'rgba(192,132,252,0.6)');
    ringGrad.addColorStop(0.7, 'rgba(192,132,252,0.6)');
    ringGrad.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI*2);
    ctx.strokeStyle = ringGrad; ctx.lineWidth = 6; ctx.stroke();
    ctx.restore();

    // Stars/craters on planet surface
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy + 3*Math.sin(t*0.6), 58, 0, Math.PI*2);
    ctx.clip();
    [[cx-20,cy-15,4],[cx+15,cy+20,3],[cx-5,cy+30,5],[cx+25,cy-10,2]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle='rgba(100,60,180,0.4)'; ctx.fill();
    });
    ctx.restore();

    t += 0.016;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   AVATAR CANVAS (Navbar user)
   ============================================================ */
function drawAvatar(canvas, letter, hue) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  ctx.clearRect(0, 0, S, S);
  const g = ctx.createRadialGradient(S*0.38, S*0.38, S*0.05, S*0.5, S*0.5, S*0.52);
  g.addColorStop(0, `hsl(${hue+20},80%,65%)`);
  g.addColorStop(1, `hsl(${hue},70%,35%)`);
  ctx.beginPath(); ctx.arc(S/2, S/2, S/2-1, 0, Math.PI*2);
  ctx.fillStyle = g; ctx.fill();
  ctx.font = `bold ${S*0.5}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, S/2, S/2+1);
}

/* ============================================================
   STAT CANVASES
   ============================================================ */
function drawStatCanvas(canvas, type) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  ctx.clearRect(0, 0, S, S);

  const configs = {
    books:   { icon: '📚', hue: 270 },
    cats:    { icon: '🗂️', hue: 250 },
    borrows: { icon: '🔖', hue: 290 },
    avail:   { icon: '✅', hue: 140 },
  };
  const cfg = configs[type] || configs.books;

  // Bg glow
  const g = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  g.addColorStop(0, `hsla(${cfg.hue},70%,55%,0.3)`);
  g.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(S/2, S/2, S/2, 0, Math.PI*2);
  ctx.fillStyle = g; ctx.fill();

  ctx.font = `${S*0.52}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.icon, S/2, S/2+2);
}

/* ============================================================
   MODAL ART CANVASES
   ============================================================ */
function drawModalArt(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'rgba(124,58,237,0.8)');
  g.addColorStop(0.5, 'rgba(99,102,241,0.7)');
  g.addColorStop(1, 'rgba(168,85,247,0.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 40; i++) {
    const x = Math.random()*W, y = Math.random()*H;
    const r = Math.random()*1.5 + 0.3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.6+0.2})`; ctx.fill();
  }
  // Glowing orbs
  [[W*0.15,H*0.5,30,'rgba(232,121,249,0.4)'],[W*0.85,H*0.4,25,'rgba(129,140,248,0.4)']].forEach(([x,y,r,c]) => {
    const og = ctx.createRadialGradient(x,y,0,x,y,r);
    og.addColorStop(0, c); og.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=og; ctx.fill();
  });
}

/* ============================================================
   BOOK COVER CANVAS
   ============================================================ */
const COVER_PALETTES = [
  ['#7c3aed','#ec4899'],['#6366f1','#a855f7'],['#9333ea','#06b6d4'],
  ['#7c3aed','#f59e0b'],['#a855f7','#22c55e'],['#4f46e5','#e879f9'],
  ['#8b5cf6','#f43f5e'],['#7c3aed','#0ea5e9'],['#9333ea','#fb923c'],
];
const CAT_ICONS = ['📖','🔭','🧪','🌿','🎨','🏛️','💻','🎵','🌍','🚀','🔬','📐'];

function coverFor(id) { return COVER_PALETTES[Math.abs(id) % COVER_PALETTES.length]; }
function iconFor(id)  { return CAT_ICONS[Math.abs(id) % CAT_ICONS.length]; }

function drawBookCoverCanvas(canvas, bookId, title) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const [c1, c2] = coverFor(bookId);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Texture dots
  for (let i = 0; i < 25; i++) {
    const x = Math.random()*W, y = Math.random()*H;
    ctx.beginPath(); ctx.arc(x,y,Math.random()*3+0.5,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.15+0.03})`; ctx.fill();
  }
  // Abstract shapes
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.translate(W*0.7, H*0.3);
  ctx.beginPath(); ctx.arc(0, 0, W*0.4, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();

  // Book icon
  ctx.font = `${H*0.38}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('📚', W/2, H*0.42);

  // Title (small)
  if (title) {
    ctx.font = `bold ${Math.min(13, W/8)}px 'Outfit', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const words = title.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur+' '+w : w;
      if (ctx.measureText(test).width > W-12) { if(cur) lines.push(cur); cur=w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    const show = lines.slice(0, 2);
    show.forEach((l,i) => ctx.fillText(l, W/2, H - 6 - (show.length-1-i)*15));
  }
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${type==='success'?'✓':type==='error'?'✗':'ℹ'}</span>${msg}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(60px)'; setTimeout(()=>el.remove(),350); }, 3200);
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  try {
    const res = await fetch(API + path, { ...opts, headers });
    const json = await res.json();
    return { ok: res.ok, status: res.status, json };
  } catch(e) {
    return { ok: false, status: 0, json: { error: 'Loi ket noi server!' } };
  }
}

async function apiForm(path, formData) {
  const headers = {};
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  try {
    const res = await fetch(API + path, { method: 'POST', headers, body: formData });
    const json = await res.json();
    return { ok: res.ok, status: res.status, json };
  } catch(e) {
    return { ok: false, status: 0, json: { error: 'Loi ket noi server!' } };
  }
}

function fmtDate(iso) {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function isOverdue(dueDate, status) {
  if (status !== 'borrowing') return false;
  return new Date() > new Date(dueDate);
}

/* ============================================================
   NAVIGATION / VIEWS
   ============================================================ */
function showView(name, pushHistory = true) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const viewEl = document.getElementById('view' + name[0].toUpperCase() + name.slice(1));
  if (!viewEl) return;
  viewEl.classList.add('active');

  const lnk = document.getElementById('nav' + name[0].toUpperCase() + name.slice(1));
  if (lnk) lnk.classList.add('active');

  // Back button logic
  if (pushHistory && name !== state.currentView) {
    state.history.push(state.currentView);
  }
  state.currentView = name;

  const backBtn = document.getElementById('btnBack');
  if (backBtn) {
    if (state.history.length > 0) {
      backBtn.style.opacity = '1';
      backBtn.style.pointerEvents = 'auto';
    } else {
      backBtn.style.opacity = '0.3';
      backBtn.style.pointerEvents = 'none';
    }
  }

  // Breadcrumb
  updateBreadcrumb(name);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateBreadcrumb(view) {
  const bc = document.getElementById('breadcrumb');
  if (!bc) return;
  const labels = { home: 'Trang Chu', books: 'Sach', categories: 'The Loai', borrows: 'Phieu Muon' };
  bc.innerHTML = `<span class="bc-item">🏠 Trang Chu</span>` +
    (view !== 'home' ? `<span class="bc-sep">›</span><span class="bc-item active">${labels[view]||view}</span>` : '');
}

// Back button
document.getElementById('btnBack')?.addEventListener('click', () => {
  if (state.history.length > 0) {
    const prev = state.history.pop();
    showView(prev, false);
    if (prev === 'books')      loadBooks();
    if (prev === 'categories') loadCategories();
    if (prev === 'borrows')    renderBorrows();
  }
});

// Nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const v = link.dataset.view;
    if (!v) return;
    showView(v);
    if (v === 'borrows')    renderBorrows();
    if (v === 'books')      loadBooks();
    if (v === 'categories') loadCategories();
  });
});

/* ============================================================
   AUTH STATE
   ============================================================ */
function updateNavAuth() {
  const navAuth     = document.getElementById('navAuth');
  const navUserInfo = document.getElementById('navUserInfo');
  if (!navAuth || !navUserInfo) return;

  if (state.user) {
    navAuth.classList.add('hidden');
    navUserInfo.classList.remove('hidden');

    const nameEl = document.getElementById('userName');
    const roleEl = document.getElementById('userRoleBadge');
    if (nameEl) nameEl.textContent = state.user.full_name || state.user.username;
    if (roleEl) {
      roleEl.textContent = state.user.role === 'admin' ? '👑 Admin' : '📖 Member';
      roleEl.className = 'user-role' + (state.user.role === 'admin' ? ' admin' : '');
    }

    // Avatar canvas
    const av = document.getElementById('avatarCanvas');
    if (av) drawAvatar(av, (state.user.username||'U')[0].toUpperCase(), state.user.role==='admin'?290:260);

    // Admin buttons
    const addBook = document.getElementById('btnAddBook');
    const addCat  = document.getElementById('btnAddCat');
    const show    = state.user.role === 'admin';
    if (addBook) addBook.style.display = show ? 'inline-flex' : 'none';
    if (addCat)  addCat.style.display  = show ? 'inline-flex' : 'none';
  } else {
    navAuth.classList.remove('hidden');
    navUserInfo.classList.add('hidden');
    ['btnAddBook','btnAddCat'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
}

function logout() {
  state.token = null;
  state.user  = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNavAuth();
  toast('Da dang xuat!', 'info');
  showView('home');
  renderBorrows();
}

document.getElementById('btnLogout')?.addEventListener('click', logout);

/* ============================================================
   HOME
   ============================================================ */
async function loadHome() {
  // Init stat canvases
  document.querySelectorAll('.stat-canvas').forEach(c => {
    drawStatCanvas(c, c.dataset.type);
  });

  const [booksRes, catsRes] = await Promise.all([
    api('/api/books'),
    api('/api/categories'),
  ]);

  if (booksRes.ok) {
    const books = booksRes.json.data || [];
    state.books = books;
    const statBooks = document.getElementById('statBooks');
    if (statBooks) statBooks.textContent = books.length;
    const avail = books.reduce((sum, b) => sum + (b.available||0), 0);
    const statAvail = document.getElementById('statAvail');
    if (statAvail) statAvail.textContent = avail;

    renderBookGrid('featuredBooks', books.slice(0, 4));
    renderHeroBookRow(books.slice(0, 5));
  }

  if (catsRes.ok) {
    const cats = catsRes.json.data || [];
    state.categories = cats;
    const statCats = document.getElementById('statCats');
    if (statCats) statCats.textContent = cats.length;
    populateCategorySelects(cats);
    renderCatStrip(cats.slice(0, 6));
  }

  if (state.token) {
    const bRes = await api('/api/borrows/my');
    if (bRes.ok) {
      const bs = bRes.json.data || [];
      state.borrows = bs;
      const statBorrows = document.getElementById('statBorrows');
      if (statBorrows) statBorrows.textContent = bs.filter(b => b.status === 'borrowing').length;
    }
  } else {
    const statBorrows = document.getElementById('statBorrows');
    if (statBorrows) statBorrows.textContent = '--';
  }
}

function renderHeroBookRow(books) {
  const row = document.getElementById('heroBookRow');
  if (!row || books.length === 0) return;
  row.innerHTML = books.map((b,i) => {
    const [c1,c2] = coverFor(b.id);
    return `<div class="hero-book-thumb" style="--delay:${i*0.12}s;background:linear-gradient(135deg,${c1},${c2})" title="${b.title}">
      <span style="font-size:1.4rem">📚</span>
    </div>`;
  }).join('');
}

function renderCatStrip(cats) {
  const strip = document.getElementById('catStrip');
  if (!strip) return;
  strip.innerHTML = cats.map(c => {
    const icon = iconFor(c.id);
    return `<div class="cat-chip" data-id="${c.id}">
      <span class="cat-chip-icon">${icon}</span>
      <span class="cat-chip-name">${c.name}</span>
    </div>`;
  }).join('');
  strip.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      showView('books');
      loadBooks('', chip.dataset.id);
      document.getElementById('filterCategory').value = chip.dataset.id;
    });
  });
}

/* ============================================================
   BOOKS
   ============================================================ */
function renderBookGrid(containerId, books) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  if (!books || books.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>Khong co sach nao</p></div>';
    return;
  }

  grid.innerHTML = books.map(b => {
    const avail = b.available > 0;
    const [c1,c2] = coverFor(b.id);
    return `
    <div class="book-card" data-id="${b.id}">
      <div class="book-cover" style="background:linear-gradient(135deg,${c1},${c2})">
        <div class="book-cover-shine"></div>
        <span class="book-cover-emoji">📚</span>
        <div class="book-cover-title">${b.title}</div>
      </div>
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author} • ${b.year}</div>
      <div class="book-meta">
        <span class="book-cat-tag">${b.category ? b.category.name : 'N/A'}</span>
        <span class="book-avail ${avail ? '' : 'zero'}">${avail ? '✓ Con '+b.available : '✗ Het'}</span>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', () => openBookDetail(+card.dataset.id));
  });
}

async function loadBooks(search = '', categoryId = '') {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  grid.innerHTML = Array(6).fill('<div class="book-skeleton"></div>').join('');
  let url = '/api/books';
  const params = [];
  if (search)     params.push(`search=${encodeURIComponent(search)}`);
  if (categoryId) params.push(`category_id=${categoryId}`);
  if (params.length) url += '?' + params.join('&');

  const res = await api(url);
  if (res.ok) {
    state.books = res.json.data || [];
    const cnt = document.getElementById('booksCount');
    if (cnt) cnt.textContent = `${state.books.length} dau sach`;
    renderBookGrid('booksGrid', state.books);
  } else {
    grid.innerHTML = '<div class="empty-state"><p>Loi tai du lieu</p></div>';
    toast('Loi tai sach!', 'error');
  }
}

// Search
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');

searchInput?.addEventListener('input', () => {
  if (clearSearch) clearSearch.classList.toggle('hidden', !searchInput.value);
});
clearSearch?.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.classList.add('hidden');
  loadBooks();
});
document.getElementById('btnSearch')?.addEventListener('click', () => {
  const s = searchInput?.value.trim() || '';
  const c = document.getElementById('filterCategory')?.value || '';
  loadBooks(s, c);
});
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnSearch')?.click();
});

/* ============================================================
   CATEGORIES
   ============================================================ */
function renderCatGrid(cats) {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  if (!cats || cats.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🗂️</div><p>Chua co the loai</p></div>';
    return;
  }
  grid.innerHTML = cats.map(c => `
    <div class="cat-card" data-id="${c.id}">
      <div class="cat-card-top">
        <div class="cat-icon">${iconFor(c.id)}</div>
        <div class="cat-badge">${c.id}</div>
      </div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-desc">${c.description || 'Kham pha sach trong the loai nay'}</div>
      <div class="cat-footer">
        <span class="cat-explore">Kham pha →</span>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      showView('books');
      loadBooks('', card.dataset.id);
      document.getElementById('filterCategory').value = card.dataset.id;
    });
  });
}

async function loadCategories() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  grid.innerHTML = Array(4).fill('<div class="book-skeleton" style="height:180px"></div>').join('');
  const res = await api('/api/categories');
  if (res.ok) {
    state.categories = res.json.data || [];
    renderCatGrid(state.categories);
    populateCategorySelects(state.categories);
  } else {
    toast('Loi tai the loai!', 'error');
  }
}

function populateCategorySelects(cats) {
  const selFilter = document.getElementById('filterCategory');
  const selBook   = document.getElementById('bookCategory');
  const opts = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  if (selFilter) selFilter.innerHTML = '<option value="">Tat ca the loai</option>' + opts;
  if (selBook)   selBook.innerHTML   = opts;
}

/* ============================================================
   BOOK DETAIL — Side Sheet
   ============================================================ */
async function openBookDetail(bookId) {
  const book = state.books.find(b => b.id === bookId)
            || (await api(`/api/books/${bookId}`)).json?.data;
  if (!book) { toast('Khong tim thay sach!', 'error'); return; }

  const avail = book.available > 0;
  const [c1,c2] = coverFor(book.id);

  const body = document.getElementById('sheetBody');
  if (!body) return;

  body.innerHTML = `
    <canvas id="sheetCoverCanvas" width="260" height="160" class="sheet-cover-canvas"></canvas>
    <div class="sheet-book-info">
      <h2 class="sheet-book-title">${book.title}</h2>
      <p class="sheet-book-author">✍️ ${book.author}</p>
      <div class="sheet-meta-grid">
        <div class="sheet-meta-item"><span class="sheet-meta-key">Nam XB</span><span class="sheet-meta-val">${book.year}</span></div>
        <div class="sheet-meta-item"><span class="sheet-meta-key">The loai</span><span class="sheet-meta-val">${book.category?.name||'N/A'}</span></div>
        <div class="sheet-meta-item"><span class="sheet-meta-key">Tong so</span><span class="sheet-meta-val">${book.quantity} cuon</span></div>
        <div class="sheet-meta-item"><span class="sheet-meta-key">San co</span><span class="sheet-meta-val ${avail?'avail-yes':'avail-no'}">${book.available} cuon</span></div>
      </div>
    </div>
    <div class="sheet-actions">
      ${state.user && avail
        ? `<button class="btn-primary btn-full" id="sheetBorrowBtn" data-id="${book.id}">📖 Muon Sach Nay</button>`
        : ''}
      ${!state.user
        ? `<button class="btn-primary btn-full" id="sheetLoginBtn">🔐 Dang Nhap De Muon</button>`
        : ''}
      ${state.user && !avail
        ? `<p class="sheet-unavail">❌ Sach het, khong the muon</p>`
        : ''}
      ${state.user?.role === 'admin'
        ? `<button class="btn-danger btn-full" id="sheetDeleteBtn" data-id="${book.id}" style="margin-top:10px">🗑️ Xoa Sach</button>`
        : ''}
    </div>
  `;

  // Draw cover canvas
  const cvs = document.getElementById('sheetCoverCanvas');
  if (cvs) drawBookCoverCanvas(cvs, book.id, book.title);

  // Open sheet
  document.getElementById('sheetOverlay')?.classList.remove('hidden');

  document.getElementById('sheetBorrowBtn')?.addEventListener('click', () => borrowBook(+book.id));
  document.getElementById('sheetLoginBtn')?.addEventListener('click', () => { closeSheet(); openModal('login'); });
  document.getElementById('sheetDeleteBtn')?.addEventListener('click', () => deleteBook(+book.id));
}

function closeSheet() {
  document.getElementById('sheetOverlay')?.classList.add('hidden');
}

document.getElementById('closeSheet')?.addEventListener('click', closeSheet);
document.getElementById('sheetOverlay')?.addEventListener('click', e => {
  if (e.target.id === 'sheetOverlay') closeSheet();
});

/* ============================================================
   BORROW
   ============================================================ */
async function borrowBook(bookId) {
  if (!state.token) { openModal('login'); return; }
  const res = await api('/api/borrows', { method:'POST', body:JSON.stringify({ book_id: bookId }) });
  if (res.ok) {
    toast('Muon sach thanh cong! 🎉', 'success');
    closeSheet();
    loadHome();
    if (state.currentView === 'books') loadBooks();
  } else {
    toast(res.json.error || 'Khong the muon sach!', 'error');
  }
}

/* ============================================================
   RETURN
   ============================================================ */
async function returnBook(recordId) {
  const res = await api(`/api/borrows/${recordId}/return`, { method:'POST' });
  if (res.ok) {
    toast('Tra sach thanh cong! ✓', 'success');
    loadHome();
    renderBorrows();
  } else {
    toast(res.json.error || 'Khong the tra sach!', 'error');
  }
}

/* ============================================================
   DELETE BOOK (Admin)
   ============================================================ */
async function deleteBook(bookId) {
  if (!confirm('Ban co chac muon xoa sach nay?')) return;
  const res = await api(`/api/books/${bookId}`, { method:'DELETE' });
  if (res.ok) {
    toast('Da xoa sach!', 'success');
    closeSheet();
    loadHome();
    loadBooks();
  } else {
    toast(res.json.error || 'Khong the xoa sach!', 'error');
  }
}

/* ============================================================
   BORROWS VIEW
   ============================================================ */
async function renderBorrows() {
  const container = document.getElementById('borrowsContent');
  if (!container) return;
  if (!state.token) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔐</div>
        <p class="empty-title">Chua dang nhap</p>
        <p class="empty-desc">Vui long dang nhap de xem phieu muon</p>
        <button class="btn-primary" id="borrowLoginBtn2">Dang Nhap Ngay</button>
      </div>`;
    document.getElementById('borrowLoginBtn2')?.addEventListener('click', () => openModal('login'));
    return;
  }

  container.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Dang tai...</p></div>';
  const res = await api('/api/borrows/my');
  if (!res.ok) {
    container.innerHTML = '<div class="empty-state"><p>Loi tai du lieu</p></div>';
    return;
  }

  const records = res.json.data || [];
  state.borrows = records;

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-title">Chua muon sach nao</p>
        <p class="empty-desc">Hay kham pha thu vien va muon sach dau tien!</p>
        <button class="btn-primary" id="emptyBrowseBtn">Kham Pha Sach →</button>
      </div>`;
    document.getElementById('emptyBrowseBtn')?.addEventListener('click', () => { showView('books'); loadBooks(); });
    return;
  }

  container.innerHTML = `<div class="borrow-list">${records.map(r => {
    const over = isOverdue(r.due_date, r.status);
    const statusClass = over ? 'overdue' : r.status;
    const statusText  = over ? '⚠️ Qua Han' : (r.status==='borrowing'?'📖 Dang Muon':'✓ Da Tra');
    const [c1,c2] = coverFor(r.book?.id||0);
    return `
    <div class="borrow-card">
      <div class="borrow-cover" style="background:linear-gradient(135deg,${c1},${c2})">📚</div>
      <div class="borrow-info">
        <div class="borrow-book-title">${r.book?.title||'N/A'}</div>
        <div class="borrow-book-author">${r.book?.author||''}</div>
        <div class="borrow-dates">
          📅 Muon: ${fmtDate(r.borrow_date)} &bull; Han: ${fmtDate(r.due_date)}
          ${r.return_date ? ' • Tra: '+fmtDate(r.return_date) : ''}
        </div>
      </div>
      <div class="borrow-right">
        <span class="borrow-status ${statusClass}">${statusText}</span>
        ${r.status==='borrowing'?`<button class="btn-return" data-rid="${r.id}">Tra Sach</button>`:''}
      </div>
    </div>`;
  }).join('')}</div>`;

  container.querySelectorAll('.btn-return').forEach(btn => {
    btn.addEventListener('click', () => returnBook(+btn.dataset.rid));
  });
}

/* ============================================================
   AUTH MODALS
   ============================================================ */
function openModal(name) {
  const map = { login: 'modalLogin', register: 'modalRegister' };
  Object.values(map).forEach(id => document.getElementById(id)?.classList.add('hidden'));
  document.getElementById(map[name])?.classList.remove('hidden');

  // Draw modal art
  if (name === 'login')    drawModalArt(document.getElementById('modalArtLogin'));
  if (name === 'register') drawModalArt(document.getElementById('modalArtReg'));
}

function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// Login
document.getElementById('btnLogin')?.addEventListener('click', () => openModal('login'));
document.getElementById('closeLogin')?.addEventListener('click', () => closeModal('modalLogin'));
document.getElementById('modalLogin')?.addEventListener('click', e => {
  if (e.target.id === 'modalLogin') closeModal('modalLogin');
});
document.getElementById('switchRegister')?.addEventListener('click', e => {
  e.preventDefault(); openModal('register');
});

document.getElementById('doLogin')?.addEventListener('click', async () => {
  const username = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl    = document.getElementById('loginError');
  errEl?.classList.add('hidden');
  if (!username || !password) {
    if (errEl) { errEl.textContent = 'Vui long nhap day du!'; errEl.classList.remove('hidden'); }
    return;
  }
  const form = new FormData();
  form.append('username', username);
  form.append('password', password);

  const btn = document.getElementById('doLogin');
  btn.textContent = 'Dang nhap...'; btn.disabled = true;

  const res = await apiForm('/api/auth/login', form);
  btn.textContent = 'Dang Nhap'; btn.disabled = false;

  if (res.ok) {
    state.token = res.json.data.access_token;
    localStorage.setItem('token', state.token);
    const meRes = await api('/api/auth/me');
    if (meRes.ok) {
      state.user = meRes.json.data;
      localStorage.setItem('user', JSON.stringify(state.user));
    }
    closeModal('modalLogin');
    updateNavAuth();
    toast('Chao mung, ' + (state.user?.full_name || username) + '! 🚀', 'success');
    loadHome();
  } else {
    if (errEl) { errEl.textContent = res.json.error || 'Sai ten dang nhap hoac mat khau!'; errEl.classList.remove('hidden'); }
  }
});

// Register
document.getElementById('btnRegister')?.addEventListener('click', () => openModal('register'));
document.getElementById('closeRegister')?.addEventListener('click', () => closeModal('modalRegister'));
document.getElementById('modalRegister')?.addEventListener('click', e => {
  if (e.target.id === 'modalRegister') closeModal('modalRegister');
});
document.getElementById('switchLogin')?.addEventListener('click', e => {
  e.preventDefault(); openModal('login');
});

document.getElementById('doRegister')?.addEventListener('click', async () => {
  const username  = document.getElementById('regUsername')?.value.trim();
  const full_name = document.getElementById('regFullname')?.value.trim();
  const password  = document.getElementById('regPassword')?.value;
  const errEl     = document.getElementById('regError');
  errEl?.classList.add('hidden');
  if (!username || !full_name || !password) {
    if (errEl) { errEl.textContent = 'Vui long nhap day du!'; errEl.classList.remove('hidden'); }
    return;
  }
  const btn = document.getElementById('doRegister');
  btn.textContent = 'Dang tao...'; btn.disabled = true;
  const res = await api('/api/auth/register', { method:'POST', body:JSON.stringify({ username, full_name, password }) });
  btn.textContent = 'Tao Tai Khoan'; btn.disabled = false;

  if (res.ok) {
    closeModal('modalRegister');
    toast('Dang ky thanh cong! Vui long dang nhap. 🎉', 'success');
    openModal('login');
    const lu = document.getElementById('loginUsername');
    if (lu) lu.value = username;
  } else {
    if (errEl) { errEl.textContent = res.json.error || 'Dang ky that bai!'; errEl.classList.remove('hidden'); }
  }
});

/* ============================================================
   ADD BOOK MODAL (Admin)
   ============================================================ */
document.getElementById('btnAddBook')?.addEventListener('click', () => {
  document.getElementById('modalAddBook')?.classList.remove('hidden');
});
document.getElementById('closeAddBook')?.addEventListener('click', () => {
  document.getElementById('modalAddBook')?.classList.add('hidden');
});
document.getElementById('modalAddBook')?.addEventListener('click', e => {
  if (e.target.id === 'modalAddBook') document.getElementById('modalAddBook').classList.add('hidden');
});
document.getElementById('doAddBook')?.addEventListener('click', async () => {
  const title       = document.getElementById('bookTitle')?.value.trim();
  const author      = document.getElementById('bookAuthor')?.value.trim();
  const year        = +document.getElementById('bookYear')?.value;
  const quantity    = +document.getElementById('bookQty')?.value;
  const category_id = +document.getElementById('bookCategory')?.value;
  const errEl       = document.getElementById('addBookError');
  errEl?.classList.add('hidden');
  if (!title || !author || !year || !quantity || !category_id) {
    if (errEl) { errEl.textContent = 'Vui long nhap day du thong tin!'; errEl.classList.remove('hidden'); }
    return;
  }
  const res = await api('/api/books', { method:'POST', body:JSON.stringify({ title, author, year, quantity, category_id }) });
  if (res.ok) {
    document.getElementById('modalAddBook')?.classList.add('hidden');
    toast('Them sach thanh cong! 📚', 'success');
    ['bookTitle','bookAuthor','bookYear','bookQty'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    loadHome(); loadBooks();
  } else {
    if (errEl) { errEl.textContent = res.json.error || 'Them sach that bai!'; errEl.classList.remove('hidden'); }
  }
});

/* ============================================================
   ADD CATEGORY MODAL (Admin)
   ============================================================ */
document.getElementById('btnAddCat')?.addEventListener('click', () => {
  document.getElementById('modalAddCat')?.classList.remove('hidden');
});
document.getElementById('closeAddCat')?.addEventListener('click', () => {
  document.getElementById('modalAddCat')?.classList.add('hidden');
});
document.getElementById('modalAddCat')?.addEventListener('click', e => {
  if (e.target.id === 'modalAddCat') document.getElementById('modalAddCat').classList.add('hidden');
});
document.getElementById('doAddCat')?.addEventListener('click', async () => {
  const name        = document.getElementById('catName')?.value.trim();
  const description = document.getElementById('catDesc')?.value.trim();
  const errEl       = document.getElementById('addCatError');
  errEl?.classList.add('hidden');
  if (!name) {
    if (errEl) { errEl.textContent = 'Vui long nhap ten the loai!'; errEl.classList.remove('hidden'); }
    return;
  }
  const res = await api('/api/categories', { method:'POST', body:JSON.stringify({ name, description }) });
  if (res.ok) {
    document.getElementById('modalAddCat')?.classList.add('hidden');
    toast('Them the loai thanh cong! 🗂️', 'success');
    ['catName','catDesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
    loadHome(); loadCategories();
  } else {
    if (errEl) { errEl.textContent = res.json.error || 'Them the loai that bai!'; errEl.classList.remove('hidden'); }
  }
});

/* ============================================================
   HOME BUTTONS
   ============================================================ */
document.getElementById('heroBrowse')?.addEventListener('click', () => { showView('books'); loadBooks(); });
document.getElementById('heroLearn')?.addEventListener('click', () => {
  toast('Cosmic Library: Dang nhap → Tim sach → Click sach → Muon sach → Xem phieu muon → Tra sach 🚀', 'info');
});
document.getElementById('homeSeaAll')?.addEventListener('click', e => { e.preventDefault(); showView('books'); loadBooks(); });
document.getElementById('homeCatAll')?.addEventListener('click', e => { e.preventDefault(); showView('categories'); loadCategories(); });
document.getElementById('borrowLoginBtn')?.addEventListener('click', () => openModal('login'));
document.getElementById('navBrand')?.addEventListener('click', () => showView('home'));

/* ============================================================
   INIT
   ============================================================ */
// Draw initial stat canvases
document.querySelectorAll('.stat-canvas').forEach(c => drawStatCanvas(c, c.dataset.type));

updateNavAuth();
showView('home', false);
loadHome();
