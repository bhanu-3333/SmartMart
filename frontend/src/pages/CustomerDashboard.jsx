import React, { useState, useEffect, useCallback } from 'react';
import Scanner from '../components/Scanner';
import { getCart, addToCart, removeFromCart, createOrder, getMyOrders } from '../services/api';
import { ShoppingCart, Trash2, Camera, CheckCircle, AlertCircle, History, Package } from 'lucide-react';

const CustomerDashboard = () => {
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'orders'

  useEffect(() => {
    fetchCart();
    fetchOrders();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      console.log("CustomerDashboard: Fetched cart data:", data);
      if (data.items.length > 0) {
        console.log("Sample Product Weight in Cart:", {
          name: data.items[0].productId.name,
          weightValue: data.items[0].productId.weightValue,
          weightUnit: data.items[0].productId.weightUnit
        });
      }
      setCart(data);
    } catch (err) {
      console.error("fetchCart error:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = useCallback(async (code) => {
    // Basic deduplication/debounce
    if (code === lastScannedCode) {
      console.log("Redundant scan ignored:", code);
      return;
    }
    
    console.log("Processing scanned barcode:", code);
    setLastScannedCode(code);
    
    setLoading(true);
    try {
      const res = await addToCart(code);
      console.log("Add to Cart Success:", res.data);
      setMessage({ text: 'Added to cart!', type: 'success' });
      fetchCart();
      // Optional: keep scanning open for faster bulk shopping
      // If user wants manual restart, leave setScanning(false)
      // setScanning(false); 
    } catch (err) {
      console.error("Add to Cart Error:", err);
      setMessage({ text: err.response?.data?.message || 'Product not found', type: 'error' });
    } finally {
      setLoading(false);
      // Reset cooldown after a short delay
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        setLastScannedCode('');
      }, 2000);
    }
  }, [lastScannedCode]);

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      handleRemove(productId);
      return;
    }

    try {
      console.log(`Updating product ${productId} quantity to ${newQty}`);
      const { data } = await updateCartQuantity(productId, newQty);
      setCart(data);
      setMessage({ text: 'Quantity updated', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 1500);
    } catch (err) {
      console.error("Update quantity error:", err);
      setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleRemove = async (productId) => {
    try {
      console.log("Removing item from cart:", productId);
      await removeFromCart(productId);
      fetchCart();
      // Explicitly reset scanner state to allow re-scanning the same item if needed
      setLastScannedCode(''); 
    } catch (err) {
      console.error("Remove from Cart error:", err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      await createOrder();
      setMessage({ text: 'Order successful!', type: 'success' });
      setCart({ items: [] });
      fetchOrders();
      setActiveTab('orders');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to place order', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const totalAmount = cart.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  
  // Calculate total weight in grams first
  const totalWeightGrams = cart.items.reduce((sum, item) => {
    const val = item.productId.weightValue || 0;
    const unit = item.productId.weightUnit || 'kg';
    const weightInGrams = unit === 'kg' ? val * 1000 : val;
    return sum + (weightInGrams * item.quantity);
  }, 0);

  const formatWeight = (grams) => {
    if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
    return `${grams.toFixed(0)} g`;
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'shop' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('shop')}>
          <ShoppingCart size={18} /> Shop Now
        </button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>
          <History size={18} /> My Orders
        </button>
      </div>

      {activeTab === 'shop' ? (
        <div className="grid grid-2">
          <div>
            <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2><Camera size={24} /> Scan Barcode</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Scan any product to add it instantly</p>
              
              {scanning ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', padding: '1rem', background: '#000' }}>
                  <Scanner onScan={handleScan} onClose={() => setScanning(false)} />
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setScanning(true)} style={{ padding: '2rem 4rem', fontSize: '1.2rem' }}>
                  Start Scanning
                </button>
              )}

              {message.text && (
                <div className={`badge ${message.type === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '1.5rem', padding: '1rem' }}>
                  {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <h2><ShoppingCart size={24} /> Your Cart</h2>
              {cart.items.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Empty cart. Start scanning!</p>
              ) : (
                <>
                  <div className="table-container" style={{ maxHeight: '400px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Weight</th>
                          <th>Price</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => (
                          <tr key={item.productId._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.productId.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.productId.barcode}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                                  onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, -1)}
                                >-</button>
                                <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                                  onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, 1)}
                                >+</button>
                              </div>
                            </td>
                            <td>{item.productId.weightValue}{item.productId.weightUnit}</td>
                            <td>${(item.productId.price * item.quantity).toFixed(2)}</td>
                            <td>
                              <button className="btn btn-outline" style={{ color: 'var(--danger)', padding: '0.4rem' }} onClick={() => handleRemove(item.productId._id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Total Weight:</span>
                      <span style={{ fontWeight: 600 }}>{formatWeight(totalWeightGrams)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card fade-in">
          <h2>Purchase History</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="grid grid-1" style={{ gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order._id} className="card" style={{ background: 'var(--bg-muted)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ORDER ID: {order._id}</div>
                      <div style={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>${order.totalAmount.toFixed(2)}</div>
                        <div style={{ fontSize: '0.875rem' }}>Total Weight: {order.totalWeight}</div>
                      </div>
                  </div>
                    <div className="table-container">
                      <table style={{ background: 'white' }}>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Weight</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.weightValue}{item.weightUnit}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
