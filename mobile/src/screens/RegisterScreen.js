import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // By default register as customer. In real app, admin creates staff. Here we allow selection for testing.
  const [role, setRole] = useState('customer');

  const handleRegister = async () => {
    try {
      await API.post('/auth/register', { name, email, password, role });
      Alert.alert('Success', 'Registered successfully');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]} onPress={() => setRole('customer')}><Text style={role === 'customer' ? styles.roleTextActive : styles.roleText}>Customer</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.roleBtn, role === 'staff' && styles.roleBtnActive]} onPress={() => setRole('staff')}><Text style={role === 'staff' ? styles.roleTextActive : styles.roleText}>Staff</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]} onPress={() => setRole('admin')}><Text style={role === 'admin' ? styles.roleTextActive : styles.roleText}>Admin</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginHorizontal: 5, borderRadius: 5, backgroundColor: '#fff' },
  roleBtnActive: { backgroundColor: '#28a745', borderColor: '#28a745' },
  roleText: { color: '#333' },
  roleTextActive: { color: '#fff', fontWeight: 'bold' }
});
