import { useState } from "react";
import { dishes, deliveryInfo } from "./data";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import PaymentModal from "./components/PaymentModal";
import OrderTracking from "./components/OrderTracking";
import {
  generateOrderNumber,
  loadActiveOrder,
  saveActiveOrder,
  clearActiveOrder,
} from "./orderTracking";
import "./App.css";

export default function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPayment, setShowPayment] = useState(false);
  const [activeOrder, setActiveOrder] = useState(loadActiveOrder);

  function addToCart(dish) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(cart.filter((item) => item.id !== id));
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleOrderPlaced(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const order = {
      orderNumber: generateOrderNumber(),
      orderTime: Date.now(),
      items: cart,
      subtotal,
      tax,
      total: subtotal + tax,
    };
    saveActiveOrder(order);
    setActiveOrder(order);
    setCart([]);
    setShowPayment(false);
  }

  function handleStartNewOrder() {
    clearActiveOrder();
    setActiveOrder(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <img src="/restaurant-demo/deliveroo-logo.png" alt="Deliveroo" height="36" />
          <h1>roo<span style={{color:"#1a271f"}}>food</span></h1>
          {!activeOrder && (
            <span className="delivery-eta">
              <span className="eta-dot" />
              <span className="eta-icon">🛵</span>
              Delivery in {deliveryInfo.etaMin}–{deliveryInfo.etaMax} min
            </span>
          )}
        </div>
        <div className="cart-badge-wrapper">
          <span className="cart-icon">🛒</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
      </header>

      {activeOrder ? (
        <main className="app-main">
          <OrderTracking order={activeOrder} onStartNewOrder={handleStartNewOrder} />
        </main>
      ) : (
        <main className="app-main">
          <Menu
            dishes={dishes}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
          />
          <Cart cart={cart} onRemove={removeFromCart} onCheckout={() => setShowPayment(true)} />
        </main>
      )}
      {showPayment && (
        <PaymentModal
          cart={cart}
          onClose={() => setShowPayment(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}
