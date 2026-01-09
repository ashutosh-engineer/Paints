import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/theme';

export const ProfessionalButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  style = {},
  textStyle = {},
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    
    if (disabled) {
      baseStyle.push(styles.button_disabled);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`buttonText_${variant}`], styles[`buttonText_${size}`]];
    
    if (disabled) {
      baseStyle.push(styles.buttonText_disabled);
    }
    
    return [...baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? Colors.primary : Colors.white} 
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Variants
  button_primary: {
    backgroundColor: Colors.primary,
  },
  
  button_secondary: {
    backgroundColor: Colors.secondary,
  },
  
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  button_ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  button_success: {
    backgroundColor: Colors.success,
  },
  
  button_danger: {
    backgroundColor: Colors.danger,
  },
  
  // Sizes
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  
  // Disabled state
  button_disabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Button content
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    marginRight: 8,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text variants
  buttonText_primary: {
    color: Colors.white,
    fontSize: 16,
  },
  
  buttonText_secondary: {
    color: Colors.white,
    fontSize: 16,
  },
  
  buttonText_outline: {
    color: Colors.primary,
    fontSize: 16,
  },
  
  buttonText_ghost: {
    color: Colors.primary,
    fontSize: 16,
  },
  
  buttonText_success: {
    color: Colors.white,
    fontSize: 16,
  },
  
  buttonText_danger: {
    color: Colors.white,
    fontSize: 16,
  },
  
  // Text sizes
  buttonText_small: {
    fontSize: 14,
  },
  
  buttonText_medium: {
    fontSize: 16,
  },
  
  buttonText_large: {
    fontSize: 18,
  },
  
  // Disabled text
  buttonText_disabled: {
    color: Colors.textLight,
  },
});

export default ProfessionalButton;