import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Kubti Hardware logo component - New SVG Version
export const KubtiFlowerLogo = ({ size = 120 }) => {
  return (
    <Image 
      source={require('../assets/Kubti_new.svg')} 
      style={{ width: size * 1.2, height: size * 1.2 }}
      resizeMode="contain"
    />
  );
};

// Kubti Hardware logo component - Text-based fallback (if SVG fails)
export const KubtiFlowerLogoFallback = ({ size = 100 }) => {
  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}>
      <View style={styles.textLogoContainer}>
        <Text style={[styles.kubtiText, { fontSize: size * 0.2 }]}>KUBTI</Text>
        <Text style={[styles.hardwareText, { fontSize: size * 0.15 }]}>Hardware</Text>
        <Text style={[styles.paintsText, { fontSize: size * 0.1 }]}>& PAINTS</Text>
        {/* Colorful dots representing the flower logo */}
        <View style={styles.flowerDots}>
          <View style={[styles.dot, { backgroundColor: '#8B5A9F', width: size * 0.08, height: size * 0.08 }]} />
          <View style={[styles.dot, { backgroundColor: '#E91E63', width: size * 0.08, height: size * 0.08 }]} />
          <View style={[styles.dot, { backgroundColor: '#F44336', width: size * 0.08, height: size * 0.08 }]} />
          <View style={[styles.dot, { backgroundColor: '#FF9800', width: size * 0.08, height: size * 0.08 }]} />
          <View style={[styles.dot, { backgroundColor: '#4CAF50', width: size * 0.08, height: size * 0.08 }]} />
        </View>
      </View>
    </View>
  );
};

// Combined Birla Opus + Kubti Hardware logo component with partition
export const BirlaOpusLogo = ({ size = 140, layout = 'vertical' }) => {
  if (layout === 'horizontal') {
    return (
      <View style={styles.horizontalLogoContainer}>
        {/* Birla Opus Logo - Left side, bigger */}
        <Image 
          source={require('../assets/birlaopus Logo.png')} 
          style={{ width: size * 1.3, height: size * 0.8 }}
          resizeMode="contain"
        />
        
        {/* Vertical Partition Line */}
        <View style={styles.verticalPartitionLine} />
        
        {/* Kubti Hardware Logo - Right side */}
        <Image 
          source={require('../assets/Kubti_new.svg')} 
          style={{ width: size * 1.1, height: size * 0.9 }}
          resizeMode="contain"
        />
      </View>
    );
  }
  
  // Default vertical layout
  return (
    <View style={styles.combinedLogoContainer}>
      {/* Birla Opus Logo - Top, bigger */}
      <Image 
        source={require('../assets/birlaopus Logo.png')} 
        style={{ width: size * 1.4, height: size * 0.9 }}
        resizeMode="contain"
      />
      
      {/* Horizontal Partition Line */}
      <View style={styles.partitionLine} />
      
      {/* Kubti Hardware Logo - Bottom */}
      <Image 
        source={require('../assets/Kubti_new.svg')} 
        style={{ width: size * 1.2, height: size * 0.8 }}
        resizeMode="contain"
      />
    </View>
  );
};

// Individual Birla Opus logo component - Bigger PNG Version
export const BirlaOpusLogoSingle = ({ size = 140 }) => {
  return (
    <Image 
      source={require('../assets/birlaopus Logo.png')} 
      style={{ width: size * 1.3, height: size * 0.8 }}
      resizeMode="contain"
    />
  );
};

// Aditya Birla Group logo component - JPG Image Version (Bigger)
export const AdityaBirlaLogo = ({ size = 140 }) => {
  return (
    <Image 
      source={require('../assets/Aditya-Birla-Group-Logo-Vector-2048x2048.jpg')} 
      style={{ width: size * 1.2, height: size * 0.5 }}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  // Combined Logo Styles
  combinedLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  horizontalLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  partitionLine: {
    width: 200,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  verticalPartitionLine: {
    width: 2,
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  
  // Kubti Hardware Logo Styles
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLogoContainer: {
    alignItems: 'center',
  },
  kubtiText: {
    fontWeight: 'bold',
    color: '#7B68EE',
    letterSpacing: 1,
  },
  hardwareText: {
    fontWeight: '600',
    color: '#7B68EE',
    marginTop: -5,
  },
  paintsText: {
    fontWeight: 'bold',
    color: '#DC143C',
    fontStyle: 'italic',
    marginTop: 2,
  },
  flowerDots: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 2,
  },
  
  // Birla Opus Logo Styles
  birlaLogoContainer: {
    alignItems: 'center',
  },
  birlaLogoText: {
    fontWeight: '600',
    letterSpacing: 2,
    color: '#000000',
  },
  birlaLogoSubtext: {
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#000000',
    marginTop: -5,
  },
  birlaDotsContainer: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
    justifyContent: 'center',
  },
  birlaDot: {
    borderRadius: 50,
    marginHorizontal: 3,
  },
  birlaIdText: {
    fontWeight: 'bold',
    color: '#000000',
    marginTop: -5,
  },

  // Aditya Birla Group Logo Styles
  adityaBirlaContainer: {
    alignItems: 'center',
  },
  geometricPattern: {
    width: 140,
    height: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  geometricSection: {
    width: '50%',
    height: '50%',
  },
  adityaBirlaText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});