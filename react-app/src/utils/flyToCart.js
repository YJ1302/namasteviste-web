// Clone the dish photo and fly it into the header cart icon.
export function flyToCart(img) {
  const cart = document.querySelector('button[aria-label="Carrito de compras"]');
  if (!img || !cart || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = img.getBoundingClientRect();
  const b = cart.getBoundingClientRect();
  const ghost = img.cloneNode();
  Object.assign(ghost.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    objectFit: 'cover', borderRadius: '24px', zIndex: 2000, pointerEvents: 'none', margin: 0,
  });
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  ghost.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 90}px) scale(.42) rotate(-14deg)`, opacity: 1, borderRadius: '40%', offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(.06) rotate(-40deg)`, opacity: 0.4, borderRadius: '50%' },
  ], { duration: 950, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => {
    ghost.remove();
    cart.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4) rotate(-10deg)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  };
}
