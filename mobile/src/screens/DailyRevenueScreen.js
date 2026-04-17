import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function DailyRevenueScreen({ route }) {
  const { dailyData } = route.params; // { date, revenue, orders }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{dailyData.date}</Text>
        <Text style={styles.revText}>Total: ₹{dailyData.revenue}</Text>
      </View>

      <Text style={styles.subTitle}>Orders ({dailyData.orders.length})</Text>
      
      <FlatList
        data={dailyData.orders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.customerName}>Customer: {item.userId?.name || 'Unknown'}</Text>
            <View style={styles.divider} />
            
            {item.items.map((prod, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{prod.quantity}x {prod.name}</Text>
                <Text style={styles.itemPrice}>₹{prod.price * prod.quantity}</Text>
              </View>
            ))}
            
            <View style={styles.divider} />
            <Text style={styles.orderTotal}>Order Total: ₹{item.totalAmount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  revText: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { color: '#475569' },
  itemPrice: { color: '#475569' },
  orderTotal: { fontWeight: 'bold', textAlign: 'right', fontSize: 16 }
});
