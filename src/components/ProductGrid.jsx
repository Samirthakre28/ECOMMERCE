import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { staggerContainerVariant, buttonMicroVariant, springConfig } from '../lib/animations';

// Fallback products used when Supabase is not configured or returns empty
const FALLBACK_PRODUCTS = [
  { id: 'fb-101', name: "Onyx Essential Tee", category: "Men", price: 1499, rating: 4.8, stock: 100, image: "/products/onyx-essential-tee.png", description: "Premium heavyweight cotton tee in deep onyx black. Tailored for a relaxed, modern fit.", flipkart_url: "https://www.flipkart.com/onyx-essential-tee-men-solid-round-neck/p/itm_onyx_tee" },
  { id: 'fb-102', name: "Crimson Utility Jacket", category: "Men", price: 4599, rating: 4.9, stock: 40, image: "/products/crimson-utility-jacket.png", description: "A sleek utility jacket with subtle red accents and water-resistant finish.", flipkart_url: "https://www.flipkart.com/crimson-men-solid-utility-jacket/p/itm_crimson_jacket" },
  { id: 'fb-103', name: "Silk Wrap Blouse", category: "Women", price: 2899, rating: 4.7, stock: 60, image: "/products/silk-wrap-blouse.png", description: "Luxurious silk blouse featuring a minimalist wrap design." },
  { id: 'fb-104', name: "Midnight Trench", category: "Women", price: 7999, rating: 5.0, stock: 25, image: "/products/midnight-trench.png", description: "Classic trench coat reimagined in a stark midnight silhouette.", flipkart_url: "https://www.flipkart.com/midnight-women-solid-trench-coat/p/itm_midnight_trench" },
  { id: 'fb-106', name: "Structured Cargo Pants", category: "Men", price: 3499, rating: 4.6, stock: 70, image: "/products/structured-cargo-pants.png", description: "Utilitarian cargo pants tailored for a sharp, clean look.", flipkart_url: "https://www.flipkart.com/structured-men-grey-cargo-pants/p/itm_cargo_pants" },
  { id: 'fb-107', name: "Cashmere Turtleneck", category: "Women", price: 5499, rating: 4.9, stock: 30, image: "/products/cashmere-turtleneck.png", description: "Ultra-soft cashmere blend pullover with an exaggerated turtleneck." },
  { id: 'fb-108', name: "Monochrome Sneaker", category: "Men", price: 5999, rating: 4.7, stock: 55, image: "/products/monochrome-sneaker.png", description: "Minimalist leather sneakers in stark white and black.", flipkart_url: "https://www.flipkart.com/monochrome-men-white-sneakers/p/itm_mono_sneaker" },
  { id: 'fb-109', name: "Pleated Midi Skirt", category: "Women", price: 2499, rating: 4.5, stock: 45, image: "/products/pleated-midi-skirt.png", description: "Elegant knife-pleated skirt perfect for day-to-night transitions." },
  { id: 'fb-111', name: "Textured Knit Polo", category: "Men", price: 2199, rating: 4.6, stock: 80, image: "/products/textured-knit-polo.png", description: "A modern take on the classic polo with heavy knit texture." },
  { id: 'fb-112', name: "Sculpted Blazer", category: "Women", price: 6599, rating: 4.9, stock: 20, image: "/products/sculpted-blazer.png", description: "Fitted blazer with strong shoulders and a deep V-neckline.", flipkart_url: "https://www.flipkart.com/sculpted-women-solid-single-breasted-blazer/p/itm_sculpted_blazer" },
  { id: 'fb-113', name: "Geometric Print Shirt", category: "Men", price: 1899, rating: 4.4, stock: 90, image: "/products/geometric-print-shirt.png", description: "Short sleeve shirt featuring a striking geometric contrast." },
  { id: 'fb-114', name: "High-Rise Wide Leg Jeans", category: "Women", price: 3199, rating: 4.8, stock: 65, image: "/products/wide-leg-jeans.png", description: "Premium denim washed in subtle grey, cut wide for comfort and style." },
  { id: 'fb-116', name: "Matte Black Watch", category: "Men", price: 8999, rating: 5.0, stock: 15, image: "/products/matte-black-watch.png", description: "Sleek, minimalist timepiece.", flipkart_url: "https://www.flipkart.com/matte-black-analog-watch-for-men/p/itm_matte_watch" },
  { id: 'fb-117', name: "Leather Ankle Boots", category: "Women", price: 5999, rating: 4.7, stock: 40, image: "/products/leather-ankle-boots.png", description: "Genuine leather boots with a sharp pointed toe." },
  { id: 'fb-119', name: "Draped Evening Gown", category: "Women", price: 12999, rating: 4.9, stock: 10, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80", description: "Effortlessly elegant gown suitable for the highest profile events.", flipkart_url: "https://www.flipkart.com/draped-women-solid-evening-gown/p/itm_evening_gown" },
  { id: 'fb-120', name: "Oversized Wool Coat", category: "Men", price: 9999, rating: 4.8, stock: 18, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80", description: "A heavy, draped wool coat that commands attention.", flipkart_url: "https://www.flipkart.com/oversized-men-solid-wool-coat/p/itm_wool_coat" },
];

export default function ProductGrid({ selectedCategory, searchQuery, onOpenDetails }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(selectedCategory || 'All');
  const [sort, setSort] = useState('relevance');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('Supabase unavailable or empty, using fallback products');
        setProducts(FALLBACK_PRODUCTS);
        setUsingFallback(true);
      } else {
        setProducts(data);
        setUsingFallback(false);
      }
    } catch (err) {
      console.warn('Supabase connection failed, using fallback products');
      setProducts(FALLBACK_PRODUCTS);
      setUsingFallback(true);
    }
    setLoading(false);
  };

  // Filter and sort
  let filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (sort === 'lowToHigh') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'highToLow') filtered.sort((a, b) => b.price - a.price);

  const categories = ['All', 'Men', 'Women'];

  return (
    <section id="shop-section" className="products-section scroll-element">
      <div className="section-header">
        <h2>THE <span className="highlight">COLLECTION</span></h2>
        <div className="controls">
          <div className="filter-group">
            {categories.map(cat => (
              <motion.button
                key={cat}
                className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                variants={buttonMicroVariant}
                whileHover="hover"
                whileTap="tap"
                transition={springConfig}
              >
                {cat.toUpperCase()}
              </motion.button>
            ))}
          </div>
          <div className="sort-wrapper">
            <select
              className="glass-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="relevance">Sort By: Relevance</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No items match your criteria.
        </div>
      ) : (
        <motion.div 
          className="product-grid" 
          id="productGrid"
          variants={staggerContainerVariant}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
