import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

const PLACEHOLDER = 'https://placehold.co/600x800/1a1a1a/e63946?text=REDMONT&font=raleway';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('M');

  if (!product) return null;

  const sizes = ['S', 'M', 'L', 'XL'];

  const handleAdd = () => {
    addToCart(product, selectedSize, 1);
    showToast(`Added to cart ₹${product.price.toLocaleString('en-IN')}`, 'success');
    onClose();
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel split-modal active-content">
        <button className="icon-btn-close close-modal" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="modal-body">
          <div className="modal-img-col">
            <img src={product.image || PLACEHOLDER} alt={product.name} onError={(e) => { e.target.src = PLACEHOLDER; }} />
          </div>
          <div className="modal-info-col">
            <div className="modal-brand">REDMONT • {product.category}</div>
            <h2 className="modal-title">{product.name}</h2>
            <div className="modal-price-row">
              <div className="modal-price">₹{product.price.toLocaleString('en-IN')}</div>
              <div className="product-rating">
                <i className="fa-solid fa-star" style={{ color: '#fbbf24' }}></i> {product.rating}
              </div>
            </div>
            <p className="modal-desc">{product.description}</p>

            {product.stock !== undefined && (
              <p style={{ fontSize: '13px', color: product.stock > 0 ? '#10b981' : '#ef4444', marginBottom: '15px' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            )}

            <div className="size-selector">
              <h4>SELECT SIZE</h4>
              <div className="size-grid">
                {sizes.map(size => (
                  <div
                    key={size}
                    className={`size-box ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                <span className="btn-text">
                  ADD TO CART — ₹{product.price.toLocaleString('en-IN')}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
