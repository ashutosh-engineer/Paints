import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  BellIcon,
  TagIcon 
} from './ProfessionalIcons';

const { width } = Dimensions.get('window');

const ProfessionalBottomNavigation = ({ 
  navigation, 
  currentRoute, 
  cartCount = 0, 
  notificationCount = 0 
}) => {
  const insets = useSafeAreaInsets();
  
  const tabs = [
    {
      name: 'Dashboard',
      label: 'Home',
      icon: HomeIcon,
      route: 'Dashboard',
    },
    {
      name: 'Shop',
      label: 'Shop',
      icon: TagIcon,
      route: 'Shop',
    },
    {
      name: 'Cart',
      label: 'Cart',
      icon: ShoppingCartIcon,
      route: 'Cart',
      badge: cartCount,
    },
    {
      name: 'Notifications',
      label: 'Alerts',
      icon: BellIcon,
      route: 'Notifications',
      badge: notificationCount,
    },
    {
      name: 'Profile',
      label: 'Profile',
      icon: UserIcon,
      route: 'UserProfile',
    },
  ];

  const handleTabPress = (tab) => {
    if (currentRoute !== tab.route) {
      navigation.navigate(tab.route);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = currentRoute === tab.route;
          const IconComponent = tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                isActive && styles.tabActive,
                index === 0 && styles.tabFirst,
                index === tabs.length - 1 && styles.tabLast,
              ]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <IconComponent 
                    size={22} 
                    color={isActive ? Colors.white : Colors.textSecondary} 
                  />
                  {tab.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive
                ]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    // paddingBottom handled dynamically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  tabFirst: {
    marginLeft: 4,
  },
  tabLast: {
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    padding: 4,
  },
  iconContainerActive: {
    // Additional styling for active state if needed
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
});

export default ProfessionalBottomNavigation;