import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AdityaBirlaLogo } from '../components/LogoComponents';
import { GenericLogo, PlaceholderLogo, KubtiLogo } from '../components/GenericLogo';

export default function OTPVerificationScreen({ navigation, route }) {
  const { phoneNumber } = route.params || { phoneNumber: '' };
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        setCanResend(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      // Focus next input (would need refs in real implementation)
    }
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    // Made OTP optional - any input (even empty) can proceed for demo purposes
    if (otpCode.length > 0) {
      // Accept any OTP input for demo
      Alert.alert('Success', 'OTP Verified Successfully!', [
        { text: 'Continue', onPress: () => navigation.navigate('ProfileSetup') }
      ]);
    } else {
      // Even empty OTP can proceed, but with a different message
      Alert.alert('Demo Mode', 'Proceeding without OTP for demo purposes', [
        { text: 'Continue', onPress: () => navigation.navigate('ProfileSetup') }
      ]);
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('OTP Sent', 'New OTP has been sent to your phone number');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo - You can easily change this */}
      <View style={styles.logoContainer}>
        {/* Option 1: Use placeholder logo */}
        <PlaceholderLogo size={120} text="KB" />
        
        {/* Option 2: Use text logo */}
        {/* <KubtiLogo size={120} /> */}
        
        {/* Option 3: Use original component */}
        {/* <AdityaBirlaLogo /> */}
        
        {/* Option 4: Add your own image logo */}
        {/* <GenericLogo 
          type="image" 
          source={require('../assets/your-logo.png')} 
          size={120} 
        /> */}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit OTP to{'\n'}
          <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timerText}>
          {canResend ? 'Didn\'t receive OTP?' : `Resend OTP in ${timer}s`}
        </Text>

        {/* Resend Button */}
        {canResend && (
          <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
            <Text style={styles.resendButtonText}>Resend OTP</Text>
          </TouchableOpacity>
        )}

        {/* Verify Button - Always enabled for demo */}
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerifyOtp}
        >
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        </TouchableOpacity>

        {/* Skip OTP for Demo */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProfileSetup')}
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>Skip OTP (Demo Mode)</Text>
        </TouchableOpacity>

        {/* Change Number */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.changeNumberButton}
        >
          <Text style={styles.changeNumberText}>Change Phone Number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    lineHeight: 22,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#000000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    backgroundColor: '#F8F8F8',
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#5B4E9D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    backgroundColor: '#F4C430',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#5B4E9D',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#5B4E9D',
    fontWeight: '600',
  },
  changeNumberButton: {
    alignSelf: 'center',
  },
  changeNumberText: {
    fontSize: 16,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});