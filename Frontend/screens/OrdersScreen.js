import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import FlipkartLoader from '../components/FlipkartLoader';
import { ArrowLeftIcon, ArrowRightIcon, ShoppingBagIcon, SearchIcon, XIcon } from '../components/ProfessionalIcons';

const { width } = Dimensions.get('window');

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadOrders();
    const unsub = navigation.addListener('focus', loadOrders);
    return unsub;
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => {
      // Search by order ID
      if (order.id.toString().includes(query)) return true;
      
      // Search by order number
      if (order.order_number && order.order_number.toLowerCase().includes(query)) return true;
      
      // Search by status
      if (order.status.toLowerCase().includes(query)) return true;
      
      // Search by product names in order items
      if (order.order_items && order.order_items.some(item => 
        item.product_name && item.product_name.toLowerCase().includes(query)
      )) return true;
      
      // Search by date
      const dateStr = formatDate(order.created_at).toLowerCase();
      if (dateStr.includes(query)) return true;
      
      return false;
    });
    
    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'confirmed':
        return '#2196f3';
      case 'shipped':
        return '#9c27b0';
      case 'delivered':
        return '#388e3c';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <FlipkartLoader size={60} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Flipkart Style Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        
        {!showSearch ? (
          <>
            <Text style={styles.headerTitle}>My Orders</Text>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearch(true)}
            >
              <SearchIcon size={22} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              placeholderTextColor="#E3F2FD"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <XIcon size={22} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2874f0']}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <ShoppingBagIcon size={80} color="#d3d3d3" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Orders' : 'No Orders Found'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Your order history will appear here'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('Shop')}
              >
                <Text style={styles.shopButtonText}>START SHOPPING</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map((order, orderIndex) => (
              <TouchableOpacity
                key={`order-${order.id}-${orderIndex}`}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                activeOpacity={0.9}
              >
                {/* Status Bar */}
                <View style={[styles.statusBar, { backgroundColor: getStatusColor(order.status) }]} />
                
                <View style={styles.orderContent}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                      <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                    </View>
                    <Text style={styles.orderDate}>
                      {formatDate(order.created_at)}
                    </Text>
                  </View>

                  {/* Order Items Preview */}
                  <View style={styles.orderItemsPreview}>
                    {order.order_items && order.order_items.slice(0, 2).map((item, index) => {
                      const hasProduct = !!item.product;
                      const imageUrl = hasProduct && item.product.image_path && item.product.image_path.startsWith('http')
                        ? item.product.image_path
                        : hasProduct ? `${API_URL}${item.product?.image_path || item.product?.image_url || ''}` : null;

                      return (
                        <View key={`${order.id}-item-${item.id || index}`} style={styles.itemPreview}>
                          {imageUrl ? (
                            <Image 
                              source={{ uri: imageUrl }}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.itemImage, { alignItems: 'center', justifyContent: 'center' }]}>
                              <ShoppingBagIcon size={20} color="#aaa" strokeWidth={1.5} />
                            </View>
                          )}
                          <View style={styles.itemDetails}>
                            <Text style={styles.itemName} numberOfLines={1}>
                              {item.product?.name || item.product_name || 'Product'}
                            </Text>
                            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                          </View>
                        </View>
                      );
                    })}
                    {order.order_items && order.order_items.length > 2 && (
                      <Text style={styles.moreItems}>
                        +{order.order_items.length - 2} more item(s)
                      </Text>
                    )}
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderNumber}>Order #{order.id}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <ArrowRightIcon size={16} color="#2874f0" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  // Header - Flipkart Style
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    paddingVertical: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Filter Container
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#2874f0',
    borderColor: '#2874f0',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  // Order Card - Flipkart Style
  orderCard: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  orderContent: {
    padding: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  orderDate: {
    fontSize: 12,
    color: '#878787',
  },
  // Order Items Preview
  orderItemsPreview: {
    marginBottom: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#fafafa',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#878787',
  },
  moreItems: {
    fontSize: 12,
    color: '#2874f0',
    fontWeight: '600',
    marginTop: 4,
  },
  // Order Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderNumber: {
    fontSize: 12,
    color: '#878787',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2874f0',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    paddingBottom: 120,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#878787',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 2,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
