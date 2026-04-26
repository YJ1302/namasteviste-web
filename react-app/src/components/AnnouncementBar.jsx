import React from 'react';

export default function AnnouncementBar() {
  return (
    <div id="announcement-bar" role="banner" aria-label="Aviso de pedidos">
      <div className="announcement-track" aria-live="polite">
        <span>📅 Pedidos de comida: <strong>Lunes a Viernes</strong></span>
        <span className="sep">✦</span>
        <span>🚚 Entregas: <strong>Sábado y Domingo</strong></span>
        <span className="sep">✦</span>
        <span>🎉 ¡Envío <strong>GRATIS</strong> a menos de 5 km!</span>
        <span className="sep">✦</span>
        <span>🌺 Compra tu kit de henna o joyería con tu pedido de comida sin costo extra de envío</span>
        <span className="sep">✦</span>
        {/* Duplicado para efecto loop fluido */}
        <span>📅 Pedidos de comida: <strong>Lunes a Viernes</strong></span>
        <span className="sep">✦</span>
        <span>🚚 Entregas: <strong>Sábado y Domingo</strong></span>
        <span className="sep">✦</span>
        <span>🎉 ¡Envío <strong>GRATIS</strong> a menos de 5 km!</span>
        <span className="sep">✦</span>
        <span>🌺 Compra tu kit de henna o joyería con tu pedido de comida sin costo extra de envío</span>
        <span className="sep">✦</span>
      </div>
    </div>
  );
}
