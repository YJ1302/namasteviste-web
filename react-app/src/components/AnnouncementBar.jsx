import React from 'react';
import { CalendarDays, Truck, Gift, Sparkle } from 'lucide-react';

const ITEMS = [
  { icon: CalendarDays, label: 'Pedidos de comida:', strong: 'Lunes a Viernes' },
  { icon: Truck, label: 'Entregas:', strong: 'Sábado y Domingo' },
  { icon: Gift, label: '¡Envío', strong: 'GRATIS', after: 'a menos de 5 km!' },
];

export default function AnnouncementBar() {
  return (
    <div id="announcement-bar" role="banner" aria-label="Aviso de pedidos">
      <div className="announcement-track" aria-live="polite">
        {/* Repetido tres veces para un loop fluido */}
        {[0, 1, 2].flatMap((rep) => ITEMS.map(({ icon: Icon, label, strong, after }, i) => (
          <React.Fragment key={`${rep}-${i}`}>
            <span className="announcement-item">
              <Icon size={15} /> {label} <strong>{strong}</strong>{after ? ` ${after}` : ''}
            </span>
            <span className="sep" aria-hidden="true"><Sparkle size={12} /></span>
          </React.Fragment>
        )))}
      </div>
    </div>
  );
}
