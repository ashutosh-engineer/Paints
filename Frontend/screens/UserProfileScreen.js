import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import FlipkartLoader from '../components/FlipkartLoader';
import { 
  UserIcon, 
  LogoutIcon, 
  ShoppingCartIcon, 
  GiftIcon, 
  TagIcon,
  HomeIcon,
  BellIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EditIcon,
  LocationIcon
} from '../components/ProfessionalIcons';

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      // Load user profile
      const profileResponse = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
      }

      // Load user stats
      const statsResponse = await fetch(`${API_URL}/api/user/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load all orders
      const ordersResponse = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setTotalOrdersCount(ordersData.length); // Store total count
        setOrders(ordersData.slice(0, 5)); // Show only last 5 orders
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('user_data');
            navigation.replace('Login');
          },
        },
      ]
    );
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
      <StatusBar backgroundColor="#2874f0" barStyle="light-content" />
      
      {/* Flipkart Style Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Profile</Text>
        
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={handleLogout}
        >
          <LogoutIcon size={22} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2874f0']} />
        }
      >
        {/* User Info Card - Flipkart Style */}
        <View style={styles.userInfoCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <UserIcon size={32} color="#2874f0" strokeWidth={2} />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.phone && <Text style={styles.userPhone}>{user?.phone}</Text>}
            </View>
            <TouchableOpacity style={styles.editButton}>
              <EditIcon size={20} color="#2874f0" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards - Flipkart Grid Style */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.statBox}
              onPress={() => navigation.navigate('Orders')}
            >
              <ShoppingCartIcon size={28} color="#2874f0" strokeWidth={2} />
              <Text style={styles.statValue}>{totalOrdersCount || 0}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statBox}>
              <GiftIcon size={28} color="#ff9800" strokeWidth={2} />
              <Text style={styles.statValue}>{stats?.reward_points || 0}</Text>
              <Text style={styles.statLabel}>Loyalty Points</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBox}>
              <TagIcon size={28} color="#ff9800" strokeWidth={2} />
              <Text style={styles.statValue}>{stats?.total_items_purchased || 0}</Text>
              <Text style={styles.statLabel}>Items Bought</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings - Flipkart Style */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('ProfileSetup')}
          >
            <View style={styles.settingLeft}>
              <UserIcon size={20} color="#212121" strokeWidth={2} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <ArrowRightIcon size={18} color="#878787" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.settingLeft}>
              <ShoppingCartIcon size={20} color="#212121" strokeWidth={2} />
              <Text style={styles.settingText}>My Orders</Text>
            </View>
            <ArrowRightIcon size={18} color="#878787" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ORDERS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <ShoppingCartIcon size={60} color="#d3d3d3" strokeWidth={1.5} />
              <Text style={styles.emptyOrdersText}>No orders yet</Text>
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => navigation.navigate('Shop')}
              >
                <Text style={styles.shopNowButtonText}>START SHOPPING</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order, orderIndex) => (
              <TouchableOpacity
                key={`profile-order-${order.id}-${orderIndex}`}
                style={styles.orderItem}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>Order #{order.id}</Text>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderItems}>{order.order_items?.length || 0} item(s)</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

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
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // User Info Card
  userInfoCard: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#878787',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#878787',
  },
  editButton: {
    padding: 8,
  },
  // Points Highlight Card
  pointsHighlightCard: {
    backgroundColor: '#fff3e0',
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsHighlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointsIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e65100',
    marginBottom: 4,
  },
  pointsSubtitle: {
    fontSize: 12,
    color: '#ef6c00',
    fontStyle: 'italic',
  },
  pointsValueContainer: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  pointsValueLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ff9800',
  },
  pointsUnitText: {
    fontSize: 11,
    color: '#ef6c00',
    fontWeight: '600',
    marginTop: -2,
  },
  // Stats Container
  statsContainer: {
    backgroundColor: '#ffffff',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#878787',
  },
  // Savings Card
  savingsCard: {
    backgroundColor: '#388e3c',
    marginHorizontal: 8,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savingsContent: {
    flex: 1,
  },
  savingsLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  savingsPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Settings Section
  settingsSection: {
    backgroundColor: '#ffffff',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#878787',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#212121',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 48,
  },
  // Orders Section
  ordersSection: {
    backgroundColor: '#ffffff',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2874f0',
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#878787',
    marginTop: 16,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 2,
  },
  shopNowButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  orderItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 12,
    color: '#878787',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderItems: {
    fontSize: 13,
    color: '#878787',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
});
