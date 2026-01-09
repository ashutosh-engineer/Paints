import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { ArrowLeftIcon } from '../components/ProfessionalIcons';
import { clearCart } from '../services/cartApi';
import { validateName, validateNumeric, validatePhone, validatePincode, validateAddress } from '../utils/inputValidation';

const { width } = Dimensions.get('window');


export default function CheckoutScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { cartItems } = route.params;
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter valid 10-digit mobile number';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    if (isPlacingOrder) {
      return; // Prevent duplicate submissions
    }

    setIsPlacingOrder(true);
    try {
      const token = await AsyncStorage.getItem('access_token');

      // Generate unique order ID for display
      const orderId = `ORD${Date.now().toString().slice(-8)}`;

      console.log('Cart items:', JSON.stringify(cartItems, null, 2));

      // Check if ANY items are hardcoded (have string IDs or isHardcoded flag)
      const hasHardcodedItems = cartItems.some(item =>
        typeof item.id === 'string' || item.isHardcoded === true
      );

      console.log('Has hardcoded items:', hasHardcodedItems);

      // If there are ANY hardcoded items, we must use the direct endpoint
      const isServerCart = !hasHardcodedItems && cartItems.length > 0 && cartItems.every(item => typeof item.id === 'number');

      console.log('Is server cart:', isServerCart);
      console.log('Will use endpoint:', isServerCart ? '/api/orders' : '/api/orders/direct');

      let orderItems = [];
      if (!isServerCart) {
        // Prepare items for backend - handle all items for direct endpoint
        orderItems = cartItems.map(item => {
          const productId = typeof item.id === 'number' ? item.id : null;
          if (!item.name) {
            throw new Error('Product name is missing');
          }
          if (!item.quantity || item.quantity < 1) {
            throw new Error('Invalid quantity');
          }
          return {
            product_id: productId,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price || 0,
            size_ordered: item.selectedSize || '1L'  // Default to 1L if not specified
          };
        });
      }

      // Calculate total only for direct (local) flow
      const totalAmount = isServerCart ? 0 : cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      // Build full address from form fields
      const fullAddress = [
        formData.addressLine1,
        formData.addressLine2,
        formData.landmark
      ].filter(Boolean).join(', ');

      const baseAddress = {
        delivery_address: fullAddress || formData.city,
        delivery_city: formData.city,
        delivery_state: formData.state,
        delivery_pincode: formData.pincode,
        delivery_phone: formData.mobileNumber,
      };
      const requestBody = isServerCart
        ? baseAddress
        : { ...baseAddress, items: orderItems, total_amount: totalAmount };

      console.log('Order request body:', JSON.stringify(requestBody, null, 2));

      // Save order to backend (server-cart -> /api/orders, local -> /api/orders/direct)
      const endpoint = isServerCart ? `${API_URL}/api/orders` : `${API_URL}/api/orders/direct`;

      console.log('Calling endpoint:', endpoint);
      console.log('Request method: POST');
      console.log('Has token:', !!token);

      const orderResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (orderResponse.ok) {
        const savedOrder = await orderResponse.json();

        const orderData = {
          orderId: savedOrder.order_number || orderId,
          items: cartItems,
          deliveryAddress: formData,
          orderDate: new Date().toISOString(),
        };

        // Clear carts so profile stats update
        await AsyncStorage.setItem('cart', JSON.stringify([]));

        // Clear server cart if there were any database items
        if (!isServerCart && hasHardcodedItems) {
          // Mixed cart - clear server cart too
          try {
            await clearCart();
          } catch (e) {
            console.warn('Cart clear (server) skipped:', e?.message);
          }
        } else if (isServerCart) {
          // Pure server cart
          try {
            await clearCart();
          } catch (e) {
            console.warn('Cart clear (server) skipped:', e?.message);
          }
        }

        // Navigate to Order Success Screen
        navigation.replace('OrderSuccess', { orderData });
      } else {
        // Get response text first to see what the server is actually returning
        const responseText = await orderResponse.text();
        console.error('Server response status:', orderResponse.status);
        console.error('Server response text:', responseText);

        let errorMessage = 'Failed to save order';
        try {
          const errorData = JSON.parse(responseText);
          console.error('Order error:', JSON.stringify(errorData, null, 2));
          console.error('Full error details:', errorData.detail);

          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('\n');
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          // Response is not JSON, use the raw text
          errorMessage = `Server error: ${responseText.substring(0, 200)}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const updateField = (field, value) => {
    let validatedValue = value;

    // Apply validation based on field type
    switch (field) {
      case 'fullName':
        validatedValue = validateName(value);
        break;
      case 'mobileNumber':
        validatedValue = validatePhone(value);
        break;
      case 'pincode':
        validatedValue = validatePincode(value);
        break;
      case 'addressLine1':
      case 'addressLine2':
      case 'landmark':
        validatedValue = validateAddress(value);
        break;
      case 'city':
      case 'state':
        validatedValue = validateName(value);
        break;
      default:
        validatedValue = value;
    }

    setFormData({ ...formData, [field]: validatedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ORDER SUMMARY ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </Text>

          {cartItems.map((item) => {
            const imageUrl = item.image_path && item.image_path.startsWith('http')
              ? item.image_path
              : `${API_URL}${item.image_path || item.image_url || ''}`;

            return (
              <View key={item.id} style={styles.orderItem}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.orderItemImage}
                  resizeMode="cover"
                />
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                  {item.selectedSize && (
                    <Text style={styles.orderItemSize}>Size: {item.selectedSize}</Text>
                  )}
                  {item.customRequest && (
                    <Text style={styles.orderItemNote} numberOfLines={2}>
                      Note: {item.customRequest}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => updateField('fullName', value)}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={[styles.input, errors.mobileNumber && styles.inputError]}
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChangeText={(value) => updateField('mobileNumber', value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.mobileNumber && (
              <Text style={styles.errorText}>{errors.mobileNumber}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pincode *</Text>
            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              placeholder="6-digit pincode"
              value={formData.pincode}
              onChangeText={(value) => updateField('pincode', value)}
              keyboardType="number-pad"
              maxLength={6}
            />
            {errors.pincode && (
              <Text style={styles.errorText}>{errors.pincode}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address (House No, Building Name) *</Text>
            <TextInput
              style={[styles.input, errors.addressLine1 && styles.inputError]}
              placeholder="Enter your address"
              value={formData.addressLine1}
              onChangeText={(value) => updateField('addressLine1', value)}
            />
            {errors.addressLine1 && (
              <Text style={styles.errorText}>{errors.addressLine1}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Road Name, Area, Colony</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              value={formData.addressLine2}
              onChangeText={(value) => updateField('addressLine2', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. near apollo hospital"
              value={formData.landmark}
              onChangeText={(value) => updateField('landmark', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City / District *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Enter city"
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State *</Text>
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              placeholder="Enter state"
              value={formData.state}
              onChangeText={(value) => updateField('state', value)}
            />
            {errors.state && (
              <Text style={styles.errorText}>{errors.state}</Text>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: 14 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacingOrder && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          <Text style={styles.placeOrderButtonText}>
            {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#878787',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemImage: {
    width: 60,
    height: 70,
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#212121',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  orderItemSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderItemNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c2c2c2',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff6161',
  },
  errorText: {
    fontSize: 11,
    color: '#ff6161',
    marginTop: 4,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: '#ff9f00',
    paddingVertical: 16,
    borderRadius: 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#cccccc',
    elevation: 0,
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
