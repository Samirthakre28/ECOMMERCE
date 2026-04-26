import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import CartSidebar from '../components/CartSidebar';
import AuthModal from '../components/AuthModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const { showToast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    if (!user) {
      setCartOpen(false);
      setAuthOpen(true);
      showToast('Please login to checkout', 'info');
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <Navbar
        onCartOpen={() => setCartOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
        onSearch={setSearchQuery}
      />

      <main className="main-content" style={{ paddingTop: searchQuery ? '100px' : '0' }}>
        {!searchQuery && (
          <>
            <Hero />
            <Categories onCategorySelect={setSelectedCategory} />
          </>
        )}
        <ProductGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onOpenDetails={setSelectedProduct}
        />
      </main>

      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleOpenCheckout}
      />

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} />
      )}
    </>
  );
}
