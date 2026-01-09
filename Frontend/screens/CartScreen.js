import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import { ShoppingCartIcon, GiftIcon, ArrowLeftIcon, TagIcon } from '../components/ProfessionalIcons';
import {
  fetchCart,
  updateCartItemQuantity,
  removeFromCart,
} from '../services/cartApi';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCart = async () => {
    setLoading(true);
    try {
      // Try to fetch from backend
      const backendCart = await fetchCart();
      const localCartStr = await AsyncStorage.getItem('cart');
      const localCart = localCartStr ? JSON.parse(localCartStr) : [];
      
      // Combine backend cart with local cart (for hardcoded products)
      const combinedCart = [...backendCart, ...localCart];
      setCart(combinedCart);
    } catch (error) {
      console.error('Error loading backend cart:', error.message);
      // Silently fallback to local cart without showing error
      try {
        const localCartStr = await AsyncStorage.getItem('cart');
        setCart(localCartStr ? JSON.parse(localCartStr) : []);
      } catch (e) {
        console.error('Error loading local cart:', e);
        setCart([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    // Optimistic update - update UI immediately
    const previousCart = [...cart];
    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    );

    try {
      if (item.product) { // This is a backend cart item
        await updateCartItemQuantity(item.id, newQuantity);
      } else { // This is a local cart item
        const updatedCart = cart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
        );
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      // Don't reload cart - optimistic update already done
    } catch (error) {
      // Revert on error
      setCart(previousCart);
      Alert.alert('Error', `Failed to update quantity: ${error.message}`);
    }
  };

  const handleRemoveItem = async (item) => {
    // Optimistic update - remove from UI immediately
    const previousCart = [...cart];
    setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== item.id));

    try {
      if (item.product) { // Backend item
        await removeFromCart(item.id);
      } else { // Local item
        const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      // Don't reload cart - optimistic update already done
    } catch (error) {
      // Revert on error
      setCart(previousCart);
      Alert.alert('Error', `Failed to remove item: ${error.message}`);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product ? item.product.price : item.price;
      return sum + (price || 0) * item.quantity;
    }, 0);
  };

  const getTotalDiscount = () => {
    return cart.reduce((sum, item) => {
      const product = item.product || item;
      if (product.original_price && product.original_price > product.price) {
        return sum + (product.original_price - product.price) * item.quantity;
      }
      return sum;
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal(); // In this app, subtotal is the final amount before shipping
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    navigation.navigate('Checkout', { cartItems: cart });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2874f0" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        {/* Flipkart Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart (0)</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* Empty Cart State */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ShoppingCartIcon size={100} color="#d3d3d3" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty!</Text>
          <Text style={styles.emptyText}>
            Add items to it now
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Flipkart Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cart.map((item, index) => {
          // Normalize item whether from DB or local
          const product = item.product || item; // DB returns { product, quantity }, local stores product fields on item
          const imageUrl = product.image_path && product.image_path.startsWith('http')
            ? product.image_path
            : `${API_URL}${product.image_path || product.image_url || ''}`;

          return (
            <View key={item.id} style={styles.cartItemCard}>
              <View style={styles.cartItemContent}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Product Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productBrand}>Birla Opus</Text>

                  {/* Show selected size if available */}
                  {product.selectedSize && (
                    <Text style={styles.productSize}>Size: {product.selectedSize}</Text>
                  )}

                  {/* Show custom request if available */}
                  {product.customRequest && (
                    <Text style={styles.customRequest} numberOfLines={2}>
                      Note: {product.customRequest}
                    </Text>
                  )}

                  {/* Quantity Controls */}
                  <View style={styles.actionRow}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.quantityBox}>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Remove Item',
                          `Remove ${product.name} from cart?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', onPress: () => handleRemoveItem(item), style: 'destructive' }
                          ]
                        );
                      }}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: 14 + insets.bottom }]}>
        <View style={styles.bottomPriceSection}>
          <Text style={styles.bottomTotalLabel}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handleCheckout}
        >
          <Text style={styles.placeOrderButtonText}>CHECKOUT</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Header - Flipkart Style
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  // Delivery Banner
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  deliveryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388e3c',
    flex: 1,
  },
  // Cart Item Card - Flipkart Style
  cartItemCard: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginHorizontal: 0,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  cartItemContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 120,
    backgroundColor: '#fafafa',
    borderRadius: 2,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(56, 142, 60, 0.9)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '400',
    color: '#212121',
    lineHeight: 20,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#878787',
    marginBottom: 4,
  },
  productSize: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 6,
  },
  customRequest: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '400',
    color: '#878787',
    textDecorationLine: 'line-through',
  },
  discountPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#388e3c',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c2c2c2',
    borderRadius: 2,
  },
  quantityButton: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  quantityBox: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#c2c2c2',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: 0.5,
  },
  stockWarning: {
    fontSize: 11,
    color: '#ff9800',
    marginTop: 6,
    fontWeight: '500',
  },
  // Price Details Card
  priceDetailsCard: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#878787',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#212121',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#212121',
  },
  freeText: {
    color: '#388e3c',
    fontWeight: '600',
  },
  discountLabel: {
    color: '#388e3c',
  },
  discountValue: {
    color: '#388e3c',
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  savingsBox: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 2,
    marginTop: 12,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388e3c',
    textAlign: 'center',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#878787',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopNowButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 2,
  },
  shopNowButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Bottom Bar - Flipkart Style
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPriceSection: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: '#2874f0',
    fontWeight: '500',
  },
  bottomSavingsText: {
    color: '#388e3c',
    fontWeight: '600',
  },
  placeOrderButton: {
    backgroundColor: '#fb641b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
