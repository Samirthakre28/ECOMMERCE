export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-col">
          <h3 className="logo">REDMONT</h3>
          <p>Minimal. Premium. Bold. Redefining modern apparel aesthetics.</p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="#shop-section">Men</a></li>
            <li><a href="#shop-section">Women</a></li>
            <li><a href="#shop-section">Kids</a></li>
            <li><a href="#shop-section">New Arrivals</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Newsletter</h4>
          <div className="newsletter-input">
            <input type="email" placeholder="Your email address" />
            <button><i className="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 REDMONT. All rights reserved.</p>
      </div>
    </footer>
  );
}
