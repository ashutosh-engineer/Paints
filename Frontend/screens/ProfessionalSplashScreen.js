import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/theme';
import { ShoppingBagIcon } from '../components/ProfessionalIcons';

const { width, height } = Dimensions.get('window');

const ProfessionalSplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // Initial fade in and scale
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
      ]),
      
      // Slide up text
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // Rotate icon
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Hold for a moment
      Animated.delay(1000),
      
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <ShoppingBagIcon size={80} color={Colors.white} strokeWidth={2} />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.textContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.brandName}>Kubti Hardware</Text>
            <Text style={styles.brandTagline}>& Paints</Text>
            <View style={styles.divider} />
            <Text style={styles.brandSubtitle}>Professional Paint Solutions</Text>
          </Animated.View>
        </View>

        {/* Loading Section */}
        <View style={styles.loadingSection}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View 
                style={[
                  styles.loadingProgress,
                  {
                    transform: [
                      {
                        translateX: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-width, width * 0.6],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Professional Technology</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.patternDot,
              {
                left: (i % 5) * (width / 4),
                top: Math.floor(i / 5) * (height / 4),
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1],
                }),
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.secondary,
    letterSpacing: 0.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginBottom: 20,
  },
  brandSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingBar: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    width: width * 0.3,
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
    marginBottom: 4,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.5,
    fontWeight: '400',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
});

export default ProfessionalSplashScreen;