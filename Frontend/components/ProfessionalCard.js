import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

export const ProfessionalCard = ({
  children,
  variant = 'default',
  padding = 'medium',
  shadow = 'medium',
  style = {},
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [
      styles.card,
      styles[`card_${variant}`],
      styles[`padding_${padding}`],
      styles[`shadow_${shadow}`]
    ];
    
    return [...baseStyle, style];
  };

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  // Variants
  card_default: {
    backgroundColor: Colors.cardBg,
  },
  
  card_elevated: {
    backgroundColor: Colors.white,
    borderWidth: 0,
  },
  
  card_outlined: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  
  card_primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  
  card_secondary: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondaryDark,
  },
  
  // Padding variants
  padding_none: {
    padding: 0,
  },
  
  padding_small: {
    padding: 12,
  },
  
  padding_medium: {
    padding: 16,
  },
  
  padding_large: {
    padding: 24,
  },
  
  // Shadow variants
  shadow_none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  
  shadow_small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  shadow_medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  shadow_large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default ProfessionalCard;