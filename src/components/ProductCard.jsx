import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { staggerItemVariant, cardHoverVariant, imageRevealVariant, buttonMicroVariant, springConfig, magneticSpringConfig } from '../lib/animations';

const PLACEHOLDER = 'https://placehold.co/600x800/1a1a1a/e63946?text=REDMONT&font=raleway';

export default function ProductCard({ product, index, onOpenDetails }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, magneticSpringConfig);
  const mouseYSpring = useSpring(y, magneticSpringConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const hasDiscount = index % 3 === 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 'M', 1);
    showToast(`Added to cart ₹${product.price.toLocaleString('en-IN')}`, 'success');
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="product-card fade-in visible"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={staggerItemVariant}
      initial="rest"
      animate="rest"
      style={{ perspective: 1200, overflow: 'visible' }}
    >
      <motion.div 
        variants={cardHoverVariant} 
        whileHover="hover"
        style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        <div className="img-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', transformStyle: "preserve-3d" }}>
          <motion.div className="product-badges" style={{ zIndex: 10, position: 'absolute', top: 15, left: 15, z: 50 }}>
            {hasDiscount && <div className="badge-discount" style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>-20%</div>}
          </motion.div>
          <motion.img
            src={product.image || PLACEHOLDER}
            alt={product.name}
            className="product-img"
            onClick={() => onOpenDetails(product)}
            initial="hidden"
            animate={imageLoaded ? "visible" : "hidden"}
            variants={imageRevealVariant}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.target.src = PLACEHOLDER; setImageLoaded(true); }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <motion.div className="add-to-cart-overlay" style={{ z: 40, transformStyle: "preserve-3d" }}>
            <motion.button 
              className="btn-primary full-width" 
              onClick={handleQuickAdd}
              variants={buttonMicroVariant}
              whileHover="hover"
              whileTap="tap"
              transition={springConfig}
            >
              <span className="btn-text">QUICK ADD</span>
            </motion.button>
          </motion.div>
        </div>
        <motion.div className="product-info" onClick={() => onOpenDetails(product)} style={{ z: 30 }}>
          <div className="product-brand">REDMONT • {product.category}</div>
          <div className="product-title">{product.name}</div>
          <div className="product-meta">
            <div className="product-price">₹{product.price.toLocaleString('en-IN')}</div>
            <div className="product-rating">
              <i className="fa-solid fa-star"></i> {product.rating}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
