/* ============================================================
   NAMAS-TE-VISTES — Aplicación Principal
   ============================================================ */

'use strict';

// ============================================================
// ESTADO GLOBAL
// ============================================================
const State = {
  cart: JSON.parse(localStorage.getItem('ntv_cart') || '[]'),
  wishlist: [],
  activeMenuTab: 'todos',
  activeShopFilter: 'todos',
  selectedDelivery: 'pickup',
  selectedDate: null,
  checkoutOpen: false,
};

function saveCart() {
  localStorage.setItem('ntv_cart', JSON.stringify(State.cart));
}

// ============================================================
// DATOS DE PRODUCTOS
// ============================================================
const menuItems = [
  {
    id: 'bc-001',
    name: 'Butter Chicken',
    desc: 'Pollo tierno en salsa cremosa de tomate y especias aromáticas. Servido con arroz basmati.',
    price: 12.90,
    oldPrice: 15.00,
    img: 'assets/images/butter_chicken.png',
    category: 'platos',
    badge: 'Más pedido',
    badgeClass: '',
    rating: 4.9,
    spicy: 1,
    type: 'food'
  },
  {
    id: 'cm-001',
    name: 'Chana Masala',
    desc: 'Garbanzos cocidos a fuego lento en salsa de tomate con cebolla, jengibre y especias.',
    price: 10.50,
    oldPrice: null,
    img: 'assets/images/chana_masala.png',
    category: 'platos',
    badge: 'Vegetariano',
    badgeClass: 'veg',
    rating: 4.7,
    spicy: 2,
    type: 'food'
  },
  {
    id: 'gj-001',
    name: 'Gulab Jamun',
    desc: 'Bolitas de leche frita bañadas en almíbar de rosas y cardamomo. Postre tradicional irresistible.',
    price: 6.50,
    oldPrice: null,
    img: 'assets/images/gulab_jamun.png',
    category: 'postres',
    badge: 'Dulce',
    badgeClass: '',
    rating: 4.8,
    spicy: 0,
    type: 'food'
  },
  {
    id: 'at-001',
    name: 'Aloo Tikki',
    desc: 'Croquetas de papa crujientes con especias, servidas con chutney verde y de tamarindo.',
    price: 8.90,
    oldPrice: null,
    img: 'assets/images/aloo_tikki.png',
    category: 'entradas',
    badge: 'Vegetariano',
    badgeClass: 'veg',
    rating: 4.6,
    spicy: 2,
    type: 'food'
  },
  {
    id: 'dm-001',
    name: 'Dal Makhani',
    desc: 'Lentejas negras cremosas cocinadas durante horas con ghee, tomate y especias suaves.',
    price: 9.90,
    oldPrice: 11.50,
    img: 'assets/images/dal_makhani.png',
    category: 'platos',
    badge: 'Chef recomienda',
    badgeClass: '',
    rating: 4.8,
    spicy: 1,
    type: 'food'
  },
  {
    id: 'th-001',
    name: 'Thali Completo',
    desc: 'Bandeja tradicional con: Butter Chicken, Dal Makhani, arroz, naan, raita y postre. La experiencia completa.',
    price: 24.90,
    oldPrice: 28.00,
    img: 'assets/images/thali_combo.png',
    category: 'combos',
    badge: '¡Combo Especial!',
    badgeClass: 'spicy',
    rating: 5.0,
    spicy: 1,
    type: 'food'
  },
];

const shopProducts = [
  {
    id: 'cl-001',
    name: 'Kurta Bordado Premium',
    desc: 'Kurta de algodón con bordado tradicional dorado',
    price: 89.90,
    oldPrice: 110.00,
    img: 'assets/images/indian_clothing.png',
    category: 'ropa',
    badge: 'Nuevo',
    badgeClass: 'badge-new',
    type: 'shop',
    hennaNotice: false,
  },
  {
    id: 'jw-001',
    name: 'Jhumka Doradas',
    desc: 'Pendientes jhumka doradas con incrustaciones de piedras semipreciosas',
    price: 34.50,
    oldPrice: null,
    img: 'assets/images/indian_jewelry.png',
    category: 'joyeria',
    badge: 'Nuevo',
    badgeClass: 'badge-new',
    type: 'shop',
    hennaNotice: false,
  },
  {
    id: 'hn-001',
    name: 'Kit Henna Natural Premium',
    desc: 'Conos de henna pura, plantillas y manual de diseños. Solo venta de productos.',
    price: 18.90,
    oldPrice: 22.00,
    img: 'assets/images/henna_products.png',
    category: 'henna',
    badge: 'Solo producto',
    badgeClass: 'badge-henna',
    type: 'shop',
    hennaNotice: true,
  },
  {
    id: 'jw-002',
    name: 'Maang Tikka Kundan',
    desc: 'Adorno de cabeza nupcial en metal dorado con piedrería kundan',
    price: 45.00,
    oldPrice: 55.00,
    img: 'assets/images/indian_jewelry.png',
    category: 'joyeria',
    badge: 'Oferta',
    badgeClass: 'badge-sale',
    type: 'shop',
    hennaNotice: false,
  },
  {
    id: 'hn-002',
    name: 'Henna en Polvo Orgánica',
    desc: 'Polvo 100% natural. Ideal para teñir o crear diseños. No incluye aplicación profesional.',
    price: 12.50,
    oldPrice: null,
    img: 'assets/images/henna_products.png',
    category: 'henna',
    badge: 'Solo producto',
    badgeClass: 'badge-henna',
    type: 'shop',
    hennaNotice: true,
  },
  {
    id: 'cl-002',
    name: 'Dupatta Bordado',
    desc: 'Pañuelo largo bordado en seda artificial con motivos florales y espejería',
    price: 28.00,
    oldPrice: 35.00,
    img: 'assets/images/indian_clothing.png',
    category: 'ropa',
    badge: 'Nuevo',
    badgeClass: 'badge-new',
    type: 'shop',
    hennaNotice: false,
  },
];

// Cross-sell products (shop items to suggest when food is in cart)
const crossSellItems = [
  { id: 'hn-001', name: 'Kit Henna Natural', price: 18.90, img: 'assets/images/henna_products.png' },
  { id: 'jw-001', name: 'Jhumka Doradas',    price: 34.50, img: 'assets/images/indian_jewelry.png' },
];

// ============================================================
// UTILIDADES
// ============================================================
function formatPrice(n) {
  return `$${n.toFixed(2)}`;
}

function showToast(msg, type = 'success', icon = '🛒') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function spicyDots(level) {
  const full  = '🌶️'.repeat(level);
  const empty = '·'.repeat(3 - level);
  return `<span title="Picante ${level}/3">${full}${empty}</span>`;
}

// ============================================================
// HEADER — scroll + mobile menu
// ============================================================
function initHeader() {
  const header  = document.getElementById('main-header');
  const toggle  = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.innerHTML = isOpen ? '✕' : '☰';
  });

  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.innerHTML = '☰';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelectorAll(`.nav-link[data-section="${e.target.id}"]`)
          .forEach(l => l.classList.add('active'));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ============================================================
// CART
// ============================================================
function getCartTotal() {
  return State.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return State.cart.reduce((sum, item) => sum + item.qty, 0);
}

function hasFoodInCart() {
  return State.cart.some(item => item.type === 'food');
}

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById('cart-badge');
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);

  const floatingCart = document.getElementById('floating-cart');
  if (floatingCart) {
    floatingCart.querySelector('.fc-count').textContent = count;
    floatingCart.style.display = count > 0 ? 'flex' : 'none';
  }
}

function renderCart() {
  const body      = document.getElementById('cart-body');
  const totalEl   = document.getElementById('cart-total');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (!body) return;

  if (State.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
        </svg>
        <p>Tu carrito está vacío.</p>
        <a href="#menu-section" class="btn btn-primary btn-sm" onclick="closeCart()">Ver menú</a>
      </div>`;
    totalEl.textContent = formatPrice(0);
    subtotalEl.textContent = formatPrice(0);
    return;
  }

  // Render items
  let html = '';
  State.cart.forEach((item, idx) => {
    html += `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">${item.type === 'food' ? '🍽️ Pedido de fin de semana' : '📦 Producto tienda'}</div>
          <div class="cart-item-controls">
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Disminuir cantidad">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Aumentar cantidad">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">🗑 Quitar</button>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>`;
  });

  // Cross-sell if food in cart
  if (hasFoodInCart()) {
    html += `
      <div class="crosssell-section">
        <div class="crosssell-title">✨ ¡Aprovecha el envío!</div>
        <div class="crosssell-subtitle">Agrega productos de la tienda a tu pedido de comida sin costo extra de envío.</div>
        <div class="crosssell-items">
          ${crossSellItems.map(cs => `
            <div class="crosssell-item" onclick="addCrossSell('${cs.id}','${cs.name}',${cs.price},'${cs.img}')">
              <img class="crosssell-img" src="${cs.img}" alt="${cs.name}" loading="lazy">
              <div class="crosssell-info">
                <div class="crosssell-name">${cs.name}</div>
                <div class="crosssell-price">${formatPrice(cs.price)}</div>
              </div>
              <button class="crosssell-add" aria-label="Agregar ${cs.name}">+</button>
            </div>`).join('')}
        </div>
      </div>`;
  }

  body.innerHTML = html;

  const subtotal = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl)    totalEl.textContent    = formatPrice(subtotal);
}

function addToCart(item, qty = 1) {
  const existing = State.cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += qty;
  } else {
    State.cart.push({ ...item, qty });
  }
  saveCart();
  updateCartBadge();
  renderCart();
  showToast(`<strong>${item.name}</strong> añadido al carrito`, 'success', '🛒');
}

function changeQty(id, delta) {
  const item = State.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id, true);
  else {
    saveCart();
    renderCart();
    updateCartBadge();
  }
}

function removeFromCart(id, silent = false) {
  State.cart = State.cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
  if (!silent) showToast('Producto eliminado del carrito', 'info', '🗑️');
}

function addCrossSell(id, name, price, img) {
  addToCart({ id, name, price, img, type: 'shop' });
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================================
// MENU TABS
// ============================================================
function initMenuTabs() {
  const tabs     = document.querySelectorAll('.menu-tab');
  const menuGrid = document.getElementById('menu-grid');

  function renderMenu(filter) {
    const items = filter === 'todos' ? menuItems : menuItems.filter(i => i.category === filter);
    if (!menuGrid) return;
    menuGrid.innerHTML = items.map(item => `
      <article class="menu-card reveal" aria-label="${item.name}">
        <div class="menu-card-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
          <span class="menu-card-badge ${item.badgeClass}">${item.badge}</span>
          <div class="rating-badge">⭐ ${item.rating}</div>
        </div>
        <div class="menu-card-body">
          <h3 class="menu-card-name">${item.name}</h3>
          <p class="menu-card-desc">${item.desc}</p>
          <div class="menu-card-footer">
            <div>
              <div class="menu-price">
                ${item.oldPrice ? `<span>${formatPrice(item.oldPrice)}</span>` : ''}
                ${formatPrice(item.price)}
              </div>
              <div style="font-size:.7rem;color:var(--color-text-light);margin-top:2px">${spicyDots(item.spicy)}</div>
            </div>
            <button
              id="add-food-${item.id}"
              class="add-to-cart-btn"
              onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})"
              aria-label="Añadir ${item.name}">
              +
            </button>
          </div>
        </div>
      </article>`).join('');
    initReveal();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      State.activeMenuTab = tab.dataset.tab;
      renderMenu(State.activeMenuTab);
    });
  });

  renderMenu('todos');
}

// ============================================================
// SHOP FILTERS
// ============================================================
function initShopFilters() {
  const filterOptions = document.querySelectorAll('.filter-option');
  const shopGrid      = document.getElementById('product-grid');
  const shopCount     = document.getElementById('shop-count-num');

  function renderShop(filter) {
    const items = filter === 'todos' ? shopProducts : shopProducts.filter(p => p.category === filter);
    if (!shopGrid) return;

    if (shopCount) shopCount.textContent = items.length;

    shopGrid.innerHTML = items.map(product => `
      <article class="product-card reveal" aria-label="${product.name}">
        <div class="product-img-wrap">
          <img src="${product.img}" alt="${product.name}" loading="lazy">
          ${product.hennaNotice ? `<div class="badge-notice">⚠️ Solo venta de productos — No incluye aplicación</div>` : ''}
          <div class="product-overlay">
            <button class="overlay-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" aria-label="Añadir al carrito">🛒</button>
            <button class="overlay-btn" onclick="toggleWishlist('${product.id}')" aria-label="Lista de deseos">🤍</button>
          </div>
          <span class="product-badge ${product.badgeClass}">${product.badge}</span>
          <button class="wishlist-btn" id="wish-${product.id}" onclick="toggleWishlist('${product.id}')" aria-label="Guardar en wishlist">🤍</button>
        </div>
        <div class="product-body">
          <div class="product-cat">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price-row">
            <div class="product-price">
              ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
              ${formatPrice(product.price)}
            </div>
            <button class="quick-add-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" aria-label="Añadir al carrito">+</button>
          </div>
          ${product.hennaNotice ? `<p style="font-size:.7rem;color:var(--color-text-light);margin-top:6px;border-top:1px solid var(--color-border);padding-top:6px;">📌 Producto físico únicamente. No se ofrece servicio de diseño ni aplicación.</p>` : ''}
        </div>
      </article>`).join('');
    initReveal();
  }

  filterOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      filterOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      State.activeShopFilter = opt.dataset.filter;
      renderShop(State.activeShopFilter);
    });
  });

  renderShop('todos');
}

function toggleWishlist(id) {
  const idx = State.wishlist.indexOf(id);
  if (idx > -1) {
    State.wishlist.splice(idx, 1);
    showToast('Eliminado de favoritos', 'info', '🤍');
  } else {
    State.wishlist.push(id);
    showToast('¡Guardado en favoritos!', 'success', '❤️');
  }
  document.querySelectorAll(`[id="wish-${id}"]`).forEach(btn => {
    btn.textContent = State.wishlist.includes(id) ? '❤️' : '🤍';
  });
}

// ============================================================
// DELIVERY OPTIONS
// ============================================================
function selectDelivery(type) {
  State.selectedDelivery = type;
  document.querySelectorAll('.delivery-opt').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.delivery === type);
  });

  // Update address field visibility
  const addrGroup = document.getElementById('address-group');
  if (addrGroup) {
    addrGroup.style.display = type === 'pickup' ? 'none' : 'block';
  }
}

// ============================================================
// DELIVERY DATE PICKER (only Saturdays & Sundays)
// ============================================================
function generateDeliveryDates() {
  const container = document.getElementById('date-options');
  if (!container) return;

  const today = new Date();
  const dates = [];
  let current = new Date(today);
  current.setDate(current.getDate() + 1);

  // Find the next 4 Saturdays and Sundays (max 3 weeks ahead)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  for (let i = 0; i < 30 && dates.length < 6; i++) {
    const day = current.getDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  container.innerHTML = dates.map(d => {
    const iso = d.toISOString().split('T')[0];
    const label = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    return `<button class="date-option" data-date="${iso}" onclick="selectDate('${iso}', this)">${label}</button>`;
  }).join('');
}

function selectDate(date, btn) {
  State.selectedDate = date;
  document.querySelectorAll('.date-option').forEach(opt => opt.classList.remove('selected'));
  btn.classList.add('selected');
}

// ============================================================
// CHECKOUT MODAL
// ============================================================
function renderCheckoutSummary() {
  const summaryEl = document.getElementById('order-summary-items');
  const totalEl   = document.getElementById('checkout-total');
  if (!summaryEl) return;

  summaryEl.innerHTML = State.cart.map(item => `
    <div class="order-summary-item">
      <span class="order-item-name">${item.name}</span>
      <span class="order-item-qty">×${item.qty}</span>
      <span class="order-item-price">${formatPrice(item.price * item.qty)}</span>
    </div>`).join('');

  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());

  // Show date picker only if food in cart
  const datePicker = document.getElementById('date-picker-section');
  if (datePicker) {
    datePicker.style.display = hasFoodInCart() ? 'block' : 'none';
  }
  generateDeliveryDates();
}

function openCheckout() {
  if (State.cart.length === 0) {
    showToast('Tu carrito está vacío', 'error', '⚠️');
    return;
  }
  closeCart();
  renderCheckoutSummary();
  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';

  // Reset success state
  const success = document.getElementById('checkout-success');
  const form    = document.getElementById('checkout-form-content');
  if (success) success.style.display = 'none';
  if (form)    form.style.display    = 'grid';
}

function submitOrder(e) {
  e.preventDefault();

  // Validate: if food in cart, must select date
  if (hasFoodInCart() && !State.selectedDate) {
    showToast('Por favor selecciona una fecha de entrega', 'error', '📅');
    document.getElementById('date-picker-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Simulate success
  const form    = document.getElementById('checkout-form-content');
  const success = document.getElementById('checkout-success');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'flex';

  // Clear cart
  State.cart = [];
  State.selectedDate = null;
  saveCart();
  updateCartBadge();

  showToast('¡Pedido realizado con éxito! 🎉', 'success', '✅');
}

// ============================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ============================================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================================
// HERO PARALLAX
// ============================================================
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1.04) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}

// ============================================================
// NEWSLETTER FORM
// ============================================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (!email) return;
    showToast(`¡Gracias! Te mantendremos al tanto de los mejores sabores.`, 'success', '📧');
    form.reset();
  });
}

// ============================================================
// WORLD CARDS — navigation
// ============================================================
function initWorldCards() {
  document.getElementById('go-to-menu')?.addEventListener('click', () => {
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('go-to-shop')?.addEventListener('click', () => {
    document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMenuTabs();
  initShopFilters();
  initReveal();
  initSmoothScroll();
  initParallax();
  initNewsletter();
  initWorldCards();
  updateCartBadge();
  renderCart();

  // Cart toggle
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('close-cart')?.addEventListener('click', closeCart);

  // Checkout
  document.getElementById('checkout-btn')?.addEventListener('click', openCheckout);
  document.getElementById('close-checkout')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCheckout();
  });
  document.getElementById('checkout-form')?.addEventListener('submit', submitOrder);

  // Delivery options
  document.querySelectorAll('.delivery-opt').forEach(opt => {
    opt.addEventListener('click', () => selectDelivery(opt.dataset.delivery));
  });
  selectDelivery('pickup');

  // Floating cart
  document.getElementById('floating-cart')?.addEventListener('click', openCart);

  // Lazy load sections
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.lazy) {
        e.target.style.backgroundImage = `url(${e.target.dataset.lazy})`;
        lazyObserver.unobserve(e.target);
      }
    });
  });
  document.querySelectorAll('[data-lazy]').forEach(el => lazyObserver.observe(el));
});
