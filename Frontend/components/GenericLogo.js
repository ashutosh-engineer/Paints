import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Generic Logo Component - Easy to swap logos
export const GenericLogo = ({ 
  type = 'text', // 'text', 'image', 'icon', 'svg'
  source = null, // for images
  SvgComponent = null, // for custom SVG components
  text = 'LOGO', 
  size = 100,
  color = '#000000',
  backgroundColor = 'transparent'
}) => {
  
  if (type === 'image' && source) {
    return (
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image 
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (type === 'svg' && SvgComponent) {
    return <SvgComponent width={size} height={size} />;
  }

  if (type === 'icon') {
    return (
      <View style={[
        styles.iconContainer, 
        { 
          width: size, 
          height: size, 
          backgroundColor: backgroundColor,
          borderRadius: size / 2 
        }
      ]}>
        <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>
          {text}
        </Text>
      </View>
    );
  }

  // Default text logo
  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}>
      <Text style={[styles.textLogo, { fontSize: size * 0.2, color }]}>
        {text}
      </Text>
    </View>
  );
};

// Easy-to-use preset logos - Updated to use PNG Image
export const KubtiLogo = ({ size = 100 }) => (
  <GenericLogo 
    type="image" 
    source={require('../assets/kubti.png')} 
    size={size} 
  />
);

export const BirlaLogo = ({ size = 100 }) => (
  <GenericLogo 
    type="image" 
    source={require('../assets/birlaopus Logo.png')} 
    size={size} 
  />
);

export const PlaceholderLogo = ({ size = 100, text = "LOGO" }) => (
  <GenericLogo 
    type="icon" 
    text={text} 
    size={size} 
    color="#FFFFFF" 
    backgroundColor="#CCCCCC" 
  />
);

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  textLogo: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconText: {
    fontWeight: 'bold',
  },
});

// INSTRUCTIONS FOR ADDING YOUR OWN LOGOS:

/*
## Option 1: Add PNG/JPG Images

1. Put your logo files in the assets folder:
   - assets/kubti-logo.png
   - assets/birla-logo.png

2. Use like this:
   <GenericLogo 
     type="image" 
     source={require('../assets/kubti-logo.png')} 
     size={120} 
   />

## Option 2: Use Online Images (requires internet)

   <GenericLogo 
     type="image" 
     source={{ uri: 'https://your-website.com/logo.png' }} 
     size={120} 
   />

## Option 3: Convert SVG to PNG

1. Use an online SVG to PNG converter
2. Save the PNG to assets/
3. Use as shown in Option 1

## Option 4: Use Text Logos (current approach)

   <GenericLogo 
     type="text" 
     text="YOUR COMPANY" 
     size={120} 
     color="#FF6600" 
   />

## Option 5: Use Emoji/Unicode as Icons

   <GenericLogo 
     type="text" 
     text="🏢" 
     size={120} 
   />

## Option 6: Use PNG Image

   <GenericLogo 
     type="image" 
     source={require('../assets/kubti.png')} 
     size={120} 
   />
*/

// Direct PNG image component access (alternative usage)
export const KubtiPNGDirect = ({ size = 100 }) => (
  <Image 
    source={require('../assets/kubti.png')} 
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);