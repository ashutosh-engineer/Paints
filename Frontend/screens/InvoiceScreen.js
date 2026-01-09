import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { Colors } from '../constants/theme';
import { ArrowLeftIcon } from '../components/ProfessionalIcons';

export default function InvoiceScreen({ route, navigation }) {
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
      } else {
        Alert.alert('Error', 'Failed to load invoice');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={Colors.accent} strokeWidth={2.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.invoiceContainer}>
          {/* Company Header */}
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>BIRLA OPUS</Text>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
          </View>

          {/* Invoice Number & Date */}
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.infoLabel}>Invoice No:</Text>
              <Text style={styles.infoValue}>INV-{String(order.id).padStart(6, '0')}</Text>
            </View>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>#{order.id}</Text>
            </View>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Bill To / Ship To:</Text>
            <Text style={styles.addressName}>{order.delivery_name}</Text>
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

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Total</Text>
            </View>

            {order.order_items?.map((item, index) => (
              <View key={index}>
                <View style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                    {item.discount_percent > 0 && (
                      <View style={styles.discountInfo}>
                        <Text style={styles.originalPrice}>₹{item.original_price.toFixed(2)}</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>{item.discount_percent}% OFF</Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.tableText, { flex: 1, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                {index < order.order_items.length - 1 && <View style={styles.tableDivider} />}
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal (Original Price):</Text>
              <Text style={styles.summaryValue}>₹{order.original_amount.toFixed(2)}</Text>
            </View>
            
            {order.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>
                  Discount Savings:
                </Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₹{order.discount_amount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.totalDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{order.total_amount.toFixed(2)}</Text>
            </View>

            {order.discount_amount > 0 && (
              <View style={styles.savingsHighlight}>
                <View style={styles.savingsIconBox}>
                  <Text style={styles.savingsIconText}>✓</Text>
                </View>
                <Text style={styles.savingsText}>
                  You saved ₹{order.discount_amount.toFixed(2)} on this order
                </Text>
              </View>
            )}
          </View>

          {/* Payment Info */}
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>{order.payment_method.toUpperCase()}</Text>
            {order.payment_method === 'online' && (
              <Text style={styles.paymentNote}>Payment Status: Completed</Text>
            )}
            {order.payment_method === 'cod' && (
              <Text style={styles.paymentNote}>Cash on Delivery</Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for shopping with Birla Opus!</Text>
            <Text style={styles.footerNote}>
              This is a computer-generated invoice and does not require a signature.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Download Invoice', 'PDF download functionality will be available soon.')}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>↓</Text>
          </View>
          <Text style={styles.actionButtonText}>Download PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('Share Invoice', 'Invoice sharing functionality will be available soon.')}
        >
          <View style={[styles.actionIconContainer, styles.secondaryIconContainer]}>
            <Text style={[styles.actionIcon, styles.secondaryIcon]}>⤴</Text>
          </View>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    backgroundColor: '#f8f9fa',
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.primary,
  },
  backButton: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  invoiceContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  companyHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 5,
    letterSpacing: 1,
  },
  invoiceInfo: {
    marginBottom: 20,
  },
  invoiceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  addressSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4C430',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  tableText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
    color: '#28a745',
    fontWeight: '600',
  },
  discountValue: {
    color: '#28a745',
    fontWeight: '700',
  },
  totalDivider: {
    height: 2,
    backgroundColor: '#1a1a1a',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  savingsHighlight: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  savingsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savingsIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  savingsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
  },
  paymentInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  paymentNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4C430',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  secondaryIconContainer: {
    backgroundColor: '#1a1a1a',
  },
  secondaryIcon: {
    color: '#F4C430',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4C430',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
});
