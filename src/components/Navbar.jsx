import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onCartOpen, onAuthOpen, onSearch }) {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleUserClick = () => {
    if (user) {
      setShowUserMenu(prev => !prev);
    } else {
      onAuthOpen?.();
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>REDMONT</Link>
        </div>

        {isHome && (
          <div className="nav-center">
            <div className="search-bar">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search curated collections..."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        )}

        <div className="nav-right">
          <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {isHome && (
            <div className="nav-icon-btn cart-icon-container" onClick={onCartOpen}>
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </div>
          )}

          <div className="nav-icon-btn user-icon-container" onClick={handleUserClick} style={{ position: 'relative' }}>
            <i className={`fa-${user ? 'solid fa-user-check' : 'regular fa-user'}`}></i>

            {showUserMenu && user && (
              <div className="user-dropdown">
                <div className="user-dropdown-email">{user.email}</div>
                <Link to="/orders" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fa-solid fa-box"></i> Order History
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fa-solid fa-shield-halved"></i> Admin Panel
                  </Link>
                )}
                <button className="user-dropdown-item logout-btn" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
