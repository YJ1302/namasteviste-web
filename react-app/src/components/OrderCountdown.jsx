import React from 'react';
import { useOrderWindow } from './CountdownTimer';

const pad = (n) => String(n).padStart(2, '0');

function Digits({ value }) {
  return (
    <span className="mx-digits">
      {pad(value).split('').map((c, i) => <span key={`${i}-${c}`} className="mx-digit">{c}</span>)}
    </span>
  );
}

// Dark-theme order deadline: ticking h / m / s boxes, or a closed notice.
export default function OrderCountdown() {
  const { isOrderingOpen, timeLeft } = useOrderWindow();

  if (!isOrderingOpen) {
    return <div className="mx-count closed">Pedidos cerrados este fin de semana · <strong>abrimos el lunes</strong></div>;
  }

  return (
    <div className="mx-count">
      <span className="mx-count-label"><span className="mx-dot" />Pedidos cierran en</span>
      <div className="mx-count-boxes">
        {[['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([u, v]) => (
          <div className="mx-box" key={u}><Digits value={v} /><small>{u}</small></div>
        ))}
      </div>
    </div>
  );
}
