import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import FlipkartLoader from '../components/FlipkartLoader';
import { LogoutIcon, ShoppingBagIcon } from '../components/ProfessionalIcons';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userDataStr = await AsyncStorage.getItem('user_data');
      
      if (!token || !userDataStr) {
        navigation.replace('Login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      if (!userData.is_admin) {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        navigation.replace('Dashboard');
        return;
      }

      await loadAllData();
    } catch (error) {
      console.error('Error:', error);
      navigation.replace('Login');
    }
  };

  const loadAllData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/orders`, { headers }),
        fetch(`${API_URL}/api/admin/users?limit=100`, { headers }),
        fetch(`${API_URL}/api/admin/products/analytics`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (analyticsRes.ok) setProductAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.multiRemove(['access_token', 'user_data']);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      shipped: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#f44336',
    };
    return colors[status] || '#9e9e9e';
  };

  const getOrderUser = (userId) => {
    return users.find(u => u.id === userId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <FlipkartLoader size={60} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2874f0" barStyle="light-content" />

      {/* Flipkart Style Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Kubti Hardware</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogoutIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2874f0']} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#2874f0' }]}>
                <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#ff9800' }]}>
                <Text style={styles.statValue}>{stats?.total_orders || 0}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#9c27b0' }]}>
                <Text style={styles.statValue}>{stats?.total_items_sold || 0}</Text>
                <Text style={styles.statLabel}>Items Sold</Text>
              </View>
            </View>

            {/* Recent Orders Preview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <TouchableOpacity onPress={() => setActiveTab('orders')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {orders.slice(0, 3).map((order) => {
                const orderUser = getOrderUser(order.user_id);
                const firstItem = order.order_items?.[0];
                const productImage = firstItem?.product?.image_path;
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => openOrderDetails(order)}
                  >
                    <View style={styles.orderProductRow}>
                      {productImage ? (
                        <Image
                          source={{ uri: productImage.startsWith('http') ? productImage : `${API_URL}${productImage}` }}
                          style={styles.orderProductImage}
                        />
                      ) : (
                        <View style={[styles.orderProductImage, styles.productImagePlaceholder]}>
                          <ShoppingBagIcon size={20} color="#ccc" />
                        </View>
                      )}
                      <View style={styles.orderProductInfo}>
                        <Text style={styles.orderProductName} numberOfLines={1}>
                          {firstItem?.product_name || firstItem?.product?.name || 'Product'}
                        </Text>
                        {order.order_items?.length > 1 && (
                          <Text style={styles.orderMoreItems}>+{order.order_items.length - 1} more items</Text>
                        )}
                        <Text style={styles.orderUser}>By: {orderUser?.full_name || orderUser?.email || 'Unknown'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Top Products Preview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Selling Products</Text>
                <TouchableOpacity onPress={() => setActiveTab('products')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {productAnalytics.slice(0, 3).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  {product.image_url ? (
                    <Image
                      source={{ uri: product.image_url.startsWith('http') ? product.image_url : `${API_URL}${product.image_url}` }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                      <ShoppingBagIcon size={24} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productSold}>{product.total_quantity_sold || 0} units sold</Text>
                  </View>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'orders' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Orders ({orders.length})</Text>
            {orders.length === 0 ? (
              <Text style={styles.emptyText}>No orders yet</Text>
            ) : (
              orders.map((order) => {
                const orderUser = getOrderUser(order.user_id);
                const firstItem = order.order_items?.[0];
                const productImage = firstItem?.product?.image_path;
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => openOrderDetails(order)}
                  >
                    <View style={styles.orderProductRow}>
                      {productImage ? (
                        <Image
                          source={{ uri: productImage.startsWith('http') ? productImage : `${API_URL}${productImage}` }}
                          style={styles.orderProductImage}
                        />
                      ) : (
                        <View style={[styles.orderProductImage, styles.productImagePlaceholder]}>
                          <ShoppingBagIcon size={20} color="#ccc" />
                        </View>
                      )}
                      <View style={styles.orderProductInfo}>
                        <Text style={styles.orderProductName} numberOfLines={1}>
                          {firstItem?.product_name || firstItem?.product?.name || 'Product'}
                        </Text>
                        {order.order_items?.length > 1 && (
                          <Text style={styles.orderMoreItems}>+{order.order_items.length - 1} more items</Text>
                        )}
                        <Text style={styles.orderUser}>By: {orderUser?.full_name || orderUser?.email || 'Unknown'}</Text>
                        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.orderItemCount}>{order.order_items?.length || 0} items</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Analytics ({productAnalytics.length})</Text>
            {productAnalytics.length === 0 ? (
              <Text style={styles.emptyText}>No product data available</Text>
            ) : (
              productAnalytics.map((product, index) => (
                <View key={product.id} style={styles.productAnalyticsCard}>
                  <View style={styles.productRank}>
                    <Text style={styles.productRankText}>#{index + 1}</Text>
                  </View>
                  {product.image_url ? (
                    <Image
                      source={{ uri: product.image_url.startsWith('http') ? product.image_url : `${API_URL}${product.image_url}` }}
                      style={styles.productAnalyticsImage}
                    />
                  ) : (
                    <View style={[styles.productAnalyticsImage, styles.productImagePlaceholder]}>
                      <ShoppingBagIcon size={30} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.productAnalyticsInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.productStats}>
                      <View style={styles.productStat}>
                        <Text style={styles.productStatValue}>{product.total_quantity_sold || 0}</Text>
                        <Text style={styles.productStatLabel}>Sold</Text>
                      </View>
                      <View style={styles.productStat}>
                        <Text style={styles.productStatValue}>{product.unique_customers || 0}</Text>
                        <Text style={styles.productStatLabel}>Buyers</Text>
                      </View>
                      <View style={styles.productStat}>
                        <Text style={styles.productStatValue}>{product.total_orders || 0}</Text>
                        <Text style={styles.productStatLabel}>Orders</Text>
                      </View>
                    </View>
                    {product.top_customers?.length > 0 && (
                      <Text style={styles.topBuyerText}>
                        Top Buyer: {product.top_customers[0]?.full_name || product.top_customers[0]?.email}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Users & Loyalty Points ({users.length})</Text>
            {users.length === 0 ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              users.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name || 'No Name'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>{user.phone || 'No phone'}</Text>
                  </View>
                  <View style={styles.userPoints}>
                    <Text style={styles.pointsValue}>{user.points || 0}</Text>
                    <Text style={styles.pointsLabel}>Points</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={orderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedOrder?.order_items?.[0]?.product_name || selectedOrder?.order_items?.[0]?.product?.name || 'Order Details'}
              </Text>
              <TouchableOpacity onPress={() => setOrderModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>

                {/* Customer Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Customer</Text>
                  {(() => {
                    const orderUser = getOrderUser(selectedOrder.user_id);
                    return (
                      <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{orderUser?.full_name || 'Unknown'}</Text>
                        <Text style={styles.customerEmail}>{orderUser?.email}</Text>
                        <Text style={styles.customerPhone}>{orderUser?.phone || 'No phone'}</Text>
                        <Text style={styles.customerPoints}>Loyalty Points: {orderUser?.points || 0}</Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Delivery Address */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Delivery Address</Text>
                  <Text style={styles.addressText}>{selectedOrder.delivery_address || 'N/A'}</Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.delivery_city}, {selectedOrder.delivery_state} - {selectedOrder.delivery_pincode}
                  </Text>
                </View>

                {/* Order Items */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Items</Text>
                  {selectedOrder.order_items?.map((item, index) => (
                    <View key={index} style={styles.orderItemCard}>
                      {item.product?.image_path ? (
                        <Image
                          source={{ uri: item.product.image_path.startsWith('http') ? item.product.image_path : `${API_URL}${item.product.image_path}` }}
                          style={styles.orderItemImage}
                        />
                      ) : (
                        <View style={[styles.orderItemImage, styles.productImagePlaceholder]}>
                          <ShoppingBagIcon size={20} color="#ccc" />
                        </View>
                      )}
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.product_name || item.product?.name}</Text>
                        <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                        {item.size_ordered && <Text style={styles.orderItemSize}>Size: {item.size_ordered}</Text>}
                      </View>
                    </View>
                  ))}
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
  },
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2874f0',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#2874f0',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: (width - 32) / 2,
    backgroundColor: '#fff',
    padding: 16,
    margin: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2874f0',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fafafa',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderProductImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  orderProductInfo: {
    flex: 1,
  },
  orderProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  orderMoreItems: {
    fontSize: 12,
    color: '#2874f0',
    marginTop: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  orderUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2874f0',
  },
  orderItemCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  productSold: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  productAnalyticsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  productAnalyticsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productAnalyticsInfo: {
    flex: 1,
  },
  productStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  productStat: {
    marginRight: 20,
  },
  productStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2874f0',
  },
  productStatLabel: {
    fontSize: 10,
    color: '#666',
  },
  topBuyerText: {
    fontSize: 11,
    color: '#4caf50',
    marginTop: 6,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#2874f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  userPoints: {
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff9800',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  customerInfo: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  customerEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  customerPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff9800',
    marginTop: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  orderItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderItemSize: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
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
    color: '#212121',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2874f0',
  },
});
