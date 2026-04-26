import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { pageLoadVariant, buttonMicroVariant, springConfig, magneticSpringConfig } from '../lib/animations';

export default function Hero() {
  const heroRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, magneticSpringConfig);
  const mouseYSpring = useSpring(y, magneticSpringConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
  const moveX = useTransform(mouseXSpring, [-0.5, 0.5], ["-10px", "10px"]);
  const moveY = useTransform(mouseYSpring, [-0.5, 0.5], ["-10px", "10px"]);

  const scrollToShop = () => {
    const el = document.getElementById('shop-section');
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  return (
    <section 
      className="hero" 
      ref={heroRef} 
      onMouseMove={handleMouseMove}
      style={{ perspective: 2000, overflow: 'hidden' }}
    >
      <motion.div 
        className="hero-bg"
        style={{ rotateX, rotateY, x: moveX, y: moveY, scale: 1.05 }}
      >
        <img src="/heropicture.jpg.jpeg" alt="REDMONT Hero" className="hero-img" />
      </motion.div>
      <motion.div 
        className="hero-content"
        variants={pageLoadVariant}
        initial="hidden"
        animate="visible"
        style={{ z: 100 }}
      >
        <h1>REDMONT —<br /><span className="highlight">Built for Bold</span></h1>
        <p>Elevate your everyday aesthetic with our premium, minimal collections.</p>
        <motion.button 
          className="btn-primary" 
          onClick={scrollToShop}
          variants={buttonMicroVariant}
          whileHover="hover"
          whileTap="tap"
          transition={springConfig}
        >
          <span className="btn-text">Explore Collection</span>
          <i className="fa-solid fa-arrow-right-long"></i>
        </motion.button>
      </motion.div>
    </section>
  );
}
