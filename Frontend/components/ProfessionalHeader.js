import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../constants/theme';

export const ProfessionalHeader = ({
  title,
  subtitle = null,
  leftIcon = null,
  rightIcon = null,
  onLeftPress = null,
  onRightPress = null,
  backgroundColor = Colors.primary,
  textColor = Colors.white,
  showStatusBar = true,
  style = {},
}) => {
  return (
    <>
      {showStatusBar && <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />}
      <View style={[styles.header, { backgroundColor }, style]}>
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftIcon && onLeftPress ? (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={onLeftPress}
                activeOpacity={0.7}
              >
                {leftIcon}
              </TouchableOpacity>
            ) : leftIcon ? (
              <View style={styles.iconButton}>
                {leftIcon}
              </View>
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightIcon && onRightPress ? (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={onRightPress}
                activeOpacity={0.7}
              >
                {rightIcon}
              </TouchableOpacity>
            ) : rightIcon ? (
              <View style={styles.iconButton}>
                {rightIcon}
              </View>
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50, // Account for status bar
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 2,
  },
});

export default ProfessionalHeader;