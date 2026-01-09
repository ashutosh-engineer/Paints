import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/theme';
import { ShoppingBagIcon } from './ProfessionalIcons';

const ProfessionalLoadingScreen = ({ 
  message = 'Loading...', 
  submessage = null,
  showLogo = true,
  backgroundColor = Colors.white 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loading indicator
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => rotateAnimation.stop();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {showLogo && (
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoIconContainer,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <ShoppingBagIcon size={48} color={Colors.primary} strokeWidth={2} />
            </Animated.View>
            <Text style={styles.logoText}>Kubti Hardware & Paints</Text>
            <Text style={styles.logoSubtext}>Professional Paint Solutions</Text>
          </View>
        )}

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator 
              size="large" 
              color={Colors.primary}
              style={styles.loadingIndicator}
            />
            <View style={styles.loadingRing} />
          </View>
          
          <Text style={styles.loadingMessage}>{message}</Text>
          {submessage && (
            <Text style={styles.loadingSubmessage}>{submessage}</Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  transform: [
                    {
                      translateX: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-200, 200],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  logoSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingIndicatorContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingIndicator: {
    // Default ActivityIndicator styling
  },
  loadingRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: `${Colors.primary}20`,
    borderTopColor: Colors.primary,
  },
  loadingMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubmessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: 100,
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default ProfessionalLoadingScreen;