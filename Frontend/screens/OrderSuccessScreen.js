import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Check Circle Icon Component
const CheckCircleIcon = ({ size = 80, color = '#00b300' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function OrderSuccessScreen({ route, navigation }) {
  const { orderData } = route.params || {};
  const orderId = orderData?.orderId || `ORD${Date.now().toString().slice(-8)}`;
  const deliveryAddress = orderData?.deliveryAddress || {};
  const items = orderData?.items || [];

  // Generate estimated delivery time (2-3 days from now)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation/Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successCircle}>
            <CheckCircleIcon size={80} color="#00b300" strokeWidth={2} />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been received and is being processed
          </Text>
        </View>

        {/* Order ID Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryDate}>{getDeliveryDate()}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressName}>{deliveryAddress.fullName}</Text>
            <Text style={styles.addressText}>
              {deliveryAddress.addressLine1}
              {deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}
            </Text>
            {deliveryAddress.landmark && (
              <Text style={styles.addressText}>Near {deliveryAddress.landmark}</Text>
            )}
            <Text style={styles.addressText}>
              {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </Text>
            <Text style={styles.addressPhone}>Mobile: {deliveryAddress.mobileNumber}</Text>
          </View>
        </View>

        {/* Order Items */}
        {items.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Order Items ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
            </Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemDot} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.selectedSize && (
                    <Text style={styles.itemMeta}>Size: {item.selectedSize}</Text>
                  )}
                  <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                  {item.customRequest && (
                    <Text style={styles.itemNote}>Note: {item.customRequest}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }}
        >
          <Text style={styles.continueButtonText}>CONTINUE SHOPPING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f7e6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00b300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2874f0',
    letterSpacing: 0.5,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00b300',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  addressContainer: {
    gap: 6,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#2874f0',
    fontWeight: '500',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2874f0',
    marginTop: 6,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bottomContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: '#00b300',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
