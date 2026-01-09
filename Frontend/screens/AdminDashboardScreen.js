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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import FlipkartLoader from '../components/FlipkartLoader';
import { LogoutIcon, ShoppingBagIcon, LockIcon } from '../components/ProfessionalIcons';

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
  
  // Create Admin Modal State
  const [createAdminModalVisible, setCreateAdminModalVisible] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Change Password Modal State
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      };
      
      // Add timestamp to bust cache
      const timestamp = Date.now();

      const [statsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats?_t=${timestamp}`, { headers }),
        fetch(`${API_URL}/api/admin/orders?_t=${timestamp}`, { headers }),
        fetch(`${API_URL}/api/admin/users?limit=100&_t=${timestamp}`, { headers }),
        fetch(`${API_URL}/api/admin/products/analytics?_t=${timestamp}`, { headers }),
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

  // Create Admin Function
  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newAdminPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          full_name: newAdminName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Admin "${newAdminName}" created successfully!`);
        setCreateAdminModalVisible(false);
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminName('');
        // Small delay to ensure backend has committed, then refresh
        setTimeout(async () => {
          await loadAllData();
        }, 300);
      } else {
        Alert.alert('Error', data.detail || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Change Password Function
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        setChangePasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Alert.alert('Error', data.detail || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setChangingPassword(false);
    }
  };

  // Update Order Status Function
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Order status updated to ${newStatus}`);
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        Alert.alert('Error', data.detail || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'processing': return '#9c27b0';
      case 'shipped': return '#00bcd4';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  // Delete User Function
  const handleDeleteUser = async (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.full_name || user.email}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Success', data.message || 'User deleted successfully');
                // Small delay to ensure backend has committed, then refresh
                setTimeout(async () => {
                  await loadAllData();
                }, 300);
              } else {
                Alert.alert('Error', data.detail || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Delete user error:', error);
              Alert.alert('Error', 'Failed to connect to server');
            }
          },
        },
      ]
    );
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
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setChangePasswordModalVisible(true)}>
            <LockIcon size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogoutIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
              <View style={[styles.statCard, { borderLeftColor: '#4caf50' }]}>
                <Text style={styles.statValue}>{stats?.total_products || 0}</Text>
                <Text style={styles.statLabel}>Total Products</Text>
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
                const productImage = firstItem?.product_image;
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
                      <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.orderStatusText}>{getStatusLabel(order.status)}</Text>
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
                    <Text style={styles.productSold}>{product.total_orders || 0} orders</Text>
                  </View>
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
                const productImage = firstItem?.product_image;
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
                      <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.orderStatusText}>{getStatusLabel(order.status)}</Text>
                      </View>
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
                    <Text style={styles.productOrderCount}>{product.total_orders || 0} Orders</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Users & Loyalty Points ({users.length})</Text>
              <TouchableOpacity 
                style={styles.createAdminBtn}
                onPress={() => setCreateAdminModalVisible(true)}
              >
                <Text style={styles.createAdminBtnText}>+ Add Admin</Text>
              </TouchableOpacity>
            </View>
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
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.full_name || 'No Name'}</Text>
                      {user.is_admin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>{user.phone || 'No phone'}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <View style={styles.userPoints}>
                      <Text style={styles.pointsValue}>{user.points || 0}</Text>
                      <Text style={styles.pointsLabel}>Points</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteUserBtn}
                      onPress={() => handleDeleteUser(user)}
                    >
                      <Text style={styles.deleteUserBtnText}>Delete</Text>
                    </TouchableOpacity>
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

                {/* Order Status */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Status</Text>
                  <View style={styles.currentStatusRow}>
                    <Text style={styles.currentStatusLabel}>Current Status:</Text>
                    <View style={[styles.currentStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                      <Text style={styles.currentStatusText}>{getStatusLabel(selectedOrder.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.changeStatusLabel}>Change Status:</Text>
                  <View style={styles.statusButtonsContainer}>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          { backgroundColor: getStatusColor(status) },
                          selectedOrder.status === status && styles.statusButtonActive
                        ]}
                        onPress={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                      >
                        <Text style={styles.statusButtonText}>{getStatusLabel(status)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Items</Text>
                  {selectedOrder.order_items?.map((item, index) => (
                    <View key={index} style={styles.orderItemCard}>
                      {item.product_image ? (
                        <Image
                          source={{ uri: item.product_image.startsWith('http') ? item.product_image : `${API_URL}${item.product_image}` }}
                          style={styles.orderItemImage}
                        />
                      ) : (
                        <View style={[styles.orderItemImage, styles.productImagePlaceholder]}>
                          <ShoppingBagIcon size={20} color="#ccc" />
                        </View>
                      )}
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.product_name}</Text>
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

      {/* Create Admin Modal */}
      <Modal
        visible={createAdminModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCreateAdminModalVisible(false)}
      >
        <View style={styles.centeredModalOverlay}>
          <View style={styles.centeredModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Admin</Text>
              <TouchableOpacity onPress={() => setCreateAdminModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.createAdminForm}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter admin name"
                value={newAdminName}
                onChangeText={setNewAdminName}
                editable={!creatingAdmin}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter admin email"
                value={newAdminEmail}
                onChangeText={setNewAdminEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!creatingAdmin}
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter password (min 6 characters)"
                value={newAdminPassword}
                onChangeText={setNewAdminPassword}
                secureTextEntry
                editable={!creatingAdmin}
              />

              <TouchableOpacity
                style={[styles.createAdminSubmitBtn, creatingAdmin && styles.disabledBtn]}
                onPress={handleCreateAdmin}
                disabled={creatingAdmin}
              >
                {creatingAdmin ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createAdminSubmitBtnText}>Create Admin</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.centeredModalOverlay}>
          <View style={styles.centeredModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setChangePasswordModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.createAdminForm}>
              <Text style={styles.inputLabel}>Current Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                editable={!changingPassword}
              />

              <Text style={styles.inputLabel}>New Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!changingPassword}
              />

              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                editable={!changingPassword}
              />

              <TouchableOpacity
                style={[styles.createAdminSubmitBtn, changingPassword && styles.disabledBtn]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createAdminSubmitBtnText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  orderStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  productOrderCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2874f0',
    marginTop: 4,
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
  currentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  currentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  changeStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusButtonActive: {
    opacity: 0.5,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  // Create Admin Button Styles
  createAdminBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createAdminBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Admin Badge
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    backgroundColor: '#2874f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  // User Actions
  userActions: {
    alignItems: 'flex-end',
  },
  deleteUserBtn: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  deleteUserBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Centered Modal Overlay
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  // Create Admin Modal (legacy)
  createAdminModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  createAdminForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  createAdminSubmitBtn: {
    backgroundColor: '#2874f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createAdminSubmitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
