import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { pageLoadVariant, staggerContainerVariant, staggerItemVariant, buttonMicroVariant, springConfig } from '../lib/animations';

export default function Success() {
  const navigate = useNavigate();

  // Quick safety delay then allow user to proceed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <motion.div 
          className="glass-panel" 
          variants={pageLoadVariant}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}
        >
          <motion.div variants={staggerContainerVariant} initial="hidden" animate="visible">
            <motion.div variants={staggerItemVariant} style={{ fontSize: '64px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              <i className="fa-regular fa-circle-check"></i>
            </motion.div>
            
            <motion.h2 variants={staggerItemVariant} style={{ marginBottom: '15px' }}>
              ORDER <span className="highlight">CONFIRMED</span>
            </motion.h2>
            
            <motion.p variants={staggerItemVariant} style={{ color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
              Thank you for choosing REDMONT. We've received your order and our facilities are preparing it for shipment. You can track its status in your Order History.
            </motion.p>
            
            <motion.div variants={staggerItemVariant} style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <motion.button 
                className="btn-primary" 
                onClick={() => navigate('/orders')}
                variants={buttonMicroVariant}
                whileHover="hover"
                whileTap="tap"
                transition={springConfig}
              >
                <span className="btn-text">VIEW ORDERS</span>
              </motion.button>

              <motion.button 
                className="filter-btn active" 
                onClick={() => navigate('/')}
                variants={buttonMicroVariant}
                whileHover="hover"
                whileTap="tap"
                transition={springConfig}
              >
                CONTINUE SHOPPING
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
