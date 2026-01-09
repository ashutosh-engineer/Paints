import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '../constants/theme';
import { ShoppingBagIcon } from './ProfessionalIcons';

const ProfessionalProductCard = ({ 
  product, 
  onPress, 
  onAddToCart, 
  style = {} 
}) => {
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  return (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{product.discount_percent}% OFF</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image 
            source={{ uri: `${API_URL}${product.image_url}` }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <ShoppingBagIcon size={40} color={Colors.textLight} strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.productDescription} numberOfLines={1}>
          {product.description}
        </Text>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              ₹{discountedPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ₹{product.price.toFixed(2)}
              </Text>
            )}
          </View>
          
          {hasDiscount && (
            <Text style={styles.savingsText}>
              Save ₹{(product.price - discountedPrice).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Stock Warning */}
        {product.stock < 10 && product.stock > 0 && (
          <Text style={styles.lowStockText}>
            Only {product.stock} left in stock!
          </Text>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            product.stock === 0 && styles.addToCartButtonDisabled
          ]}
          onPress={onAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={[
            styles.addToCartText,
            product.stock === 0 && styles.addToCartTextDisabled
          ]}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.background,
  },
  
  productImage: {
    width: '100%',
    height: '100%',
  },
  
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  
  productInfo: {
    padding: 16,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  
  productDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  
  priceSection: {
    marginBottom: 12,
  },
  
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  currentPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 8,
  },
  
  originalPrice: {
    fontSize: 14,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 12,
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  addToCartButtonDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  addToCartText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  
  addToCartTextDisabled: {
    color: Colors.white,
  },
});

export default ProfessionalProductCard;