import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import { ArrowLeftIcon, XIcon, ShoppingBagIcon } from '../components/ProfessionalIcons';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' }),
              });

              if (response.ok) {
                Alert.alert('Success', 'Order cancelled successfully');
                loadOrderDetails();
              } else {
                Alert.alert('Error', 'Failed to cancel order');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Info Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{order.order_number || order.id}</Text>
              <Text style={styles.orderDate}>{order.order_date} • {order.order_time}</Text>
              <Text style={styles.orderDay}>{order.order_day}</Text>
            </View>
          </View>
        </View>

        {/* Customer & Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconBox}>
              <Text style={styles.sectionIcon}>⊙</Text>
            </View>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.addressText}>{order.delivery_address}</Text>
            {order.delivery_city && order.delivery_state && (
              <Text style={styles.addressText}>
                {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
              </Text>
            )}
            {order.delivery_phone && (
              <Text style={styles.addressText}>Phone: {order.delivery_phone}</Text>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconBox}>
              <Text style={styles.sectionIcon}>☰</Text>
            </View>
            <Text style={styles.sectionTitle}>Items ({order.order_items?.length || 0})</Text>
          </View>
          {order.order_items?.map((item, index) => {
            const hasProduct = !!item.product;
            const imageUrl = hasProduct && item.product.image_path && item.product.image_path.startsWith('http')
              ? item.product.image_path
              : hasProduct ? `${API_URL}${item.product?.image_path || ''}` : null;

            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  {/* Product Image */}
                  {imageUrl ? (
                    <Image 
                      source={{ uri: imageUrl }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                      <ShoppingBagIcon size={24} color="#aaa" strokeWidth={1.5} />
                    </View>
                  )}
                  
                  {/* Product Details */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                    {item.size_ordered && (
                      <Text style={styles.itemSize}>Size: {item.size_ordered}</Text>
                    )}
                    <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const TimelineItem = ({ title, completed, active, isLast }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={[
        styles.timelineIcon,
        completed && styles.timelineIconCompleted,
        active && styles.timelineIconActive,
      ]}>
        {completed && <Text style={styles.timelineCheckmark}>✓</Text>}
      </View>
      {!isLast && (
        <View style={[
          styles.timelineLine,
          completed && styles.timelineLineCompleted,
        ]} />
      )}
    </View>
    <Text style={[
      styles.timelineTitle,
      (completed || active) && styles.timelineTitleActive,
    ]}>
      {title}
    </Text>
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ffc107';
    case 'confirmed':
      return '#17a2b8';
    case 'shipped':
      return '#007bff';
    case 'delivered':
      return '#28a745';
    case 'cancelled':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: '#2874f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#878787',
  },
  orderDay: {
    fontSize: 11,
    color: '#878787',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  timeline: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#388e3c',
    borderColor: '#388e3c',
  },
  timelineIconActive: {
    borderColor: '#2874f0',
  },
  timelineCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#388e3c',
  },
  timelineTitle: {
    fontSize: 13,
    color: '#878787',
    paddingTop: 2,
  },
  timelineTitleActive: {
    color: '#212121',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#2874f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#878787',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  discountLabel: {
    color: '#388e3c',
    fontWeight: '600',
  },
  discountValue: {
    color: '#388e3c',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  paymentMethod: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  savingsBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#388e3c',
  },
  savingsIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#388e3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savingsIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  savingsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#2e7d32',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2874f0',
    paddingVertical: 14,
    borderRadius: 2,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2874f0',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ff6161',
  },
  dangerIconContainer: {
    backgroundColor: '#ff6161',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff6161',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
});
