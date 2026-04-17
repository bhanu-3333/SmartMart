import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function CustomerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setIsScanning(false);
    try {
      await API.post('/cart/add', { code: data });
      Alert.alert('Success', 'Product added to cart!');
      setTimeout(() => setScanned(false), 2000);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  if (isScanning) {
    return (
      <View style={{ flex: 1 }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.ean8, BarCodeScanner.Constants.BarCodeType.upc_e, BarCodeScanner.Constants.BarCodeType.code128]}
        />
        <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setIsScanning(false)}>
          <Text style={styles.buttonText}>Cancel Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Welcome back!</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => setIsScanning(true)}>
          <Text style={styles.cardTitle}>Scan Product</Text>
          <Text style={styles.cardDesc}>Use camera to scan barcode and add to cart directly</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cardTitle}>View Cart</Text>
          <Text style={styles.cardDesc}>Check items, adjust quantities and checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.cardTitle}>Order History</Text>
          <Text style={styles.cardDesc}>View your past purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ff4d4f', padding: 8, borderRadius: 5 },
  logoutTxt: { color: 'white', fontWeight: 'bold' },
  greeting: { fontSize: 18, marginBottom: 20, color: '#475569' },
  cardContainer: { gap: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  cardDesc: { color: '#64748b' },
  cancelScanBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#ff4d4f', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
