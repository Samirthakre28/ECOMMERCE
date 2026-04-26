import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

export default function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { showToast } = useToast();

  const handleRemove = (index) => {
    removeFromCart(index);
    showToast('Item removed from cart', 'info');
  };

  return (
    <>
      <div className={`glass-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`cart-sidebar glass-panel ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>SHOPPING CART</h3>
          <button className="icon-btn-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state">Your cart is empty.</div>
          ) : (
            cart.map((item, idx) => (
              <div className="cart-item fade-in visible" key={`${item.product_id}-${item.size}-${idx}`}>
                <div className="cart-img-box">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-details">
                  <div className="cart-title">{item.name}</div>
                  <div className="cart-size">Size: {item.size}</div>
                  <div className="cart-controls">
                    <div className="qty-box">
                      <button onClick={() => updateQuantity(idx, -1)}>
                        <i className="fa-solid fa-minus" style={{ fontSize: '10px' }}></i>
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)}>
                        <i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i>
                      </button>
                    </div>
                    <div className="cart-price">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button className="btn-remove" onClick={() => handleRemove(idx)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>SUBTOTAL:</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn-primary full-width" onClick={onCheckout}>
            <span className="btn-text">CHECKOUT SECURELY</span>
          </button>
        </div>
      </aside>
    </>
  );
}
