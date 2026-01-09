import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { ShoppingBagIcon, MapPinIcon, UserIcon } from './ProfessionalIcons';

export default function ShopDetailsModal({ visible, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    shopName: '',
    traderName: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) {
      Alert.alert('Validation Error', 'Please enter your shop name');
      return false;
    }
    if (!formData.traderName.trim()) {
      Alert.alert('Validation Error', 'Please enter trader/business name');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Please enter your shop address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/api/user/shop-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shop_name: formData.shopName,
          trader_name: formData.traderName,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user data
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          parsedData.shop_name = formData.shopName;
          parsedData.trader_name = formData.traderName;
          parsedData.address = formData.address;
          parsedData.shop_details_completed = true;
          await AsyncStorage.setItem('user_data', JSON.stringify(parsedData));
        }

        Alert.alert(
          'Success!',
          'Your shop details have been saved successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({ shopName: '', traderName: '', address: '' });
                if (onSuccess) onSuccess();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to save shop details');
      }
    } catch (error) {
      console.error('Error saving shop details:', error);
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <ShoppingBagIcon size={48} color="#2874f0" strokeWidth={2} />
              <Text style={styles.title}>Shop Details Required</Text>
              <Text style={styles.subtitle}>
                Please provide your shop information to continue using the app
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Shop Name */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ShoppingBagIcon size={20} color="#2874f0" strokeWidth={2} />
                  <Text style={styles.label}>Shop Name *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.shopName}
                  onChangeText={(value) => handleInputChange('shopName', value)}
                  placeholder="Enter your shop name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Trader/Business Name */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <UserIcon size={20} color="#2874f0" strokeWidth={2} />
                  <Text style={styles.label}>Trader/Business Name *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.traderName}
                  onChangeText={(value) => handleInputChange('traderName', value)}
                  placeholder="Enter trader or business name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MapPinIcon size={20} color="#2874f0" strokeWidth={2} />
                  <Text style={styles.label}>Shop Address *</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Enter complete shop address"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#878787',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#2874f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
