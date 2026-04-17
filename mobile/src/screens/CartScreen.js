import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import API from '../services/api';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      const res = await API.put('/cart/quantity', { productId, quantity: newQuantity });
      setCart(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await API.delete(`/cart/${productId}`);
      setCart(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return Alert.alert('Cart empty', 'Add some products first');
    setLoading(true);
    try {
      await API.post('/orders');
      Alert.alert('Success', 'Order placed successfully');
      setCart({ items: [] });
      navigation.navigate('Orders');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let totalPrice = 0;
    let totalGrams = 0;
    cart.items.forEach(item => {
      const product = item.productId;
      if (product) {
        totalPrice += product.price * item.quantity;
        const weightInGrams = product.weightUnit === 'kg' ? product.weightValue * 1000 : product.weightValue;
        totalGrams += weightInGrams * item.quantity;
      }
    });
    const totalWeightStr = totalGrams >= 1000 ? `${(totalGrams / 1000).toFixed(2)} kg` : `${totalGrams.toFixed(0)} g`;
    return { totalPrice, totalWeightStr };
  };

  const { totalPrice, totalWeightStr } = calculateTotals();

  return (
    <View style={styles.container}>
      {cart.items.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={item => item.productId?._id || Math.random().toString()}
            renderItem={({ item }) => {
              const product = item.productId;
              if (!product) return null;
              return (
                <View style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>₹{product.price} | {product.weightValue}{product.weightUnit}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(product._id, item.quantity, -1)}><Text style={styles.qtyTxt}>-</Text></TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(product._id, item.quantity, 1)}><Text style={styles.qtyTxt}>+</Text></TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(product._id)}><Text style={styles.removeTxt}>X</Text></TouchableOpacity>
                </View>
              );
            }}
          />
          <View style={styles.footer}>
            <View style={styles.totals}>
              <Text style={styles.totalText}>Total Weight: {totalWeightStr}</Text>
              <Text style={styles.totalPrice}>Total: ₹{totalPrice}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={loading}>
              <Text style={styles.checkoutBtnText}>{loading ? 'Processing...' : 'Place Order'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  emptyText: { textAlign: 'center', fontSize: 18, marginTop: 50, color: '#64748b' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', elevation: 1 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productMeta: { color: '#64748b', marginTop: 4 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  qtyBtn: { backgroundColor: '#e2e8f0', width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  qtyTxt: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  qtyValue: { marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' },
  removeBtn: { backgroundColor: '#ff4d4f', width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  removeTxt: { color: 'white', fontWeight: 'bold' },
  footer: { borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 15, marginTop: 10 },
  totals: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#475569' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  checkoutBtn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  checkoutBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
