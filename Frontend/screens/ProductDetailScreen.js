import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import { ArrowLeftIcon } from '../components/ProfessionalIcons';
import { addToCart as addToCartApi } from '../services/cartApi';

const { width } = Dimensions.get('window');


export default function ProductDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('1L');
  const [customRequest, setCustomRequest] = useState('');

  // Use image_path if it's a full URL (starts with http), otherwise prepend API_URL
  const imageUrl = product.image_path && product.image_path.startsWith('http') 
    ? product.image_path 
    : `${API_URL}${product.image_path || product.image_url || ''}`;

  const sizes = ['1L', '4L', '10L', '20L'];

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (text) => {
    const num = parseInt(text) || 1;
    if (num < 1) {
      setQuantity(1);
    } else {
      setQuantity(num);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (typeof product.id === 'number') {
        await addToCartApi(product.id, quantity, selectedSize);
      } else {
        const cartStr = await AsyncStorage.getItem('cart');
        let cart = cartStr ? JSON.parse(cartStr) : [];
        const existingIndex = cart.findIndex(item => item.id === product.id);
        const cartItem = {
          ...product,
          quantity,
          selectedSize,
          customRequest: customRequest.trim()
        };
        if (existingIndex >= 0) {
          cart[existingIndex].quantity += quantity;
          if (selectedSize) {
            cart[existingIndex].selectedSize = selectedSize;
          }
          if (customRequest.trim()) {
            cart[existingIndex].customRequest = customRequest.trim();
          }
        } else {
          cart.push(cartItem);
        }
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      }

      Alert.alert(
        'Added to Cart',
        `${quantity} x ${product.name} (${selectedSize}) added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
        ]
      );
      setQuantity(1);
      setCustomRequest('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.brand}>Birla Opus</Text>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Size Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.sizeButtonTextSelected
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Text style={[styles.quantityButtonText, quantity <= 1 && styles.disabledText]}>−</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={String(quantity)}
                onChangeText={handleQuantityChange}
                keyboardType="number-pad"
                maxLength={3}
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={incrementQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Custom Request */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Request (Optional)</Text>
            <TextInput
              style={styles.customRequestInput}
              placeholder="Any customization or special request..."
              placeholderTextColor="#999"
              value={customRequest}
              onChangeText={setCustomRequest}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: '#2874f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 16,
  },
  imageContainer: {
    width: width,
    height: width * 0.9,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: '#878787',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    lineHeight: 26,
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 22,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  sizeButtonSelected: {
    borderColor: '#2874f0',
    backgroundColor: '#e7f3ff',
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  sizeButtonTextSelected: {
    color: '#2874f0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2874f0',
  },
  disabledText: {
    color: '#ccc',
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  customRequestInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#fafafa',
    minHeight: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    backgroundColor: '#ff9f00',
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
