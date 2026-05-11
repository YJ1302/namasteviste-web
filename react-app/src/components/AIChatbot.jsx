import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Soy Namaste-Bot 🤖. ¿En qué te puedo ayudar hoy? Pregúntame sobre envíos, comida o henna.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAIResponse(userText);
      setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'bot' }]);
      setIsTyping(false);
    }, 1500);
  };

  // Robust Rule-based simulated AI
  const generateAIResponse = (text) => {
    // Normalizar texto (quitar tildes y pasar a minúsculas)
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const intents = [
      {
        keywords: ['hola', 'buenas', 'que tal', 'hi', 'hello', 'saludos', 'buenos dias', 'buenas tardes'],
        response: '¡Hola de nuevo! 😊 ¿En qué te puedo asesorar? Puedes preguntarme sobre nuestros productos, envíos, comida o cómo ganar puntos.'
      },
      {
        keywords: ['envio', 'delivery', 'llegan', 'cobertura', 'costo', 'mandar', 'distrito', 'miraflores', 'surco', 'san isidro', 'lima', 'reparto'],
        response: '🛵 Hacemos envíos a casi toda Lima Metropolitana. El costo se calcula automáticamente en el mapa cuando finalizas tu compra (generalmente entre S/10 y S/15 dependiendo de la distancia). ¡También puedes recoger en tienda gratis!'
      },
      {
        keywords: ['vegetariano', 'vegano', 'carne', 'pollo', 'sin carne', 'verduras', 'vegetal', 'dieta'],
        response: '🥬 ¡Sí! Tenemos opciones vegetarianas deliciosas, como nuestras Samosas Clásicas de papa y alverja. Puedes usar el filtro "Vegetariano" en la sección de comida para verlas todas.'
      },
      {
        keywords: ['henna', 'dura', 'tatuaje', 'cono', 'natural', 'temporal', 'mehendi', 'diseño', 'pintura'],
        response: '✨ La henna natural dura de 1 a 2 semanas dependiendo del cuidado y la zona del cuerpo. Nuestros conos son 100% orgánicos, traídos directamente de la India y seguros para la piel. Recuerda que vendemos el producto, ¡no hacemos la aplicación!'
      },
      {
        keywords: ['puntos', 'recompensa', 'descuento', 'gratis', 'canjear', 'ganar', 'fidelidad', 'promocion'],
        response: '🎁 ¡Nuestro programa de puntos es genial! Con cada compra ganas puntos que puedes canjear por premios, descuentos de S/25 y productos gratis. Solo asegúrate de ingresar tu celular al finalizar la compra para acumularlos.'
      },
      {
        keywords: ['picante', 'especias', 'aji', 'fuerte', 'condimento', 'masala', 'curry'],
        response: '🌶️ La comida india es famosa por sus especias. Nuestro Chicken Tikka Masala tiene un toque picante delicioso pero muy tolerable para el paladar peruano. ¡Si te gusta el sabor intenso, te encantará!'
      },
      {
        keywords: ['dulce', 'postre', 'azucar', 'gulab', 'jamun', 'pastel', 'helado'],
        response: '🍯 ¡Para los golosos tenemos el Gulab Jamun! Son unas bolitas de masa frita sumergidas en un almíbar caliente con cardamomo y agua de rosas. Es el postre más famoso de la India y te va a fascinar.'
      },
      {
        keywords: ['precio', 'cuesta', 'cuanto', 'vale', 'pagar', 'yape', 'plin', 'tarjeta', 'efectivo', 'metodo'],
        response: '💳 Los precios varían según el producto, puedes agregarlos a tu carrito para ver el total. Aceptamos Yape, Plin, transferencias y efectivo. El pago se coordina por WhatsApp una vez que generas tu orden.'
      },
      {
        keywords: ['hora', 'horario', 'abierto', 'cuando', 'abren', 'cierran', 'dias', 'atencion'],
        response: '🕒 La tienda física atiende de Lunes a Sábado de 10 AM a 8 PM. Recuerda que la COMIDA funciona por PREVENTA: haces tu pedido en la semana y te lo entregamos fresquito el sábado o domingo.'
      },
      {
        keywords: ['ropa', 'vestido', 'joyeria', 'aretes', 'collar', 'accesorio', 'moda', 'sari', 'kurti', 'pulsera'],
        response: '👗 En nuestra tienda tenemos ropa y joyería importada de la India. Usamos materiales de alta calidad, piedras hermosas y diseños exclusivos. ¡Revisa la pestaña "Tienda" para ver el catálogo!'
      },
      {
        keywords: ['bebida', 'tomar', 'sed', 'refresco', 'lassi', 'chai', 'te'],
        response: '☕ El té Chai (Masala Chai) y el Mango Lassi son las bebidas más tradicionales. Pronto las tendremos disponibles en nuestro menú online, ¡mantente atento a nuestras redes!'
      },
      {
        keywords: ['comida', 'tipo', 'menu', 'platos', 'venden', 'hambre', 'comer', 'restaurante', 'ofrecen'],
        response: '🍛 Preparamos comida auténtica de la India: Chicken Tikka Masala, Samosas crujientes, Arroz Basmati y postres típicos. ¡Todo con especias originales! Funciona por preventa de fin de semana.'
      },
      {
        keywords: ['gracias', 'ok', 'perfecto', 'genial', 'listo', 'entendido', 'vale'],
        response: '¡De nada! 🙌 Ha sido un placer ayudarte. Si tienes alguna otra duda, aquí estaré. ¡Que disfrutes tu experiencia en Namas-te-vistes!'
      }
    ];

    let bestMatch = null;
    let maxScore = 0;

    // Tokenizar el input del usuario para buscar palabras exactas
    const words = lower.split(/[\s,¿?¡!.]+/).filter(w => w.length > 2);

    for (const intent of intents) {
      let score = 0;
      for (const keyword of intent.keywords) {
        // Match exacto de palabra da mas puntos
        if (words.includes(keyword)) {
          score += 2;
        } 
        // Match parcial da menos puntos
        else if (lower.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = intent;
      }
    }

    if (bestMatch && maxScore > 0) {
      return bestMatch.response;
    }

    // Default responses randomized to feel more natural
    const defaults = [
      "¡Qué interesante! 🤔 Mi conocimiento aún es un poco limitado sobre eso. Si necesitas ayuda más específica o hacer un pedido especial, escríbenos directamente a nuestro WhatsApp.",
      "Mmm, no estoy seguro de tener la respuesta a eso. 😅 Te sugiero contactarnos por WhatsApp para que una persona del equipo te atienda directamente.",
      "Todavía estoy aprendiendo sobre algunos temas. 🤖 ¡Pero nuestro equipo en tienda te puede ayudar! Contáctanos por WhatsApp."
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`chatbot-trigger ${isOpen ? 'hidden' : ''}`}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--color-burgundy)', color: 'white',
          border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.3s'
        }}
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          width: '350px', height: '500px', backgroundColor: 'white',
          borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            background: 'var(--color-burgundy)', color: 'white', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Namaste-Bot AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--color-surface)' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: '8px', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {m.sender === 'bot' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={18} color="var(--color-burgundy)" /></div>}
                
                <div style={{
                  padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.4,
                  background: m.sender === 'user' ? 'var(--color-burgundy)' : '#fff',
                  color: m.sender === 'user' ? 'white' : 'var(--color-dark)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                  borderBottomRightRadius: m.sender === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: m.sender === 'bot' ? '4px' : '12px',
                }}>
                  {m.text}
                </div>

                {m.sender === 'user' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={18} color="white" /></div>}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={18} color="var(--color-burgundy)" /></div>
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fff', border: '1px solid var(--color-border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--color-text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--color-text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--color-text-light)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', background: 'white', borderTop: '1px solid var(--color-border)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '24px', outline: 'none', fontSize: '0.9rem' }}
            />
            <button type="submit" disabled={!input.trim()} style={{ background: 'var(--color-burgundy)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.6 }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
