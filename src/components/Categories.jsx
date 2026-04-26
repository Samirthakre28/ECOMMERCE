import { motion } from 'framer-motion';
import { pageLoadVariant, cardHoverVariant } from '../lib/animations';

export default function Categories({ onCategorySelect }) {
  const categories = [
    { name: 'Men', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: "Men's Fashion" },
    { name: 'Women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: "Women's Fashion" },
  ];

  const handleClick = (cat) => {
    onCategorySelect?.(cat);
    const el = document.getElementById('shop-section');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <motion.section 
      className="categories scroll-element"
      variants={pageLoadVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {categories.map(cat => (
        <motion.div 
          className="category-card" 
          key={cat.name} 
          onClick={() => handleClick(cat.name)}
          variants={cardHoverVariant}
          whileHover="hover"
          initial="rest"
        >
          <img src={cat.img} alt={cat.alt} />
          <div className="category-overlay">
            <h2>{cat.name.toUpperCase()}</h2>
            <span className="view-text">View Collection</span>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
