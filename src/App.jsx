import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Preloader />
              <div className="ambient-glow">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
              </div>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<Success />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
