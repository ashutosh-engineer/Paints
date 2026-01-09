import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import FlipkartLoader from '../components/FlipkartLoader';
import ShopDetailsModal from '../components/ShopDetailsModal';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon, 
  GiftIcon, 
  TagIcon,
  SearchIcon,
  MenuIcon,
} from '../components/ProfessionalIcons';

const { width } = Dimensions.get('window');


export default function DashboardScreen({ navigation }) {
  const [blinkAnim] = useState(new Animated.Value(1));
  const [rewardsAvailable, setRewardsAvailable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        // Not authenticated, redirect to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      // Fetch user data
      await fetchUserData(token);
      // Fetch rewards and offers
      await fetchRewardsAndOffers(token);
      // Fetch user stats
      await fetchUserStats(token);
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        await AsyncStorage.setItem('user_data', JSON.stringify(data));
        
        // Check if shop details are not completed
        if (!data.shop_details_completed && !data.shop_name) {
          // Show shop details modal after a short delay
          setTimeout(() => {
            setShowShopModal(true);
          }, 500);
        }
      } else if (response.status === 401) {
        // Token expired, redirect to login
        await AsyncStorage.multiRemove(['access_token', 'user_data']);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRewardsAndOffers = async (token) => {
    try {
      // Fetch rewards
      const rewardsResponse = await fetch(`${API_URL}/api/rewards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewardsAvailable(rewardsData.available);
      }

      // Fetch admin-triggered offers
      const offersResponse = await fetch(`${API_URL}/api/offers`);

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        // Transform admin offers to display format
        const transformedOffers = offersData.map(offer => ({
          id: offer.id,
          title: offer.title,
          discount: `${offer.discount_percent}% OFF`,
          description: offer.description || '',
          validUntil: new Date(offer.valid_until).toLocaleDateString(),
        }));
        setOffers(transformedOffers);
      }
    } catch (error) {
      console.error('Error fetching rewards and offers:', error);
    }
  };

  const fetchUserStats = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Blinking animation for Rewards - only when available
  useEffect(() => {
    if (rewardsAvailable) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      blink.start();
      return () => blink.stop();
    }
  }, [rewardsAvailable]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <FlipkartLoader size={60} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Shop Details Modal */}
      <ShopDetailsModal
        visible={showShopModal}
        onClose={() => setShowShopModal(false)}
        onSuccess={() => {
          // Refresh user data after successful submission
          const refreshData = async () => {
            const token = await AsyncStorage.getItem('access_token');
            if (token) await fetchUserData(token);
          };
          refreshData();
        }}
      />

      {/* Flipkart Style Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>Kubti Hardware</Text>
            <Text style={styles.brandTagline}>Premium Paint Solutions</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('UserProfile')}
            >
              <UserIcon size={22} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero/Promotional Card */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>We are Kubti Hardware</Text>
              <Text style={styles.heroSubtitle}>Explore Colour+</Text>
              <Text style={styles.heroDescription}>
                Discover 2300+ premium paint colors and professional solutions for all your projects
              </Text>
              <TouchableOpacity 
                style={styles.heroButton}
                onPress={() => navigation.navigate('Shop', { selectedSeries: 'All-wood Series' })}
                activeOpacity={0.9}
              >
                <Text style={styles.heroButtonText}>EXPLORE PRODUCTS</Text>
                <ArrowRightIcon size={18} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.heroDecoration}>
              <View style={[styles.colorDot, { backgroundColor: '#ff6b6b' }]} />
              <View style={[styles.colorDot, { backgroundColor: '#4ecdc4' }]} />
              <View style={[styles.colorDot, { backgroundColor: '#ffe66d' }]} />
              <View style={[styles.colorDot, { backgroundColor: '#95e1d3' }]} />
            </View>
          </View>
        </View>

        {/* Active Offers Section */}
        {offers.length > 0 && (
          <View style={styles.offersSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TagIcon size={20} color="#ff9800" strokeWidth={2} />
                <Text style={styles.sectionTitleMain}>Active Offers</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScrollContent}
            >
              {offers.map((offer, index) => (
                <TouchableOpacity
                  key={`offer-${offer.id}-${index}`}
                  style={styles.offerCard}
                  activeOpacity={0.9}
                >
                  {/* Discount Badge */}
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>

                  {/* Offer Icon */}
                  <View style={styles.offerImagePlaceholder}>
                    <TagIcon size={40} color="#ff6b35" strokeWidth={2} />
                  </View>

                  {/* Offer Info */}
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle} numberOfLines={2}>
                      {offer.title}
                    </Text>
                    {offer.description ? (
                      <Text style={styles.offerDescription} numberOfLines={2}>
                        {offer.description}
                      </Text>
                    ) : null}
                    <Text style={styles.validUntilText}>Valid until {offer.validUntil}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* No Offers Placeholder */}
        {offers.length === 0 && (
          <View style={styles.noOffersSection}>
            <Text style={styles.sectionTitleMain}>Active Offers</Text>
            <View style={styles.noOffersCard}>
              <TagIcon size={60} color="#d0d0d0" strokeWidth={1.5} />
              <Text style={styles.noOffersTitle}>No Active Offers</Text>
              <Text style={styles.noOffersText}>Check back soon for exciting deals!</Text>
            </View>
          </View>
        )}

        {/* Bottom spacing for Android navigation buttons */}
        <View style={{ height: 100 }} />
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
    backgroundColor: '#f1f3f6',
  },
  // Header - Flipkart Style
  header: {
    backgroundColor: '#2874f0',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandSection: {
    flex: 1,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.85,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff9800',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff9800',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Content
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  // Offers Section
  offersSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleMain: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2874f0',
  },
  offersScrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  offerCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  offerImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#fafafa',
  },
  offerImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerInfo: {
    padding: 12,
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  originalPrice: {
    fontSize: 13,
    color: '#878787',
    textDecorationLine: 'line-through',
  },
  offerDescription: {
    fontSize: 11,
    color: '#878787',
    marginBottom: 6,
    lineHeight: 16,
  },
  validUntilText: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '600',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#388e3c',
  },
  // No Offers Section
  noOffersSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
  },
  noOffersCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOffersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  noOffersText: {
    fontSize: 14,
    color: '#878787',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2874f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  exploreButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // Hero/Promotional Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2874f0',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#878787',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2874f0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 8,
    shadowColor: '#2874f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    height: 120,
    opacity: 0.15,
    transform: [{ rotate: '15deg' }],
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  // Points Section
  pointsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pointsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#878787',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff9800',
    marginBottom: 4,
  },
  pointsHint: {
    fontSize: 11,
    color: '#878787',
    fontStyle: 'italic',
  },
  // Stats Section
  statsSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2874f0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#878787',
    textAlign: 'center',
  },
});
