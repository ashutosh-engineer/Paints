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
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import FlipkartLoader from '../components/FlipkartLoader';
import { validateName, validatePhone, validatePincode, validateAddress } from '../utils/inputValidation';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon, 
  ShoppingBagIcon, 
  MapPinIcon 
} from '../components/ProfessionalIcons';

export default function ProfileSetupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    shopName: '',
    traderName: '',
    address: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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
        setFormData({
          fullName: userData.full_name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          shopName: userData.shop_name || '',
          traderName: userData.trader_name || '',
          address: userData.address || '',
          streetAddress: userData.street_address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    let validatedValue = value;
    
    // Apply validation based on field type
    switch (field) {
      case 'fullName':
      case 'traderName':
        validatedValue = validateName(value);
        break;
      case 'phone':
        validatedValue = validatePhone(value);
        break;
      case 'pincode':
        validatedValue = validatePincode(value);
        break;
      case 'streetAddress':
      case 'address':
      case 'shopName':
        validatedValue = validateAddress(value);
        break;
      case 'city':
      case 'state':
        validatedValue = validateName(value);
        break;
      default:
        validatedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName || !formData.phone) {
      Alert.alert('Validation Error', 'Please fill in Name and Phone Number');
      return;
    }

    if (formData.phone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      // Update basic profile
      const profileResponse = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          phone: formData.phone,
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      // Update shop details if provided
      if (formData.shopName || formData.traderName || formData.address) {
        if (formData.shopName && formData.traderName && formData.address) {
          const shopResponse = await fetch(`${API_URL}/api/user/shop-details`, {
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

          if (!shopResponse.ok) {
            const errorData = await shopResponse.json();
            console.warn('Shop details update failed:', errorData);
          }
        }
      }

      // Fetch updated user data
      const updatedResponse = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedData));
      }

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <FlipkartLoader size={60} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2874f0" />
      
      {/* Flipkart-style Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <UserIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Full Name *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <PhoneIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Phone Number *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MailIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Email</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                placeholder="Email address"
                placeholderTextColor="#999"
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          {/* Shop Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Information</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ShoppingBagIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Shop Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.shopName}
                onChangeText={(value) => handleInputChange('shopName', value)}
                placeholder="Enter your shop name"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <UserIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Trader/Business Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.traderName}
                onChangeText={(value) => handleInputChange('traderName', value)}
                placeholder="Enter trader or business name"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MapPinIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Shop Address</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter complete shop address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>

          {/* Location Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MapPinIcon size={18} color="#2874f0" strokeWidth={2} />
                <Text style={styles.label}>Street Address</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.streetAddress}
                onChangeText={(value) => handleInputChange('streetAddress', value)}
                placeholder="Enter street address"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                placeholder="Enter 6-digit pincode"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              * Required fields. Other information is optional but helps us serve you better.
            </Text>
          </View>

          {/* Extra padding at bottom to prevent footer overlap */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Footer with Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header Styles
  header: {
    backgroundColor: '#2874f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  // Content Styles
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#878787',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#878787',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2874f0',
  },
  infoText: {
    fontSize: 13,
    color: '#212121',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
  // Footer Styles
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#2874f0',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
