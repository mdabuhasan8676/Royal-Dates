(() => {
  'use strict';
  /* ===== EDITABLE DATA: prices are BDT placeholders per 250g ===== */
  const PRODUCTS = [
    { id: 'ajwa', name: 'Ajwa Dates', img: 'ajwa', cat: 'dark', price: 1200, rating: 4.8, desc: 'Deep black, finely wrinkled dates with a dense look.' },
    { id: 'medjool', name: 'Medjool Dates', img: 'medjool', cat: 'red', price: 950, rating: 4.9, desc: 'Large, glossy dates in ruby-brown with a soft, folded skin.' },
    { id: 'mabroom', name: 'Mabroom Dates', img: 'mabroom', cat: 'red', price: 700, rating: 4.6, desc: 'Long, slim dates in a warm reddish brown.' },
    { id: 'sukkari', name: 'Sukkari Dates', img: 'sukkari', cat: 'golden', price: 550, rating: 4.7, desc: 'Rounded, golden-amber dates with a pale, glossy surface.' },
    { id: 'safawi', name: 'Safawi Dates', img: 'safawi', cat: 'dark', price: 480, rating: 4.5, desc: 'Dark chocolate-brown dates with a smooth, crinkled shine.' },
    { id: 'khalas', name: 'Khalas Dates', img: 'khalas', cat: 'golden', price: 520, rating: 4.7, desc: 'Amber, syrupy-looking dates with a glossy finish.' },
    { id: 'piarom', name: 'Piarom Dates', img: 'piarom', cat: 'dark', price: 650, rating: 4.4, desc: 'Dark brown, textured dates, lovely piled in a bowl.' },
    { id: 'deglet', name: 'Deglet Noor Dates', img: 'deglet-noor', cat: 'golden', price: 380, rating: 4.5, desc: 'Slim, amber-orange dates with a light, translucent skin.' }
  ];
  const GIFTS = [
    { id: 'gift1', name: 'Royal Assortment Box', img: 'piarom', price: 2500, desc: 'A gift-ready selection of our dates.' },
    { id: 'gift2', name: 'Classic Duo Box', img: 'medjool', price: 1800, desc: 'Two varieties, beautifully boxed.' },
    { id: 'gift3', name: 'Golden Celebration Box', img: 'khalas', price: 2200, desc: 'Golden-toned dates for sharing.' }
  ];
  const SIZES = { '250g': 1, '500g': 1.9, '1kg': 3.6 }; // price multipliers, editable
  const BEST = ['medjool', 'ajwa', 'sukkari', 'khalas'];
  const PH = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#F8F3E9"/><text x="200" y="205" font-family="serif" font-size="26" text-anchor="middle" fill="#C49A45">Royal Dates</text></svg>');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => '৳' + Math.round(n).toLocaleString('en-US');
  const all = [...PRODUCTS, ...GIFTS];
  const find = id => all.find(p => p.id === id);
  const src = p => `assets/images/${p.img}.jpg`;
  const unit = (p, size) => p.cat ? p.price * SIZES[size] : p.price;
  const load = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
  let cart = load('rd-cart'), wish = load('rd-wish'), filter = 'all', query = '';

  // graceful placeholder for any missing image
  document.addEventListener('error', e => {
    const t = e.target;
    if (t.tagName === 'IMG' && !t.dataset.fb) { t.dataset.fb = 1; t.src = PH; }
  }, true);

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  function card(p) {
    const isDate = !!p.cat;
    const opts = isDate ? Object.keys(SIZES).map(s => `<option>${s}</option>`).join('') : '';
    return `<article class="card" data-id="${p.id}">
      <div class="pic"><img src="${src(p)}" alt="${p.name}" loading="lazy" width="400" height="400">
        <button class="heart" aria-label="Add ${p.name} to wishlist" aria-pressed="${wish.includes(p.id)}">♡</button></div>
      <div class="body"><h3>${p.name}</h3><p>${p.desc}</p>
        ${isDate ? `<div class="stars" aria-label="Rating ${p.rating} out of 5 (demo)">${stars(p.rating)} <small>${p.rating} demo rating</small></div>` : ''}
        <div class="row"><span class="price">${fmt(unit(p, '250g'))}</span>
          ${isDate ? `<label class="sr" for="w-${p.id}-${Math.random().toString(36).slice(2, 6)}">Weight</label><select aria-label="Weight for ${p.name}" class="size">${opts}</select>` : '<small>per box</small>'}</div>
        <div class="btns"><button class="add">Add to cart</button><button class="qvb">Quick view</button></div></div>
    </article>`;
  }

  function renderGrids() {
    $('#bestGrid').innerHTML = BEST.map(id => card(find(id))).join('');
    $('#giftGrid').innerHTML = GIFTS.map(card).join('');
    renderShop();
  }
  function renderShop() {
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter(p => (filter === 'all' || p.cat === filter) && (!q || (p.name + ' ' + p.desc).toLowerCase().includes(q)));
    $('#shopGrid').innerHTML = list.map(card).join('');
    $('#empty').hidden = list.length > 0;
    $$('.chip').forEach(c => c.classList.toggle('on', c.dataset.filter === filter));
  }

  function setFilter(f) { filter = f; renderShop(); }

  function addToCart(id, size) {
    const p = find(id); size = p.cat ? size : 'Box';
    const key = id + '|' + size, hit = cart.find(i => i.key === key);
    hit ? hit.qty++ : cart.push({ key, id, size, qty: 1 });
    updateCart(); toast(`${p.name} (${size}) added to cart`);
  }
  function updateCart() {
    save('rd-cart', cart);
    $('#cartCount').textContent = cart.reduce((n, i) => n + i.qty, 0);
    $('#wishCount').textContent = wish.length;
    const box = $('#cartItems');
    if (!cart.length) box.innerHTML = '<p style="padding:24px 0">Your cart is empty. Add some dates to get started.</p>';
    else box.innerHTML = cart.map(i => {
      const p = find(i.id);
      return `<div class="ci" data-key="${i.key}"><img src="${src(p)}" alt="" width="64" height="64">
        <div><strong>${p.name}</strong><small>${i.size} · ${fmt(unit(p, i.size))}</small>
          <div class="qty"><button data-d="-1" aria-label="Decrease quantity of ${p.name}">−</button><span aria-live="polite">${i.qty}</span><button data-d="1" aria-label="Increase quantity of ${p.name}">+</button></div></div>
        <div><strong>${fmt(unit(p, i.size) * i.qty)}</strong><br><button class="rm" data-rm="1">Remove</button></div></div>`;
    }).join('');
    $('#subtotal').textContent = fmt(cart.reduce((s, i) => s + unit(find(i.id), i.size) * i.qty, 0));
  }

  function openCart(open) {
    $('#drawer').classList.toggle('open', open);
    $('#drawer').setAttribute('aria-hidden', !open);
    $('#overlay').hidden = !open;
    if (open) $('#closeCart').focus(); else $('#cartBtn').focus();
  }

  function quickView(id) {
    const p = find(id), isDate = !!p.cat, d = $('#qv');
    d.innerHTML = `<div class="qvw"><img src="${src(p)}" alt="${p.name}" width="400" height="400">
      <div><button class="qvx" aria-label="Close quick view">✕</button><h2 style="margin:0">${p.name}</h2><p>${p.desc}</p>
      ${isDate ? `<div class="stars">${stars(p.rating)} <small>${p.rating} demo rating</small></div><select class="size" aria-label="Weight">${Object.keys(SIZES).map(s => `<option>${s}</option>`).join('')}</select>` : ''}
      <span class="price" id="qvPrice">${fmt(unit(p, '250g'))}</span>
      <button class="add" data-id="${id}">Add to cart</button></div></div>`;
    d.showModal();
  }

  /* ===== events ===== */
  document.addEventListener('click', e => {
    const t = e.target, c = t.closest('.card');
    if (t.closest('.cat')) { setFilter(t.closest('.cat').dataset.filter); $('#shop').scrollIntoView(); }
    else if (t.classList.contains('chip')) setFilter(t.dataset.filter);
    else if (t.classList.contains('heart')) {
      const id = c.dataset.id, on = !wish.includes(id);
      wish = on ? [...wish, id] : wish.filter(x => x !== id);
      save('rd-wish', wish); $$(`.card[data-id="${id}"] .heart`).forEach(h => h.setAttribute('aria-pressed', on));
      updateCart(); toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
    }
    else if (t.classList.contains('qvb')) quickView(c.dataset.id);
    else if (t.classList.contains('add') && c) {
      addToCart(c.dataset.id, $('.size', c)?.value);
      t.classList.add('done'); t.textContent = 'Added ✓';
      setTimeout(() => { t.classList.remove('done'); t.textContent = 'Add to cart'; }, 1200);
    }
    else if (t.classList.contains('add')) { addToCart(t.dataset.id, $('#qv .size')?.value); $('#qv').close(); }
    else if (t.classList.contains('qvx') || t === $('#qv')) $('#qv').close();
    else if (t.closest('.qty button')) {
      const key = t.closest('.ci').dataset.key, it = cart.find(i => i.key === key);
      it.qty += +t.dataset.d; if (it.qty < 1) cart = cart.filter(i => i !== it); updateCart();
    }
    else if (t.dataset.rm) { cart = cart.filter(i => i.key !== t.closest('.ci').dataset.key); updateCart(); }
  });
  document.addEventListener('change', e => {
    if (!e.target.classList.contains('size')) return;
    const c = e.target.closest('.card'), id = c ? c.dataset.id : $('#qv .add').dataset.id;
    const out = c ? $('.price', c) : $('#qvPrice');
    out.textContent = fmt(unit(find(id), e.target.value));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#drawer').classList.contains('open')) openCart(false); });

  $('#cartBtn').onclick = () => openCart(true);
  $('#closeCart').onclick = $('#overlay').onclick = () => openCart(false);
  $('#checkout').onclick = () => toast(cart.length ? 'Demo store: checkout is not connected yet' : 'Your cart is empty');
  $('#orderBtn').onclick = () => toast('Demo store: order tracking is not connected yet');
  $('#wishBtn').onclick = () => toast(wish.length ? 'Saved: ' + wish.map(id => find(id).name).join(', ') : 'Your wishlist is empty');
  $('#menuBtn').onclick = e => {
    const open = $('#mainNav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', open);
  };
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => { $('#mainNav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', false); }));

  $('#q').addEventListener('input', e => { query = e.target.value; renderShop(); });
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); $('#shop').scrollIntoView(); });

  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#email'), m = $('#newsMsg'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim());
    i.setAttribute('aria-invalid', !ok);
    m.textContent = ok ? 'Thank you. You are subscribed (demo: nothing is sent yet).' : 'Enter a valid email address, like name@example.com.';
    if (ok) i.value = '';
  });

  renderGrids(); updateCart();
})();