import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { X, Check, Search, MapPin } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para el icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para la tienda (Dorado)
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Puedes pegar aquí directamente el enlace de Google Maps de tu tienda.
// Asegúrate de que el enlace contenga las coordenadas con el formato "@latitud,longitud" (ej. desde el navegador en PC).
const BUSINESS_MAPS_LINK = "https://www.google.com/maps/@-12.0738591,-77.0358593,18.14z?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D";

// Extraemos las coordenadas del enlace de forma automática
const getBusinessLocation = (link) => {
  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  // Coordenadas de respaldo por si el enlace no tiene el formato correcto
  return { lat: -12.07366, lng: -77.0587 }; 
};

const BUSINESS_LOCATION = getBusinessLocation(BUSINESS_MAPS_LINK); 

// Componente auxiliar para actualizar el centro del mapa dinámicamente
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, cartTotal, hasFood, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  
  // Estados para geocodificación y mapa
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const selectedAddressRef = useRef('');
  
  // Estados de cálculo y envío
  const [userLocation, setUserLocation] = useState(BUSINESS_LOCATION);
  const [shippingDistance, setShippingDistance] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  // Generar fechas de fin de semana para preventa de comida
  useEffect(() => {
    if (!isOpen) return;
    const dates = [];
    let current = new Date();
    current.setDate(current.getDate() + 1);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };

    for (let i = 0; i < 30 && dates.length < 6; i++) {
      const day = current.getDay();
      if (day === 0 || day === 6) { // Domingo (0) o Sábado (6)
        dates.push({
          value: current.toISOString().split('T')[0],
          label: current.toLocaleDateString('es-ES', options),
        });
      }
      current.setDate(current.getDate() + 1);
    }
    setAvailableDates(dates);
  }, [isOpen]);

  // Efecto para debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Efecto para buscar la dirección en Nominatim cuando cambia el debouncedQuery
  useEffect(() => {
    const searchAddress = async () => {
      // Si el texto es exactamente lo que el usuario acaba de seleccionar, no buscamos de nuevo.
      if (debouncedQuery === selectedAddressRef.current) {
        setSearchResults([]);
        setShowNoResults(false);
        return;
      }

      if (debouncedQuery.length < 4) {
        setSearchResults([]);
        setShowNoResults(false);
        return;
      }
      
      setIsSearching(true);
      setShowNoResults(false);
      try {
        // Mejorar la búsqueda asumiendo Lima si no se especifica, para resultados más exactos
        const queryLower = debouncedQuery.toLowerCase();
        const queryToSearch = (queryLower.includes('lima') || queryLower.includes('peru') || queryLower.includes('callao'))
          ? debouncedQuery 
          : `${debouncedQuery}, Lima, Peru`;

        // Añadir parámetros para mejorar la precisión y el idioma
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryToSearch)}&limit=5&countrycodes=pe&addressdetails=1`, {
          headers: {
            'Accept-Language': 'es'
          }
        });
        
        if (!res.ok) throw new Error('Error en la respuesta de red');
        const data = await res.json();
        setSearchResults(data);
        setShowNoResults(data.length === 0);
      } catch (error) {
        console.error("Error buscando dirección:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchAddress();
  }, [debouncedQuery]);

  // Manejador del input de direcciones
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowNoResults(false);
    selectedAddressRef.current = ''; // Resetear al escribir
  };

  const handleSelectAddress = (result) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    const newPos = { lat: newLat, lng: newLng };
    
    selectedAddressRef.current = result.display_name;
    setUserLocation(newPos);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setShowNoResults(false);
    calculateDistance(newLat, newLng);
  };

  // Cálculo de Distancia con OSRM y Lógica de Precios
  const calculateDistance = async (lat, lng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${BUSINESS_LOCATION.lng},${BUSINESS_LOCATION.lat};${lng},${lat}?overview=false`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const distKm = data.routes[0].distance / 1000;
        setShippingDistance(distKm);
        
        let cost = 0;
        if (distKm <= 5.0) {
          cost = 0;
        } else if (distKm <= 12.0) {
          cost = 10;
        } else {
          cost = 10 + (Math.ceil(distKm - 12) * 2);
        }
        setShippingCost(cost);
      }
    } catch (err) {
      console.error("Error calculando distancia", err);
    }
  };

  // Componente del Marcador Móvil del Cliente
  function CustomerMarker() {
    return (
      <Marker
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const newPos = marker.getLatLng();
            setUserLocation({ lat: newPos.lat, lng: newPos.lng });
            calculateDistance(newPos.lat, newPos.lng);
            setSearchQuery(''); // Limpiar búsqueda si mueve manual
          },
        }}
        position={userLocation}
      >
        <Popup>¡Tu ubicación de entrega!</Popup>
      </Marker>
    );
  }

  const finalTotal = cartTotal + (deliveryType === 'delivery' ? shippingCost : 0);

  const puntosGanadosEnEstaOrden = cart.reduce((total, item) => {
    // Asegurarnos de que sea un número, si no existe o está vacío, usar 0
    const puntosItem = parseInt(item.Puntos_Otorgados, 10) || 0;
    // Multiplicar por la cantidad de ese item en el carrito
    const cantidad = parseInt(item.qty, 10) || 1; 
    return total + (puntosItem * cantidad);
  }, 0);
  console.log("Puntos calculados del carrito:", puntosGanadosEnEstaOrden);

  // Envío e Integración del Flujo Híbrido
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Inspeccionando Carrito Completo:", JSON.stringify(cart, null, 2));
    console.log("Puntos a sumar en esta orden:", puntosGanadosEnEstaOrden);

    if (hasFood && !selectedDate) {
      alert('Por favor selecciona una fecha de entrega para tu pedido de comida.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const articulos = cart.map(item => `${item.name} (x${item.qty})`).join(', ');

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `NV-${randomCode}`;

    const mapLink = deliveryType === 'delivery' && shippingDistance !== null 
      ? `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}` 
      : 'N/A';

    const telefonoIngresado = formData.get('phone');

    const pedidoData = {
      ID_Pedido: generatedId,
      Fecha_Pedido: new Date().toISOString().split('T')[0],
      Nombre_Cliente: formData.get('name'),
      Telefono: telefonoIngresado,
      Direccion: deliveryType === 'pickup' 
        ? 'Recojo en tienda' 
        : `${formData.get('addressReference') || searchQuery} (GPS: ${mapLink})`,
      Metodo_Entrega: deliveryType,
      Dia_Entrega: hasFood ? selectedDate : 'N/A',
      Articulos_Comprados: articulos,
      Total: finalTotal.toFixed(2),
      Estado: 'Pendiente'
    };

    let nuevoTotalPuntos = puntosGanadosEnEstaOrden;

    try {
      console.log("1. Iniciando guardado de pedido...");
      await sheetsService.createOrder(pedidoData);

      console.log("2. Pedido guardado. Calculando puntos...");
      // La variable puntosGanadosEnEstaOrden ya tiene el cálculo

      console.log("3. Llamando a updateOrCreateClientePuntos con total:", puntosGanadosEnEstaOrden);
      nuevoTotalPuntos = await sheetsService.updateOrCreateClientePuntos(
        telefonoIngresado,
        formData.get('name'),
        puntosGanadosEnEstaOrden
      );

      console.log("4. Puntos guardados exitosamente. Abriendo WhatsApp...");
      
      const metodoTexto = deliveryType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio';
      const gpsLinkStr = deliveryType === 'delivery' ? `\n*Dirección:* ${pedidoData.Direccion}\n*Ubicación GPS:* ${mapLink}` : '';
      
      let mensaje = `¡Hola Namas-te-vistes! Acabo de registrar un pedido en la web.

 CÓDIGO DE PEDIDO: ${generatedId}
 Cliente: ${pedidoData.Nombre_Cliente} 
 Método: ${metodoTexto}${gpsLinkStr}

 Mi Pedido:
${cart.map(item => `- ${item.name} (x${item.qty})`).join('\n')}

 Total de referencia: S/ ${finalTotal.toFixed(2)}`;

      if (puntosGanadosEnEstaOrden > 0) {
        mensaje += `\n\n🌟 ¡Felicidades! Acabas de ganar ${puntosGanadosEnEstaOrden} puntos. Tu saldo total ahora es de ${nuevoTotalPuntos} puntos. ¡Guárdalos para canjear premios!`;
      }

      mensaje += `\n\n(Nota: Este pedido ya se encuentra registrado en el sistema bajo el código ${generatedId}. Los totales y disponibilidad están sujetos a verificación en la base de datos.)`;

      const mensajeCodificado = encodeURIComponent(mensaje);
      const numeroTelefono = '+51938828307'; 
      const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
      
      window.open(whatsappUrl, '_blank');

      clearCart();
      setIsSuccess(true);
    } catch (error) {
      console.error('Error en el flujo de Checkout:', error);
      alert('Hubo un problema guardando tu orden en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="checkout-overlay" className="open" role="dialog" aria-modal="true" aria-label="Finalizar pedido">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>Finalizar Pedido</h2>
          <button className="close-checkout" onClick={handleClose} aria-label="Cerrar checkout">
            <X size={20} />
          </button>
        </div>

        {!isSuccess ? (
          <div className="checkout-body">
            <div>
              <form id="checkout-form" onSubmit={handleSubmit} noValidate>
                <div className="checkout-section-title">Tus Datos</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-name">Nombre completo *</label>
                  <input type="text" id="checkout-name" name="name" className="form-control" placeholder="Ana García" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-email">Correo electrónico *</label>
                  <input type="email" id="checkout-email" name="email" className="form-control" placeholder="ana@email.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-phone">Teléfono / WhatsApp *</label>
                  <input type="tel" id="checkout-phone" name="phone" className="form-control" placeholder="Ej. 987 654 321 (sin código)" required 
                    value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                  {phoneInput.length >= 6 && puntosGanadosEnEstaOrden > 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-burgundy)', marginTop: '6px', fontWeight: 'bold' }}>
                      ✨ ¡Si ya eres cliente, ganarás {puntosGanadosEnEstaOrden} puntos con esta compra!
                    </p>
                  )}
                </div>

                <div className="checkout-section-title" style={{ marginTop: 20 }}>Tipo de Entrega</div>
                <div className="delivery-options" role="radiogroup">
                  <div 
                    className={`delivery-opt ${deliveryType === 'pickup' ? 'selected' : ''}`} 
                    onClick={() => { setDeliveryType('pickup'); setShippingCost(0); setShippingDistance(null); }}
                  >
                    <div className="radio-custom"></div>
                    <div className="delivery-icon">🏠</div>
                    <div className="delivery-info">
                      <div className="delivery-name">Recojo en tienda</div>
                      <div className="delivery-desc">Pasa a retirar tu pedido</div>
                    </div>
                    <div className="delivery-price free">Gratis</div>
                  </div>

                  <div 
                    className={`delivery-opt ${deliveryType === 'delivery' ? 'selected' : ''}`} 
                    onClick={() => setDeliveryType('delivery')}
                  >
                    <div className="radio-custom"></div>
                    <div className="delivery-icon">🛵</div>
                    <div className="delivery-info">
                      <div className="delivery-name">Envío a domicilio</div>
                      <div className="delivery-desc">Calculado en el mapa</div>
                    </div>
                    <div className="delivery-price">
                      {deliveryType === 'delivery' && shippingDistance !== null 
                        ? (shippingCost === 0 ? 'Gratis' : `+ S/ ${shippingCost.toFixed(2)}`) 
                        : 'A calcular'}
                    </div>
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="form-group map-section" style={{ marginTop: 20, marginBottom: 20, position: 'relative' }}>
                    <label className="form-label">📍 Busca tu dirección de entrega</label>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        className="form-control" 
                        placeholder="Ej. Jirón de la Unión, Lima" 
                        autoComplete="off"
                      />
                      <Search size={18} style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--color-text-light)' }} />
                      
                      {isSearching && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                          Buscando...
                        </div>
                      )}
                      
                      {showNoResults && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                          No se encontraron resultados. Intenta buscar calles o cruces.
                        </div>
                      )}

                      {!isSearching && searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                          {searchResults.map((res, index) => (
                            <div 
                              key={index} 
                              onClick={() => handleSelectAddress(res)}
                              style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-cream)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                            >
                              <MapPin size={16} style={{ flexShrink: 0, color: 'var(--color-burgundy)', marginTop: '2px' }} />
                              <span>{res.display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '8px' }}>También puedes arrastrar el marcador libremente por el mapa.</p>
                    
                    <div style={{ height: '280px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: '12px', zIndex: 0, position: 'relative' }}>
                      <MapContainer center={BUSINESS_LOCATION} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                        
                        {/* Marcador Fijo de la Tienda */}
                        <Marker position={BUSINESS_LOCATION} icon={storeIcon}>
                          <Popup>Namas-te-vistes (Tienda)</Popup>
                        </Marker>

                        {/* Marcador Móvil del Cliente */}
                        <CustomerMarker />
                        <MapUpdater center={userLocation} />
                      </MapContainer>
                    </div>
                    
                    {shippingDistance !== null && (
                      <div style={{ padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-dark)' }}>
                        <strong>Distancia estimada:</strong> {shippingDistance.toFixed(2)} km <br/>
                        <strong>Costo de envío:</strong> {shippingCost === 0 ? 'S/ 0.00 (Gratis)' : `S/ ${shippingCost.toFixed(2)}`}
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: 14 }}>
                      <label className="form-label" htmlFor="checkout-addressReference">Detalles adicionales de entrega *</label>
                      <input type="text" id="checkout-addressReference" name="addressReference" className="form-control" placeholder="Ej. Casa verde, puerta blanca, 2do piso" required />
                    </div>
                  </div>
                )}

                {hasFood && (
                  <div className="date-picker-section">
                    <div className="date-picker-label">
                      📅 Selecciona tu fecha de entrega
                    </div>
                    <p style={{ fontSize: '.75rem', color: 'var(--color-text-light)', marginBottom: 10 }}>Solo disponible sábados y domingos</p>
                    <div className="date-options">
                      {availableDates.map(date => (
                        <button 
                          type="button"
                          key={date.value}
                          className={`date-option ${selectedDate === date.value ? 'selected' : ''}`}
                          onClick={() => setSelectedDate(date.value)}
                        >
                          {date.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label" htmlFor="checkout-notes">Notas del pedido (opcional)</label>
                  <textarea id="checkout-notes" name="notes" className="form-control" rows={2} placeholder="Alergias, preferencias..."></textarea>
                </div>
              </form>
            </div>

            <div>
              <div className="checkout-section-title">🧾 Resumen del Pedido</div>
              <div>
                {cart.map(item => (
                  <div className="order-summary-item" key={item.id}>
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">×{item.qty}</span>
                    <span className="order-item-price">S/ {(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {deliveryType === 'delivery' && (
                <div className="order-summary-item" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--color-border)' }}>
                  <span className="order-item-name">Costo de Envío</span>
                  <span className="order-item-price">S/ {shippingCost.toFixed(2)}</span>
                </div>
              )}
              
              <div className="order-total-row" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span>
                <span>S/ {finalTotal.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: 20, padding: 14, background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', fontSize: '.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--color-burgundy)' }}>ℹ️ Información importante</strong><br />
                Los pedidos de <strong>comida</strong> están sujetos al modelo de preventa semanal. 
                Cerramos pedidos los <strong>viernes</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div className="checkout-success" style={{ display: 'flex' }}>
            <div className="success-icon"><Check size={40} /></div>
            <h3>¡Pedido realizado!</h3>
            <p>Gracias por tu compra. Te contactaremos vía WhatsApp para confirmar los detalles. Tu pedido será preparado con mucho amor. 🪷</p>
            <button className="btn btn-gold" onClick={handleClose}>Volver a la tienda</button>
          </div>
        )}

        {!isSuccess && (
          <div className="checkout-footer">
            <button type="submit" form="checkout-form" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : '✅ Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
