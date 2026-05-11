import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Utensils, Box, X } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'shop' | 'backgrounds'
  const [menuItems, setMenuItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [backgroundItems, setBackgroundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: '', Puntos_Otorgados: '', Tipo_Dieta: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const menu = await sheetsService.getAllFoodMenu();
    const shop = await sheetsService.getAllShopInventory();
    const bg = await sheetsService.getAllBackgrounds();
    setMenuItems(menu);
    setShopItems(shop);
    setBackgroundItems(bg);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (index, value) => {
    const urls = formData.Imagen_URL ? formData.Imagen_URL.split(',').map(u => u.trim()) : [''];
    urls[index] = value;
    setFormData({ ...formData, Imagen_URL: urls.join(', ') });
  };

  const addImageUrlField = () => {
    const urls = formData.Imagen_URL ? formData.Imagen_URL.split(',').map(u => u.trim()) : [''];
    urls.push('');
    setFormData({ ...formData, Imagen_URL: urls.join(', ') });
  };

  const removeImageUrlField = (index) => {
    const urls = formData.Imagen_URL ? formData.Imagen_URL.split(',').map(u => u.trim()) : [''];
    urls.splice(index, 1);
    if (urls.length === 0) urls.push('');
    setFormData({ ...formData, Imagen_URL: urls.join(', ') });
  };

  const convertDriveLink = (url) => {
    if (!url) return url;
    const urls = url.split(',').map(u => u.trim());
    
    const fixedUrls = urls.map(u => {
      const match1 = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1 && match1[1]) return `https://drive.google.com/uc?export=view&id=${match1[1]}`;
      
      const match2 = u.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
      if (match2 && match2[1]) return `https://drive.google.com/uc?export=view&id=${match2[1]}`;

      return u;
    });

    return fixedUrls.join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalImageUrl = convertDriveLink(formData.Imagen_URL);

      if (activeTab === 'menu') {
        const payload = {
          ID: formData.ID,
          Nombre: formData.Nombre,
          Descripcion: formData.Descripcion,
          Precio: formData.Precio,
          Categoria: formData.Categoria,
          Imagen_URL: finalImageUrl,
          Activo: formData.Activo,
          Puntos_Otorgados: formData.Puntos_Otorgados,
          Tipo_Dieta: formData.Tipo_Dieta
        };
        if (isEditing) {
          await sheetsService.updateFoodMenu(formData.ID, payload);
        } else {
          await sheetsService.addFoodMenu(payload);
        }
      } else if (activeTab === 'shop') {
        const payload = {
          ID: formData.ID,
          Nombre: formData.Nombre,
          Descripcion: formData.Descripcion,
          Categoria: formData.Categoria,
          Precio: formData.Precio,
          Stock: formData.Stock,
          Imagen_URL: finalImageUrl,
          Puntos_Otorgados: formData.Puntos_Otorgados
        };
        if (isEditing) {
          await sheetsService.updateShopInventory(formData.ID, payload);
        } else {
          await sheetsService.addShopInventory(payload);
        }
      } else if (activeTab === 'backgrounds') {
        const payload = {
          ID: formData.ID,
          Imagen_URL: finalImageUrl
        };
        if (isEditing) {
          await sheetsService.updateBackground(formData.ID, payload);
        } else {
          await sheetsService.addBackground(payload);
        }
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData({ ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: '', Puntos_Otorgados: '', Tipo_Dieta: '' });
      fetchData(); // Recargar datos
    } catch (error) {
      alert('Error guardando los datos.');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ID: item.ID || item.id,
      Nombre: item.Nombre || item.name,
      Descripcion: item.Descripcion || item.desc || '',
      Precio: item.Precio || item.price,
      Categoria: item.Categoria || item.category,
      Imagen_URL: item.Imagen_URL || item.img || '',
      Activo: item.Activo !== undefined ? item.Activo : 'VERDADERO',
      Stock: item.Stock || item.stock || '',
      Puntos_Otorgados: item.Puntos_Otorgados || '',
      Tipo_Dieta: item.Tipo_Dieta || item.dietType || ''
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const currentItems = activeTab === 'menu' ? menuItems : activeTab === 'shop' ? shopItems : backgroundItems;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'Admin1209') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <form onSubmit={handleLogin} style={{ background: 'var(--color-white)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)', marginBottom: '24px' }}>Acceso Admin</h2>
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
            className="form-control"
            style={{ marginBottom: '20px' }}
            required
          />
          <button type="submit" className="btn btn-primary btn-block">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ display: 'flex', minHeight: '80vh', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--color-white)', borderRight: '1px solid var(--color-border)', padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-burgundy)', marginBottom: '24px' }}>
          Admin Panel
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'menu' ? 'var(--color-cream)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: activeTab === 'menu' ? 'var(--color-burgundy)' : 'var(--color-text)', fontWeight: activeTab === 'menu' ? 600 : 400, textAlign: 'left' }}
            onClick={() => setActiveTab('menu')}
          >
            <Utensils size={18} /> Gestión de Menú
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'shop' ? 'var(--color-cream)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: activeTab === 'shop' ? 'var(--color-burgundy)' : 'var(--color-text)', fontWeight: activeTab === 'shop' ? 600 : 400, textAlign: 'left' }}
            onClick={() => setActiveTab('shop')}
          >
            <Box size={18} /> Gestión de Tienda
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'backgrounds' ? 'var(--color-cream)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: activeTab === 'backgrounds' ? 'var(--color-burgundy)' : 'var(--color-text)', fontWeight: activeTab === 'backgrounds' ? 600 : 400, textAlign: 'left' }}
            onClick={() => setActiveTab('backgrounds')}
          >
            <Tag size={18} /> Fondos (Hero)
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>
            {activeTab === 'menu' ? 'Platillos (Preventa)' : activeTab === 'shop' ? 'Productos (Tienda)' : 'Fondos de Pantalla'}
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setIsEditing(false);
            setFormData({ ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: '', Puntos_Otorgados: '', Tipo_Dieta: '' });
            setShowForm(true);
          }}>
            <Plus size={16} /> Añadir {activeTab === 'menu' ? 'Platillo' : activeTab === 'shop' ? 'Producto' : 'Fondo'}
          </button>
        </div>

        {/* Modal Formulario */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--color-white)', padding: '24px', borderRadius: 'var(--radius-md)', width: '400px', maxWidth: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>{isEditing ? 'Editar' : 'Añadir'} {activeTab === 'menu' ? 'Platillo' : activeTab === 'shop' ? 'Producto' : 'Fondo'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input required type="text" name="ID" placeholder="ID (ej. bc-002)" value={formData.ID} onChange={handleInputChange} className="form-control" readOnly={isEditing} style={{ backgroundColor: isEditing ? '#f0f0f0' : 'white' }} />
                
                {activeTab !== 'backgrounds' && (
                  <>
                    <input required type="text" name="Nombre" placeholder="Nombre" value={formData.Nombre} onChange={handleInputChange} className="form-control" />
                    <input required type="text" name="Descripcion" placeholder="Descripción" value={formData.Descripcion} onChange={handleInputChange} className="form-control" />
                    <select required name="Categoria" value={formData.Categoria} onChange={handleInputChange} className="form-control">
                      <option value="" disabled>Seleccione una categoría</option>
                      {activeTab === 'menu' ? (
                        <>
                          <option value="platos">Platos</option>
                          <option value="entradas">Entradas</option>
                          <option value="postres">Postres</option>
                        </>
                      ) : (
                        <>
                          <option value="ropa">Ropa</option>
                          <option value="joyeria">Joyería</option>
                          <option value="henna">Henna</option>
                        </>
                      )}
                    </select>
                    <input required type="number" step="0.01" name="Precio" placeholder="Precio" value={formData.Precio} onChange={handleInputChange} className="form-control" />
                    <input type="number" name="Puntos_Otorgados" placeholder="Puntos que otorga (ej. 10)" value={formData.Puntos_Otorgados} onChange={handleInputChange} className="form-control" />
                  </>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Imágenes del Producto</label>
                  {(formData.Imagen_URL ? formData.Imagen_URL.split(',').map(u => u.trim()) : ['']).map((url, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        required={index === 0}
                        type="text" 
                        placeholder={index === 0 ? "URL de Imagen Principal (Drive o Web)" : "URL de Imagen Adicional"}
                        value={url} 
                        onChange={(e) => handleImageUrlChange(index, e.target.value)} 
                        className="form-control" 
                        style={{ flex: 1 }}
                      />
                      {index > 0 && (
                        <button type="button" onClick={() => removeImageUrlField(index)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', color: 'var(--color-burgundy)' }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addImageUrlField} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px dashed var(--color-border)', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text)' }}>
                    <Plus size={14} /> Añadir otra imagen
                  </button>
                </div>
                
                {activeTab === 'menu' && (
                  <>
                    <select name="Tipo_Dieta" value={formData.Tipo_Dieta} onChange={handleInputChange} className="form-control">
                      <option value="">Cualquiera</option>
                      <option value="Vegetariano">Vegetariano</option>
                      <option value="No Vegetariano">No Vegetariano</option>
                    </select>
                    <select name="Activo" value={formData.Activo} onChange={handleInputChange} className="form-control">
                      <option value="VERDADERO">Activo: Sí</option>
                      <option value="FALSO">Activo: No</option>
                    </select>
                  </>
                )}
                
                {activeTab === 'shop' && (
                  <input required type="number" name="Stock" placeholder="Stock disponible" value={formData.Stock} onChange={handleInputChange} className="form-control" />
                )}
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Guardar</button>
              </form>
            </div>
          </div>
        )}

        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>Cargando datos...</div>
          ) : (
            <>
              {currentItems.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-light)', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  No hay items en esta sección.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {currentItems.map((item, index) => {
                    const imageUrls = item.Imagen_URL ? item.Imagen_URL.split(',').map(u => u.trim()) : [];
                    const coverImage = imageUrls.length > 0 ? imageUrls[0] : '/images/default_shop.png';

                    return (
                      <div key={`${item.ID || item.id}-${activeTab}-${index}`} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: '200px', background: '#f8f8f8' }}>
                          <img src={coverImage} alt={item.Nombre || item.name || 'bg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEdit(item)} style={{ background: 'var(--color-white)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', color: 'var(--color-burgundy)' }} title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={async () => {
                              if (window.confirm('¿Seguro de borrar este elemento? Esta acción no se puede deshacer.')) {
                                if (activeTab === 'menu') await sheetsService.deleteFoodMenu(item.ID);
                                else if (activeTab === 'shop') await sheetsService.deleteShopInventory(item.ID);
                                else await sheetsService.deleteBackground(item.ID);
                                fetchData();
                              }
                            }} style={{ background: 'var(--color-white)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', color: '#E53935' }} title="Eliminar">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          {activeTab !== 'backgrounds' && (
                            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--color-cream-dk)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              <Tag size={12} /> {item.Categoria || item.category}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {activeTab === 'backgrounds' ? (
                            <>
                              <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: 'var(--color-dark)' }}>Fondo Hero</h3>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', wordBreak: 'break-all' }}>ID: {item.ID}</span>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-dark)', fontWeight: 600, lineHeight: 1.2 }}>{item.Nombre || item.name}</h3>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>S/ {parseFloat(item.Precio || item.price || 0).toFixed(2)}</span>
                              </div>
                              
                              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', flex: 1, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                {item.Descripcion || item.desc || "Sin descripción"}
                              </p>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '12px 0 0 0', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text)' }}>
                                  {activeTab === 'menu' ? (
                                    <>
                                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: (item.Activo === 'VERDADERO' || item.Activo === true) ? '#43A047' : '#E53935' }} />
                                      {item.Activo === 'VERDADERO' || item.Activo === true ? 'Activo' : 'Inactivo'}
                                      {item.Tipo_Dieta && <span style={{marginLeft: 8, color: 'var(--color-text-light)'}}>({item.Tipo_Dieta})</span>}
                                    </>
                                  ) : (
                                    <>
                                      <Box size={14} /> Stock: <strong style={{color: parseInt(item.Stock || item.stock) > 0 ? 'var(--color-text)' : '#E53935'}}>{item.Stock || item.stock}</strong>
                                    </>
                                  )}
                                </div>
                                <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                                  💎 {item.Puntos_Otorgados || 0}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
