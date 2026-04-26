import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function useOrderWindow() {
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday, 1 is Monday ... 5 is Friday
      const hours = now.getHours();

      // Check if it's closed:
      // Closed if: Friday after 12:00 PM (day 5, hours >= 12),
      // Saturday (day 6), Sunday (day 0),
      // or Monday before 8:00 AM (day 1, hours < 8)
      const isClosed = 
        (day === 5 && hours >= 12) || 
        day === 6 || 
        day === 0 || 
        (day === 1 && hours < 8);

      setIsOrderingOpen(!isClosed);

      if (!isClosed) {
        // Calculate next Friday 12:00 PM
        const nextFriday = new Date(now);
        // Calculate days until Friday
        // If today is Monday(1), days to Friday is 4. (5 - 1 = 4)
        // If today is Friday(5) before 12:00 PM, days to Friday is 0.
        const daysUntilFriday = (5 - day + 7) % 7;
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        nextFriday.setHours(12, 0, 0, 0);
        
        const diffMs = nextFriday - now;
        if (diffMs > 0) {
          const totalSeconds = Math.floor(diffMs / 1000);
          const h = Math.floor(totalSeconds / 3600);
          const m = Math.floor((totalSeconds % 3600) / 60);
          const s = totalSeconds % 60;
          setTimeLeft({ h, m, s });
        }
      }
    };

    // Calculate immediately
    calculateTime();
    // Update every second
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return { isOrderingOpen, timeLeft };
}

export default function CountdownTimer() {
  const { isOrderingOpen, timeLeft } = useOrderWindow();

  if (!isOrderingOpen) {
    return (
      <div style={{ 
        backgroundColor: 'var(--color-burgundy)', 
        color: 'white', 
        padding: '16px 20px', 
        textAlign: 'center', 
        fontWeight: '500', 
        borderRadius: 'var(--radius-md)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(114, 47, 55, 0.2)'
      }}>
        <Clock size={20} />
        <span>Pedidos de comida cerrados por este fin de semana. <strong>¡Abrimos el lunes!</strong></span>
      </div>
    );
  }

  // Formatear a dos dígitos
  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div style={{ 
      backgroundColor: '#f9f1e7', // Warm tone background
      border: '1px solid var(--color-gold)',
      color: 'var(--color-dark)', 
      padding: '16px 20px', 
      textAlign: 'center', 
      fontWeight: '600', 
      borderRadius: 'var(--radius-md)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '10px', 
      marginBottom: '24px', 
      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)' 
    }}>
      <Clock size={20} color="var(--color-gold)" />
      <span>
        ¡Asegura tu pedido! Cierre en: <span style={{ color: 'var(--color-burgundy)', fontWeight: '700' }}>{pad(timeLeft.h)}h {pad(timeLeft.m)}m {pad(timeLeft.s)}s</span>
      </span>
    </div>
  );
}
