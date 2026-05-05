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

const CATALOGO_PREMIOS = [
  { id: 'p1', nombre: '1 Porción de Gulab Jamun', costo: 60, img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80' },
  { id: 'p2', nombre: '1 Cono de Henna Natural', costo: 100, img: '/images/henna_products.png' },
  { id: 'p3', nombre: 'Aretes Sorpresa', costo: 150, img: '/images/indian_jewelry.png' },
  { id: 'p4', nombre: 'Descuento de S/ 25', costo: 250, img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80' }
];

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

export default function CheckoutModal({ isOpen, onClose, todosLosProductos = [] }) {
  const { cart, cartTotal, hasFood, clearCart, addToCart } = useCart();
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [phoneInput, setPhoneInput] = useState('');
  
  // Estados para canje de puntos
  const [telefonoConsulta, setTelefonoConsulta] = useState('');
  const [puntosDisponibles, setPuntosDisponibles] = useState(0);
  const [clienteVerificado, setClienteVerificado] = useState(false);
  const [premiosSeleccionados, setPremiosSeleccionados] = useState([]);
  const [isVerifyingPoints, setIsVerifyingPoints] = useState(false);

  // Estados para upsell y UI
  const [toastMessage, setToastMessage] = useState('');
  const [itemDetalleModal, setItemDetalleModal] = useState(null);
  const [upsellItems, setUpsellItems] = useState([]);

  useEffect(() => {
    if (isOpen && todosLosProductos && todosLosProductos.length > 0) {
      const lowCost = todosLosProductos.filter(p => parseFloat(p.price) <= 35);
      const pool = lowCost.length >= 3 ? lowCost : todosLosProductos;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setUpsellItems(shuffled.slice(0, 3));
    }
  }, [isOpen, todosLosProductos]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

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
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

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
    }, 400);

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

      const cleanQuery = debouncedQuery.replace(/[^\w\s\u00C0-\u017F,.-]/gi, '').trim();
      if (cleanQuery.length < 3) {
        setSearchResults([]);
        setShowNoResults(false);
        return;
      }
      
      setIsSearching(true);
      setShowNoResults(false);
      try {
        // Mejorar la búsqueda asumiendo Lima si no se especifica, para resultados más exactos
        const queryLower = cleanQuery.toLowerCase();
        const queryToSearch = (queryLower.includes('lima') || queryLower.includes('peru') || queryLower.includes('callao'))
          ? cleanQuery 
          : `${cleanQuery}, Lima, Peru`;

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
    setIsCalculatingDistance(true);
    // Haversine fallback
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat - BUSINESS_LOCATION.lat) * (Math.PI / 180);
    const dLng = (lng - BUSINESS_LOCATION.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(BUSINESS_LOCATION.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const directDistance = R * c;
    const estimatedDrivingDistance = directDistance * 1.35; // Multiplicador para rutas reales
    
    let finalDistKm = estimatedDrivingDistance;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout para no trabar la UI
      const url = `https://router.project-osrm.org/route/v1/driving/${BUSINESS_LOCATION.lng},${BUSINESS_LOCATION.lat};${lng},${lat}?overview=false`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          finalDistKm = data.routes[0].distance / 1000;
        }
      }
    } catch (err) {
      console.warn("OSRM falló o expiró, usando distancia estimada (Haversine)", err);
    }
    
    setShippingDistance(finalDistKm);
    
    let cost = 0;
    if (finalDistKm <= 5.0) {
      cost = 0;
    } else if (finalDistKm <= 12.0) {
      cost = 10;
    } else {
      cost = 10 + (Math.ceil(finalDistKm - 12) * 2);
    }
    setShippingCost(cost);
    setIsCalculatingDistance(false);
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

  const puntosGastados = premiosSeleccionados.reduce((sum, p) => sum + p.costo, 0);
  const puntosRestantes = puntosDisponibles - puntosGastados;

  const finalTotal = cartTotal + (deliveryType === 'delivery' ? shippingCost : 0);

  let totalPagar = finalTotal;
  const descuentos = premiosSeleccionados.filter(p => p.nombre.includes('Descuento de S/ 25')).length;
  if (descuentos > 0) {
    totalPagar = Math.max(0, finalTotal - (25 * descuentos));
  }

  const puntosGanadosEnEstaOrden = cart.reduce((total, item) => {
    // Asegurarnos de que sea un número, si no existe o está vacío, usar 0
    const puntosItem = parseInt(item.Puntos_Otorgados, 10) || 0;
    // Multiplicar por la cantidad de ese item en el carrito
    const cantidad = parseInt(item.qty, 10) || 1; 
    return total + (puntosItem * cantidad);
  }, 0);
  console.log("Puntos calculados del carrito:", puntosGanadosEnEstaOrden);

  const handleVerificarPuntos = async () => {
    if (!telefonoConsulta) return;
    setIsVerifyingPoints(true);
    const cliente = await sheetsService.getClientePuntos(telefonoConsulta);
    if (cliente) {
      setPuntosDisponibles(parseInt(cliente.Puntos_Acumulados, 10) || 0);
      setPhoneInput(telefonoConsulta); // Autocompletar el teléfono de la orden
    } else {
      setPuntosDisponibles(0);
      alert('No se encontraron puntos para este número. Empezarás a acumular con esta orden.');
      setPhoneInput(telefonoConsulta);
    }
    setClienteVerificado(true);
    setIsVerifyingPoints(false);
  };

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

    const nuevoTotalPuntosCalculado = puntosRestantes + puntosGanadosEnEstaOrden;

    let articulosStr = articulos;
    const premiosFisicos = premiosSeleccionados.filter(p => !p.nombre.includes('Descuento de S/ 25'));
    if (premiosFisicos.length > 0) {
      articulosStr += `, ${premiosFisicos.map(p => `${p.nombre} (Premio)`).join(', ')}`;
    }

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
      Articulos_Comprados: articulosStr,
      Total: totalPagar.toFixed(2),
      Estado: 'Pendiente'
    };

    let nuevoTotalPuntos = nuevoTotalPuntosCalculado;

    try {
      console.log("1. Iniciando guardado de pedido...");
      setSubmitStep(1);
      
      const minimumDelay = new Promise(resolve => {
        setTimeout(() => setSubmitStep(2), 2000);
        setTimeout(resolve, 4000);
      });

      const backendWork = async () => {
        await sheetsService.createOrder(pedidoData);
        console.log("2. Pedido guardado. Actualizando puntos...");
        console.log("3. Llamando a updateOrCreateClientePuntos con total:", nuevoTotalPuntosCalculado);
        nuevoTotalPuntos = await sheetsService.updateOrCreateClientePuntos(
          telefonoIngresado,
          formData.get('name'),
          nuevoTotalPuntosCalculado
        );
      };

      await Promise.all([backendWork(), minimumDelay]);

      console.log("4. Puntos guardados exitosamente. Abriendo WhatsApp...");
      
      const metodoTexto = deliveryType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio';
      const gpsLinkStr = deliveryType === 'delivery' ? `\n*Dirección:* ${pedidoData.Direccion}\n*Ubicación GPS:* ${mapLink}` : '';
      
      let premioTexto = '';
      if (premiosSeleccionados.length > 0) {
        premioTexto = `\n🎁 Premios canjeados:\n${premiosSeleccionados.map(p => `  - ${p.nombre} (-${p.costo} pts)`).join('\n')}`;
      }

      let mensaje = `¡Hola Namas-te-vistes! Acabo de registrar un pedido en la web.

 CÓDIGO DE PEDIDO: ${generatedId}
 Cliente: ${pedidoData.Nombre_Cliente} 
 Método: ${metodoTexto}${gpsLinkStr}

 Mi Pedido:
${cart.map(item => `- ${item.name} (x${item.qty})`).join('\n')}${premioTexto}

 Total a pagar: S/ ${totalPagar.toFixed(2)}`;

      if (puntosGanadosEnEstaOrden > 0 || puntosGastados > 0) {
        mensaje += `\n\n🌟 Con esta compra ganaste ${puntosGanadosEnEstaOrden} puntos. Gastaste ${puntosGastados} puntos en premios. Tu saldo total actualizado es de ${nuevoTotalPuntos} puntos.`;
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
      setSubmitStep(0);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {isSubmitting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(253, 250, 246, 0.98)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2147483647,
          pointerEvents: 'all'
        }}>
          {submitStep === 1 || submitStep === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <img src="/images/food-tray.gif" alt="Listing details" style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 24, animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)', fontSize: '2rem', animation: 'fadeIn 0.5s ease-out' }}>Alistando los detalles de su pedido...</h3>
              <p style={{ color: 'var(--color-text)', marginTop: 12, fontSize: '1.1rem', animation: 'fadeIn 0.7s ease-out' }}>Agregando especias indias a su pedido</p>
            </div>
          ) : submitStep === 2 ? (
            <div style={{ textAlign: 'center' }}>
              <img src="/images/healthy-meal.gif" alt="Preparing receipt" style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 24, animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)', fontSize: '2rem', animation: 'fadeIn 0.5s ease-out' }}>Preparando su recibo de WhatsApp...</h3>
              <p style={{ color: 'var(--color-text)', marginTop: 12, fontSize: '1.1rem', animation: 'fadeIn 0.7s ease-out' }}>¡Conectando con la cocina</p>
            </div>
          ) : null}
        </div>
      )}

      <div id="checkout-overlay" className="open" role="dialog" aria-modal="true" aria-label="Finalizar pedido" style={isSubmitting ? { pointerEvents: 'none' } : {}}>
        <div className="checkout-modal">
          <div className="checkout-header">
          <h2>Finalizar Pedido</h2>
          <button className="close-checkout" onClick={handleClose} aria-label="Cerrar checkout" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {!isSuccess ? (
          <div className="checkout-body">
            <div>
              <form id="checkout-form" onSubmit={handleSubmit} noValidate>
                {/* --- SECCIÓN DE PUNTOS --- */}
                <div className="checkout-section-title">Canje de Puntos</div>
                <div style={{ background: 'var(--color-cream)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--color-border)' }}>
                  {!clienteVerificado ? (
                    <div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>¿Tienes puntos acumulados? Ingresa tu número para canjear premios en esta orden.</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="tel" 
                          className="form-control" 
                          placeholder="Tu número celular" 
                          value={telefonoConsulta} 
                          onChange={(e) => setTelefonoConsulta(e.target.value)} 
                          style={{ flex: 1 }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          onClick={handleVerificarPuntos} 
                          disabled={isVerifyingPoints || !telefonoConsulta}
                          style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                        >
                          {isVerifyingPoints ? 'Verificando...' : 'Verificar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-dark)' }}>
                          Puntos Restantes: <span style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>{puntosRestantes}</span>
                        </div>
                        <button type="button" onClick={() => {setClienteVerificado(false); setPremiosSeleccionados([]);}} style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                          Cambiar número
                        </button>
                      </div>
                      
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>Elige tus premios:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {CATALOGO_PREMIOS.map(premio => {
                          const isAffordable = puntosRestantes >= premio.costo;
                          
                          // Buscamos la imagen real en la base de datos si existe el producto
                          let displayImg = premio.img;
                          if (premio.id !== 'p4') {
                            const match = todosLosProductos.find(p => 
                              premio.nombre.toLowerCase().includes(p.name.toLowerCase()) || 
                              (premio.nombre.toLowerCase().includes('gulab') && p.name.toLowerCase().includes('gulab')) ||
                              (premio.nombre.toLowerCase().includes('henna') && p.name.toLowerCase().includes('henna')) ||
                              (premio.nombre.toLowerCase().includes('aretes') && p.name.toLowerCase().includes('aretes'))
                            );
                            if (match && match.img) {
                              displayImg = match.img;
                            }
                          }

                          return (
                            <div key={premio.id} style={{
                              background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px',
                              opacity: isAffordable ? 1 : 0.5, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between',
                              overflow: 'hidden'
                            }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {displayImg && (
                                  <img src={displayImg} alt={premio.nombre} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                                )}
                                <div>
                                  <h4 style={{ fontSize: '0.85rem', margin: 0, color: 'var(--color-dark)', lineHeight: 1.2 }}>{premio.nombre}</h4>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>{premio.costo} pts</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={!isAffordable}
                                onClick={() => {
                                  setPremiosSeleccionados([...premiosSeleccionados, premio]);
                                  showToast('¡Premio canjeado!');
                                }}
                                style={{ background: 'var(--color-burgundy)', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: isAffordable ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                + Canjear
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {upsellItems.length > 0 && (
                  <>
                    <div className="checkout-section-title">Aprovecha el envío</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>Agrega estos productos a tu orden:</p>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
                      {upsellItems.map(item => (
                        <div key={item.id} style={{
                          minWidth: '140px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer'
                        }} onClick={() => setItemDetalleModal(item)}>
                          <img src={item.img || '/images/default_food.png'} alt={item.name} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                            <div>
                              <h4 style={{ fontSize: '0.8rem', margin: 0, color: 'var(--color-dark)', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>S/ {parseFloat(item.price).toFixed(2)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                                showToast('¡Agregado al carrito!');
                              }}
                              style={{ background: 'var(--color-burgundy)', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}
                            >
                              + Agregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

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
                      {deliveryType === 'delivery' 
                        ? (isCalculatingDistance ? <span style={{color: 'var(--color-gold)'}}>Calculando...</span> : (shippingDistance !== null ? (shippingCost === 0 ? 'Gratis' : `+ S/ ${shippingCost.toFixed(2)}`) : 'A calcular'))
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
                    
                    {isCalculatingDistance ? (
                      <div style={{ padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Calculando distancia de entrega...
                      </div>
                    ) : shippingDistance !== null ? (
                      <div style={{ padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-dark)' }}>
                        <strong>Distancia estimada:</strong> {shippingDistance.toFixed(2)} km <br/>
                        <strong>Costo de envío:</strong> {shippingCost === 0 ? 'S/ 0.00 (Gratis)' : `S/ ${shippingCost.toFixed(2)}`}
                      </div>
                    ) : null}

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

              {premiosSeleccionados.map((premio, idx) => (
                <div key={`premio-${idx}`} className="order-summary-item" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--color-border)', color: 'var(--color-gold)', fontWeight: 600 }}>
                  <span className="order-item-name">🎁 {premio.nombre} (Canje)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="order-item-price">{premio.nombre.includes('Descuento de S/ 25') ? '- S/ 25.00' : 'GRATIS'}</span>
                    <button type="button" onClick={() => {
                      const newPremios = [...premiosSeleccionados];
                      newPremios.splice(idx, 1);
                      setPremiosSeleccionados(newPremios);
                    }} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="order-total-row" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span>
                <span>S/ {totalPagar.toFixed(2)}</span>
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

      {itemDetalleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }} onClick={() => setItemDetalleModal(null)}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', maxWidth: '400px', width: '90%', overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={itemDetalleModal.img || '/images/default_food.png'} alt={itemDetalleModal.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-burgundy)', fontFamily: 'var(--font-display)' }}>{itemDetalleModal.name}</h3>
              <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>{itemDetalleModal.desc || 'Sin descripción disponible.'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-dark)' }}>S/ {parseFloat(itemDetalleModal.price).toFixed(2)}</span>
                <button onClick={() => {
                  addToCart(itemDetalleModal);
                  setItemDetalleModal(null);
                  showToast('¡Agregado al carrito!');
                }} className="btn btn-primary btn-sm">
                  Añadir al carrito
                </button>
              </div>
            </div>
            <button onClick={() => setItemDetalleModal(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-burgundy)', color: 'white', padding: '12px 24px',
          borderRadius: '30px', zIndex: 9999999, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
    </>
  );
}
