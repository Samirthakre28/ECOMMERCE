import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pageLoadVariant, staggerContainerVariant, staggerItemVariant, buttonMicroVariant, springConfig, smoothBezier } from '../lib/animations';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Security: Redirect off checkout if not eligible
  useEffect(() => {
    if (!user) {
      showToast('Please login to checkout', 'error');
      navigate('/');
    } else if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      navigate('/');
    }
  }, [user, cart, navigate, showToast]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the Order Record targeting the new database columns
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: 'pending',
          payment_method: 'card', // Mocking a standard payment option
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create order record');
      }

      if (!orderData) {
        throw new Error('Order was created but no data was returned. Check RLS policies.');
      }

      // 2. Format Order Items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        unit_price: item.price,
      }));

      // 3. Batch Insert Items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error(itemsError.message || 'Failed to add items to order');
      }

      // Clear the user's cart securely and move to success page
      clearCart();
      navigate('/success');

    } catch (err) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Failed to place order. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) return null;

  return (
    <>
      <Navbar />
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', padding: '100px 20px', minHeight: '80vh' }}>
        <motion.div 
          className="glass-panel" 
          variants={pageLoadVariant}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '40px', flexWrap: 'wrap', padding: '40px' }}
        >
          {/* LEFT: Address Form */}
          <motion.div style={{ flex: '1 1 500px' }} variants={staggerContainerVariant} initial="hidden" animate="visible">
            <h2 style={{ marginBottom: '20px' }}>Delivery <span className="highlight">Address</span></h2>
            <form onSubmit={handlePlaceOrder} id="checkoutForm" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <motion.div variants={staggerItemVariant} className="input-wrapper">
                <input required type="text" name="fullName" placeholder=" " value={formData.fullName} onChange={handleChange} />
                <label>Full Name</label>
              </motion.div>

              <motion.div variants={staggerItemVariant} className="input-wrapper">
                <input required type="tel" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} />
                <label>Phone Number</label>
              </motion.div>

              <motion.div variants={staggerItemVariant} className="input-wrapper" style={{ minHeight: '80px', paddingTop: '10px' }}>
                <textarea required name="address" placeholder=" " value={formData.address} onChange={handleChange} style={{ 
                  width: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-primary)', 
                  outline: 'none', 
                  minHeight: '60px', 
                  padding: '10px 0', 
                  fontFamily: 'inherit',
                  resize: 'none'
                }}></textarea>
                <label style={{ transform: formData.address ? 'translateY(-20px) scale(0.8)' : 'translateY(10px)' }}>Address (Street, Apt)</label>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>
              </motion.div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <motion.div variants={staggerItemVariant} className="input-wrapper" style={{ flex: 1 }}>
                  <input required type="text" name="city" placeholder=" " value={formData.city} onChange={handleChange} />
                  <label>City</label>
                </motion.div>
                <motion.div variants={staggerItemVariant} className="input-wrapper" style={{ flex: 1 }}>
                  <input required type="text" name="state" placeholder=" " value={formData.state} onChange={handleChange} />
                  <label>State</label>
                </motion.div>
              </div>

              <motion.div variants={staggerItemVariant} className="input-wrapper">
                <input required type="text" name="pincode" placeholder=" " value={formData.pincode} onChange={handleChange} />
                <label>Pincode</label>
              </motion.div>

            </form>
          </motion.div>

          {/* RIGHT: Order Summary */}
          <motion.div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '4px' }} variants={staggerContainerVariant} initial="hidden" animate="visible">
            <motion.h3 variants={staggerItemVariant} style={{ marginBottom: '20px' }}>ORDER SUMMARY</motion.h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {cart.map((item, idx) => (
                <motion.div key={idx} variants={staggerItemVariant} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div>{item.name} x {item.quantity}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Size: {item.size}</div>
                    </div>
                  </div>
                  <div>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={staggerItemVariant} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '18px', marginBottom: '30px' }}>
              <span>TOTAL</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </motion.div>

            <motion.button 
              type="submit"
              form="checkoutForm"
              className="btn-primary full-width" 
              variants={buttonMicroVariant}
              whileHover="hover"
              whileTap="tap"
              transition={springConfig}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <span className="btn-text">{loading ? 'PROCESSING...' : 'PLACE ORDER'}</span>
            </motion.button>
          </motion.div>

        </motion.div>
      </main>
      <Footer />
    </>
  );
}
