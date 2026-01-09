import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BirlaOpusLogo } from '../components/LogoComponents';

export default function OTPScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRequestOTP = () => {
    if (phoneNumber.length === 10 && agreedToTerms) {
      // Navigate to OTP Verification screen
      navigation.navigate('OTPVerification', { phoneNumber });
    } else {
      alert('Please enter a valid 10-digit phone number and agree to terms.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <BirlaOpusLogo size={120} layout="horizontal" />
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Enter Phone Number</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Your 10-digit number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            By continuing, I agree to the{' '}
            <Text style={styles.link}>Terms & Conditions</Text> and the{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Request OTP Button */}
        <TouchableOpacity 
          style={[styles.button, (!phoneNumber || phoneNumber.length !== 10 || !agreedToTerms) && styles.buttonDisabled]}
          onPress={handleRequestOTP}
          disabled={!phoneNumber || phoneNumber.length !== 10 || !agreedToTerms}
        >
          <Text style={styles.buttonText}>Request OTP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    paddingTop: 100,
    paddingBottom: 60,
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00A878',
    borderColor: '#00A878',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  link: {
    color: '#5B4E9D',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#F4C430',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});
