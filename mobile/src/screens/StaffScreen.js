import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function StaffScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Form State
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); // kg or g

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    setIsScanning(false);
    // Allow re-scanning after a short delay if needed
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const handleAddProduct = async () => {
    if (!barcode || !name || !price || !stock || !weightValue) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    try {
      await API.post('/products', {
        barcode,
        name,
        price: Number(price),
        stock: Number(stock),
        weightValue: Number(weightValue),
        weightUnit
      });
      Alert.alert('Success', 'Product added successfully');
      setBarcode(''); setName(''); setPrice(''); setStock(''); setWeightValue('');
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
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
        <Text style={styles.title}>Staff Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <View style={styles.scanRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]} placeholder="Barcode" value={barcode} onChangeText={setBarcode} />
          <TouchableOpacity style={styles.scanBtn} onPress={() => setIsScanning(true)}>
            <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 5 }]} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1, marginLeft: 5 }]} placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 5 }]} placeholder="Weight Value" value={weightValue} onChangeText={setWeightValue} keyboardType="numeric" />
          <TouchableOpacity style={styles.unitBtn} onPress={() => setWeightUnit(weightUnit === 'kg' ? 'g' : 'kg')}>
            <Text>Unit: {weightUnit}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Inventory</Text>
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text>Barcode: {item.barcode}</Text>
              <Text>Stock: {item.stock} | {item.weightValue}{item.weightUnit}</Text>
            </View>
            <Text style={styles.productPrice}>₹{item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ff4d4f', padding: 8, borderRadius: 5 },
  logoutTxt: { color: 'white', fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, elevation: 2 },
  input: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  scanRow: { flexDirection: 'row', marginBottom: 10 },
  scanBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, justifyContent: 'center' },
  unitBtn: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', width: 80 },
  submitBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelScanBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#ff4d4f', padding: 15, borderRadius: 8 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  productCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745' }
});
