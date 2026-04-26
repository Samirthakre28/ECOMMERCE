import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products:product_id (name, image, price)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
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
              <span className="btn-text">CONTINUE SHOPPING</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="orders-container">
        <h1 className="page-title">ORDER <span className="highlight">HISTORY</span></h1>

        {loading ? (
          <div className="loader-container" style={{ minHeight: '40vh' }}>
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fa-solid fa-box-open"></i>
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex', textDecoration: 'none' }}>
              <span className="btn-text">START SHOPPING</span>
            </Link>
          </div>
        ) : (
          <div id="ordersList">
            {orders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <div className="order-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="order-date">{formatDate(order.created_at)}</div>
                    {order.address && (
                      <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Delivery To:</strong> {order.full_name}<br/>
                        {order.address}, {order.city}, {order.state} - {order.pincode}<br/>
                        Phone: {order.phone}
                      </div>
                    )}
                  </div>
                  <div className={`order-status ${order.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                    {order.status}
                  </div>
                </div>
                <div className="order-items">
                  {order.order_items?.map((item, idx) => (
                    <div className="order-item" key={idx}>
                      <img src={item.products?.image} alt={item.products?.name || 'Product'} />
                      <div className="order-item-info">
                        <h4>{item.products?.name || 'Unknown Product'}</h4>
                        <p>Size: {item.size} | Qty: {item.quantity} | ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Payment: {order.payment_method?.toUpperCase()}
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
