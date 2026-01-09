import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Image 
} from 'react-native';

export default function DocumentVerificationScreen({ navigation }) {
  const [verificationSteps, setVerificationSteps] = useState([
    {
      id: 1,
      title: 'Aadhar Card Verification',
      subtitle: 'Upload front and back of your Aadhar card',
      status: 'pending', // pending, completed, failed
      required: true
    },
    {
      id: 2,
      title: 'PAN Card Verification',
      subtitle: 'Upload your PAN card for identity verification',
      status: 'pending',
      required: true
    },
    {
      id: 3,
      title: 'Bank Account Verification',
      subtitle: 'Verify your bank account for secure transactions',
      status: 'pending',
      required: false
    }
  ]);

  const handleStepPress = (stepId) => {
    if (stepId === 1) {
      navigation.navigate('AadharVerification');
    } else if (stepId === 2) {
      navigation.navigate('PANVerification');
    } else if (stepId === 3) {
      navigation.navigate('BankVerification');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Dashboard');
  };

  const handleContinue = () => {
    const completedRequired = verificationSteps.filter(step => 
      step.required && step.status === 'completed'
    ).length;
    
    if (completedRequired >= 1) { // At least one required document
      navigation.navigate('Dashboard');
    } else {
      Alert.alert(
        'Verification Required',
        'Please complete at least one document verification to continue.'
      );
    }
  };

  const getStepIcon = (status) => {
    if (status === 'completed') {
      return '✓';
    } else if (status === 'failed') {
      return '✗';
    }
    return '';
  };

  const getStepIconStyle = (status) => {
    if (status === 'completed') {
      return [styles.stepIcon, styles.stepIconCompleted];
    } else if (status === 'failed') {
      return [styles.stepIcon, styles.stepIconFailed];
    }
    return [styles.stepIcon, styles.stepIconPending];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Verification</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Secure Your Account</Text>
          <Text style={styles.infoBannerText}>
            Complete document verification to unlock all features and enjoy a secure experience with Birla Opus ID.
          </Text>
        </View>

        {/* Verification Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Required Verifications</Text>
          
          {verificationSteps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepItem}
              onPress={() => handleStepPress(step.id)}
            >
              <View style={getStepIconStyle(step.status)}>
                <Text style={styles.stepIconText}>
                  {getStepIcon(step.status) || (index + 1)}
                </Text>
              </View>
              
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {step.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                
                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    step.status === 'completed' && styles.statusCompleted,
                    step.status === 'failed' && styles.statusFailed,
                    step.status === 'pending' && styles.statusPending
                  ]}>
                    {step.status === 'completed' ? 'Verified' : 
                     step.status === 'failed' ? 'Failed - Retry' : 
                     'Tap to start'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.stepArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits of Verification</Text>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>Enhanced account security</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎁</Text>
            <Text style={styles.benefitText}>Access to exclusive offers</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💳</Text>
            <Text style={styles.benefitText}>Faster payment processing</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📞</Text>
            <Text style={styles.benefitText}>Priority customer support</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip} style={styles.skipFooterButton}>
          <Text style={styles.skipFooterText}>I'll verify later</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoBanner: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoBannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepIconPending: {
    backgroundColor: '#E0E0E0',
  },
  stepIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepIconFailed: {
    backgroundColor: '#F44336',
  },
  stepIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusPending: {
    color: '#666666',
  },
  statusCompleted: {
    color: '#4CAF50',
  },
  statusFailed: {
    color: '#F44336',
  },
  stepArrow: {
    fontSize: 24,
    color: '#CCCCCC',
    marginLeft: 10,
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#F4C430',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  skipFooterButton: {
    alignSelf: 'center',
  },
  skipFooterText: {
    fontSize: 16,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});