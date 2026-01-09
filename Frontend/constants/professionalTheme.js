// Professional theme for Kubti Hardware app
export const ProfessionalTheme = {
  // Primary Colors
  colors: {
    primary: '#1a365d',        // Deep blue - professional and trustworthy
    primaryLight: '#2d5a87',   // Lighter blue for hover states
    primaryDark: '#0f2a44',    // Darker blue for emphasis
    
    secondary: '#f7931e',      // Orange - energetic and warm
    secondaryLight: '#ffa94d', // Lighter orange
    secondaryDark: '#e67e22',  // Darker orange
    
    accent: '#ffffff',         // White for contrast
    accentDark: '#f8f9fa',     // Light gray for subtle backgrounds
    
    // Semantic Colors
    success: '#28a745',        // Green for success states
    warning: '#ffc107',        // Yellow for warnings
    error: '#dc3545',          // Red for errors
    info: '#17a2b8',          // Cyan for information
    
    // Neutral Colors
    text: {
      primary: '#212529',      // Dark gray for primary text
      secondary: '#6c757d',    // Medium gray for secondary text
      muted: '#adb5bd',        // Light gray for muted text
      inverse: '#ffffff',      // White text for dark backgrounds
    },
    
    background: {
      primary: '#ffffff',      // White background
      secondary: '#f8f9fa',    // Light gray background
      tertiary: '#e9ecef',     // Medium gray background
      dark: '#343a40',         // Dark background
    },
    
    border: {
      light: '#e9ecef',        // Light border
      medium: '#dee2e6',       // Medium border
      dark: '#adb5bd',         // Dark border
    },
    
    // Paint Category Colors (professional palette)
    paintCategories: {
      wood: '#8B4513',         // Saddle brown
      waterproof: '#4682B4',   // Steel blue
      exterior: '#228B22',     // Forest green
      interior: '#DC143C',     // Crimson
      oil: '#FF8C00',          // Dark orange
      premium: '#4B0082',      // Indigo
      standard: '#696969',     // Dim gray
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Component Styles
  components: {
    button: {
      primary: {
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: '#f7931e',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 22,
      }
    },
    
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    input: {
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
    }
  }
};

// Helper functions for consistent styling
export const getThemeColor = (colorPath) => {
  const paths = colorPath.split('.');
  let color = ProfessionalTheme.colors;
  
  for (const path of paths) {
    color = color[path];
    if (!color) return '#000000'; // fallback
  }
  
  return color;
};

export const getThemeSpacing = (size) => {
  return ProfessionalTheme.spacing[size] || 16;
};

export const getThemeShadow = (size) => {
  return ProfessionalTheme.shadows[size] || ProfessionalTheme.shadows.md;
};