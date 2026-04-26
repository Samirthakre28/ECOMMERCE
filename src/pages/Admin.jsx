import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';
import { generateProductImage, isGeminiConfigured, getPlaceholderImage } from '../lib/gemini';
import { uploadProductImage, deleteProductImage } from '../lib/storage';

const PLACEHOLDER = getPlaceholderImage();

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', image: '', category: 'Men', stock: 50, rating: 4.5, flipkart_url: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select(`*, order_items(*, products:product_id(name))`).order('created_at', { ascending: false }).limit(50)
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', image: '', category: 'Men', stock: 50, rating: 4.5, flipkart_url: '' });
    setEditingProduct(null);
    setShowAddForm(false);
    setImagePreview('');
    setUseManualUrl(false);
  };

  // =================== GEMINI IMAGE GENERATION ===================
  const handleGenerateImage = async () => {
    if (!formData.name.trim()) {
      showToast('Enter a product name first', 'error');
      return;
    }

    setGeneratingImage(true);
    showToast('Generating image with AI...', 'info');

    try {
      const result = await generateProductImage(formData.name, formData.description);

      if (!result) {
        showToast('AI generation failed — using placeholder', 'error');
        setFormData(prev => ({ ...prev, image: PLACEHOLDER }));
        setImagePreview(PLACEHOLDER);
        return;
      }

      // Upload to Supabase Storage
      showToast('Uploading image to storage...', 'info');
      const publicUrl = await uploadProductImage(result.blob, result.mimeType, formData.name);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      setImagePreview(publicUrl);
      showToast('Image generated & uploaded!', 'success');

    } catch (error) {
      console.error('Image generation flow error:', error);
      showToast('Image generation failed — using placeholder', 'error');
      setFormData(prev => ({ ...prev, image: PLACEHOLDER }));
      setImagePreview(PLACEHOLDER);
    } finally {
      setGeneratingImage(false);
    }
  };

  // =================== PRODUCT SUBMIT ===================
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Ensure image is never empty
    const finalImage = formData.image?.trim() || PLACEHOLDER;

    const payload = {
      ...formData,
      image: finalImage,
      price: Number(formData.price),
      stock: Number(formData.stock),
      rating: Number(formData.rating),
      flipkart_url: formData.flipkart_url || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) { showToast('Failed to update product', 'error'); return; }
      showToast('Product updated', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { showToast('Failed to add product', 'error'); return; }
      showToast('Product added', 'success');
    }
    resetForm();
    fetchData();
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image || '',
      category: product.category,
      stock: product.stock,
      rating: product.rating,
      flipkart_url: product.flipkart_url || '',
    });
    setEditingProduct(product);
    setShowAddForm(true);
    setImagePreview(product.image || '');
    setUseManualUrl(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    // Find product to get image URL for cleanup
    const product = products.find(p => p.id === id);
    if (product?.image) {
      await deleteProductImage(product.image);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast('Failed to delete product', 'error'); return; }
    showToast('Product deleted', 'success');
    fetchData();
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { showToast('Failed to update status', 'error'); return; }
    showToast(`Order marked as ${status}`, 'success');
    fetchData();
  };

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
  }

  if (!isAdmin) {
    return (
      <div className="orders-container" style={{ textAlign: 'center', paddingTop: '200px' }}>
        <h2>ACCESS DENIED</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>You don't have admin privileges.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex', textDecoration: 'none' }}>
          <span className="btn-text">GO HOME</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="ambient-glow">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar scrolled">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>REDMONT</Link>
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <Link to="/" className="btn-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
              <span className="btn-text">STORE</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="orders-container">
        <h1 className="page-title">ADMIN <span className="highlight">PANEL</span></h1>

        {/* Tab nav */}
        <div className="admin-tabs">
          <button className={`filter-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            PRODUCTS ({products.length})
          </button>
          <button className={`filter-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            ORDERS ({orders.length})
          </button>
        </div>

        {loading ? (
          <div className="loader-container" style={{ minHeight: '40vh' }}><div className="spinner"></div></div>
        ) : activeTab === 'products' ? (
          <div>
            <button
              className="btn-primary"
              style={{ marginBottom: '30px' }}
              onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            >
              <span className="btn-text">
                <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>
                {showAddForm ? 'CANCEL' : 'ADD PRODUCT'}
              </span>
            </button>

            {showAddForm && (
              <div className="admin-form-card">
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
                  {editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
                </h3>
                <form onSubmit={handleSubmitProduct}>
                  <div className="admin-form-grid">
                    <div className="input-wrapper">
                      <input type="text" required placeholder=" " value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <label>Product Name</label>
                    </div>
                    <div className="input-wrapper">
                      <input type="number" required placeholder=" " value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                      <label>Price (₹)</label>
                    </div>
                    <div className="input-wrapper">
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="glass-select" style={{ width: '100%' }}>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>
                    <div className="input-wrapper">
                      <input type="number" placeholder=" " value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                      <label>Stock</label>
                    </div>
                    <div className="input-wrapper">
                      <input type="number" step="0.1" placeholder=" " value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                      <label>Rating</label>
                    </div>
                  </div>

                  <div className="input-wrapper" style={{ marginTop: '10px' }}>
                    <input type="text" placeholder=" " value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <label>Description</label>
                  </div>

                  {/* ========== IMAGE SECTION ========== */}
                  <div className="image-section">
                    <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                      PRODUCT IMAGE
                    </h4>

                    <div className="image-method-toggle">
                      <button
                        type="button"
                        className={`method-btn ${!useManualUrl ? 'active' : ''}`}
                        onClick={() => setUseManualUrl(false)}
                        disabled={!isGeminiConfigured()}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        {isGeminiConfigured() ? 'AI GENERATE' : 'AI (NO KEY)'}
                      </button>
                      <button
                        type="button"
                        className={`method-btn ${useManualUrl ? 'active' : ''}`}
                        onClick={() => setUseManualUrl(true)}
                      >
                        <i className="fa-solid fa-link"></i> MANUAL URL
                      </button>
                    </div>

                    {useManualUrl ? (
                      <div className="input-wrapper" style={{ marginTop: '12px' }}>
                        <input
                          type="text"
                          placeholder=" "
                          value={formData.image}
                          onChange={e => {
                            setFormData({...formData, image: e.target.value});
                            setImagePreview(e.target.value);
                          }}
                        />
                        <label>Image URL</label>
                      </div>
                    ) : (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          className="btn-primary generate-img-btn"
                          onClick={handleGenerateImage}
                          disabled={generatingImage || !formData.name.trim()}
                          style={{ padding: '12px 24px', fontSize: '13px' }}
                        >
                          {generatingImage ? (
                            <span className="btn-text">
                              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}></div>
                              GENERATING...
                            </span>
                          ) : (
                            <span className="btn-text">
                              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '8px' }}></i>
                              GENERATE IMAGE WITH AI
                            </span>
                          )}
                        </button>
                        {!formData.name.trim() && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Enter a product name first to generate an image
                          </p>
                        )}
                      </div>
                    )}

                    {/* Image Preview */}
                    {(imagePreview || formData.image) && (
                      <div className="image-preview-box">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                        {formData.image && (
                          <div className="image-preview-status">
                            <i className="fa-solid fa-check-circle" style={{ color: '#10b981' }}></i>
                            <span>Image ready</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="input-wrapper" style={{ marginTop: '15px' }}>
                    <input type="text" placeholder=" " value={formData.flipkart_url} onChange={e => setFormData({...formData, flipkart_url: e.target.value})} />
                    <label>Flipkart URL (optional)</label>
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={generatingImage}>
                    <span className="btn-text">{editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="admin-products-list">
              {products.map(p => (
                <div className="admin-product-row" key={p.id}>
                  <img
                    src={p.image || PLACEHOLDER}
                    alt={p.name}
                    className="admin-product-img"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="admin-product-info">
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {p.category} • ₹{Number(p.price).toLocaleString('en-IN')} • Stock: {p.stock}
                    </div>
                  </div>
                  <div className="admin-product-actions">
                    <button className="admin-btn edit-btn" onClick={() => handleEdit(p)} title="Edit">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="admin-btn delete-btn" onClick={() => handleDelete(p.id)} title="Delete">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <div className="order-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>User: {order.user_id?.slice(0, 8)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      className="glass-select"
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ fontSize: '12px', padding: '6px 30px 6px 10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="order-items">
                  {order.order_items?.map((item, idx) => (
                    <div className="order-item" key={idx} style={{ fontSize: '14px' }}>
                      <span>{item.quantity}x {item.products?.name || 'Product'} ({item.size})</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {order.payment_method?.toUpperCase()}
                  </span>
                  <div className="order-total">₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
