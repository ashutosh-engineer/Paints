import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import FlipkartLoader from '../components/FlipkartLoader';
import { BirlaOpusLogo } from '../components/LogoComponents';

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get stored token
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        // No token found, go to login
        navigateToLogin();
        return;
      }

      // Validate token with backend
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.valid && data.user) {
          // Update stored user data with fresh info
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
          
          // Navigate based on user type
          if (data.user.is_admin) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else if (data.user.is_profile_complete) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ProfileSetup' }],
            });
          }
        } else {
          // Token invalid, clear and go to login
          await clearAuthData();
          navigateToLogin();
        }
      } else {
        // Token expired or invalid
        await clearAuthData();
        navigateToLogin();
      }
    } catch (error) {
      console.log('Auth check error:', error);
      // Network error - try to use cached data if available
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Use cached data for offline access
          if (user.is_admin) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else if (user.is_profile_complete) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          } else {
            navigateToLogin();
          }
        } catch {
          navigateToLogin();
        }
      } else {
        navigateToLogin();
      }
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['access_token', 'user_data']);
  };

  const navigateToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2874f0" barStyle="light-content" />
      <View style={styles.content}>
        <BirlaOpusLogo size={100} layout="horizontal" />
        <View style={styles.loaderContainer}>
          <FlipkartLoader size={50} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    marginTop: 40,
  },
});
