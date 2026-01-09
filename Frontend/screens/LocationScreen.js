import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import API_URL from '../config/api';

export default function DocumentVerificationScreen({ navigation }) {
  const [locationData, setLocationData] = useState({
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setLocationData({
          streetAddress: userData.street_address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          latitude: userData.latitude,
          longitude: userData.longitude,
        });
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const captureGPSLocation = async () => {
    setGpsLoading(true);

    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to capture GPS coordinates.'
        );
        setGpsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocationData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      Alert.alert('Success', 'GPS location captured successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get GPS location. Please try again.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!locationData.streetAddress || !locationData.city || !locationData.pincode) {
      Alert.alert('Error', 'Please fill in all required address fields');
      return;
    }

    if (locationData.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit PIN code');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/api/user/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          street_address: locationData.streetAddress,
          city: locationData.city,
          state: locationData.state,
          pincode: locationData.pincode,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage
        await AsyncStorage.setItem('user_data', JSON.stringify(data));

        Alert.alert(
          'Success',
          'Location saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Location',
      'You can add your location later from your profile settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Your Location</Text>
          <Text style={styles.subtitle}>
            Help us serve you better by providing your location
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity
            style={[styles.gpsButton, gpsLoading && styles.gpsButtonDisabled]}
            onPress={captureGPSLocation}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.gpsIcon}>📍</Text>
                <Text style={styles.gpsButtonText}>Capture GPS Location</Text>
              </>
            )}
          </TouchableOpacity>

          {locationData.latitude && locationData.longitude && (
            <View style={styles.gpsInfo}>
              <Text style={styles.gpsInfoText}>
                ✓ GPS: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={locationData.streetAddress}
              onChangeText={(value) => handleInputChange('streetAddress', value)}
              placeholder="Enter your street address"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={locationData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="City"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={locationData.state}
                onChangeText={(value) => handleInputChange('state', value)}
                placeholder="State"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={styles.input}
              value={locationData.pincode}
              onChangeText={(value) => handleInputChange('pincode', value)}
              placeholder="6-digit PIN code"
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  gpsButtonDisabled: {
    backgroundColor: '#AAA',
  },
  gpsIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  gpsInfo: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  gpsInfoText: {
    fontSize: 13,
    color: '#4A90E2',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 15,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#F4C430',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
