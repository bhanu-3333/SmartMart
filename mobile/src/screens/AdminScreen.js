import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function AdminScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayCustomers: 0
  });

  const [dailyRevenue, setDailyRevenue] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminStatsRes, todayStatsRes, allOrdersRes] = await Promise.all([
        API.get('/orders/stats'),
        API.get('/orders/today-stats'),
        API.get('/orders/all')
      ]);

      setStats({
        totalProducts: adminStatsRes.data.totalProducts || 0,
        totalRevenue: adminStatsRes.data.totalRevenue || 0,
        todayRevenue: todayStatsRes.data.todayRevenue || 0,
        todayCustomers: todayStatsRes.data.todayCustomerCount || 0
      });

      // Group orders by date (YYYY-MM-DD)
      const orders = allOrdersRes.data;
      const grouped = {};
      orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { revenue: 0, orders: [] };
        }
        grouped[date].revenue += order.totalAmount;
        grouped[date].orders.push(order);
      });

      // Convert to array
      const dailyArray = Object.keys(grouped).map(date => ({
        date,
        revenue: grouped[date].revenue,
        orders: grouped[date].orders
      }));
      
      // Sort by newest date
      dailyArray.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDailyRevenue(dailyArray);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}><Text style={styles.statLabel}>Total Products</Text><Text style={styles.statValue}>{stats.totalProducts}</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Total Revenue</Text><Text style={styles.statValue}>₹{stats.totalRevenue}</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Today's Revenue</Text><Text style={styles.statValue}>₹{stats.todayRevenue}</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Today's Customers</Text><Text style={styles.statValue}>{stats.todayCustomers}</Text></View>
      </View>

      <Text style={styles.subTitle}>Daily Revenue</Text>
      {dailyRevenue.map((item, index) => (
        <TouchableOpacity key={index} style={styles.dailyItem} onPress={() => navigation.navigate('DailyRevenue', { dailyData: item })}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.revText}>₹{item.revenue}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ff4d4f', padding: 8, borderRadius: 5 },
  logoutTxt: { color: 'white', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2, alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 13, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dailyItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  revText: { fontSize: 16, fontWeight: 'bold', color: '#10b981' }
});
