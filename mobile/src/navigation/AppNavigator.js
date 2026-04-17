import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminScreen from '../screens/AdminScreen';
import DailyRevenueScreen from '../screens/DailyRevenueScreen';
import StaffScreen from '../screens/StaffScreen';
import CustomerScreen from '../screens/CustomerScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkToken = async () => {
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      if (userRole) {
        setRole(userRole);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#0000ff"/>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!role ? (
        <>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setRole={setRole} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : role === 'admin' ? (
        <>
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="DailyRevenue" component={DailyRevenueScreen} options={{ title: 'Daily Revenue' }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => <LoginScreen {...props} setRole={setRole} />}
          </Stack.Screen>
        </>
      ) : role === 'staff' ? (
        <>
          <Stack.Screen name="Staff" component={StaffScreen} options={{ title: 'Staff Dashboard' }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => <LoginScreen {...props} setRole={setRole} />}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="Customer" component={CustomerScreen} options={{ title: 'Customer Dashboard' }} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Order History' }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => <LoginScreen {...props} setRole={setRole} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
