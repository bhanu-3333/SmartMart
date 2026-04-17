import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import API from '../services/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders found</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.header}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.status}>Completed</Text>
              </View>
              
              <View style={styles.itemsList}>
                {item.items.map((prod, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{prod.quantity}x {prod.name}</Text>
                    <Text style={styles.itemPrice}>₹{prod.price * prod.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <Text style={styles.weight}>Weight: {item.totalWeight || 'N/A'}</Text>
                <Text style={styles.total}>Total: ₹{item.totalAmount}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  emptyText: { textAlign: 'center', fontSize: 18, marginTop: 50, color: '#64748b' },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10 },
  date: { color: '#64748b', fontSize: 14 },
  status: { color: '#10b981', fontWeight: 'bold' },
  itemsList: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { color: '#334155' },
  itemPrice: { color: '#334155' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  weight: { fontWeight: 'bold', color: '#64748b' },
  total: { fontWeight: 'bold', fontSize: 16 }
});
