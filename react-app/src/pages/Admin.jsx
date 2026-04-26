import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Utensils, Box, X } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'shop'
  const [menuItems, setMenuItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const menu = await sheetsService.getAllFoodMenu();
    const shop = await sheetsService.getAllShopInventory();
    setMenuItems(menu);
    setShopItems(shop);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'menu') {
        const payload = {
          ID: formData.ID,
          Nombre: formData.Nombre,
          Descripcion: formData.Descripcion,
          Precio: formData.Precio,
          Categoria: formData.Categoria,
          Imagen_URL: formData.Imagen_URL,
          Activo: formData.Activo
        };
        if (isEditing) {
          await sheetsService.updateFoodMenu(formData.ID, payload);
        } else {
          await sheetsService.addFoodMenu(payload);
        }
      } else {
        const payload = {
          ID: formData.ID,
          Nombre: formData.Nombre,
          Descripcion: formData.Descripcion,
          Categoria: formData.Categoria,
          Precio: formData.Precio,
          Stock: formData.Stock,
          Imagen_URL: formData.Imagen_URL
        };
        if (isEditing) {
          await sheetsService.updateShopInventory(formData.ID, payload);
        } else {
          await sheetsService.addShopInventory(payload);
        }
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData({ ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: '' });
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
      Stock: item.Stock || item.stock || ''
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const currentItems = activeTab === 'menu' ? menuItems : shopItems;

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
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-dark)' }}>
            {activeTab === 'menu' ? 'Platillos (Preventa)' : 'Productos (Tienda)'}
          </h1>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setIsEditing(false);
            setFormData({ ID: '', Nombre: '', Descripcion: '', Precio: '', Categoria: '', Imagen_URL: '', Activo: 'VERDADERO', Stock: '' });
            setShowForm(true);
          }}>
            <Plus size={16} /> Añadir {activeTab === 'menu' ? 'Platillo' : 'Producto'}
          </button>
        </div>

        {/* Modal Formulario */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--color-white)', padding: '24px', borderRadius: 'var(--radius-md)', width: '400px', maxWidth: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>{isEditing ? 'Editar' : 'Añadir'} {activeTab === 'menu' ? 'Platillo' : 'Producto'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input required type="text" name="ID" placeholder="ID (ej. bc-002)" value={formData.ID} onChange={handleInputChange} className="form-control" readOnly={isEditing} style={{ backgroundColor: isEditing ? '#f0f0f0' : 'white' }} />
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
                <input type="text" name="Imagen_URL" placeholder="URL de Imagen (ej. /images/...) " value={formData.Imagen_URL} onChange={handleInputChange} className="form-control" />
                
                {activeTab === 'menu' && (
                  <select name="Activo" value={formData.Activo} onChange={handleInputChange} className="form-control">
                    <option value="VERDADERO">Activo: Sí</option>
                    <option value="FALSO">Activo: No</option>
                  </select>
                )}
                
                {activeTab === 'shop' && (
                  <input required type="number" name="Stock" placeholder="Stock disponible" value={formData.Stock} onChange={handleInputChange} className="form-control" />
                )}
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Guardar</button>
              </form>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>Cargando datos...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--color-cream)' }}>
                <tr>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>ID</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Nombre</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Categoría</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>{activeTab === 'menu' ? 'Activo' : 'Stock'}</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Precio</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.ID || item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--color-text)' }}>{item.ID || item.id}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-dark)' }}>{item.Nombre || item.name}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '0.75rem', background: 'var(--color-cream-dk)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> {item.Categoria || item.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {activeTab === 'menu' ? (item.Activo || 'VERDADERO') : (item.Stock || item.stock)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-burgundy)' }}>${parseFloat(item.Precio || item.price || 0).toFixed(2)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <button 
                        onClick={() => handleEdit(item)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-burgundy)', padding: '4px' }}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                      No hay items en esta sección.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
