import React from 'react';
import { View } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  Ellipse, 
  G, 
  Text as SvgText, 
  Defs,
  LinearGradient,
  Stop 
} from 'react-native-svg';

// Kubti Hardware SVG Logo Component
export const KubtiSVGLogo = ({ width = 120, height = 120 }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 200 200"
        style={{ alignSelf: 'center' }}
      >
        {/* Flower petals - 5 petal design */}
        <G>
          {/* Top petal - Purple */}
          <Ellipse
            cx="100"
            cy="60"
            rx="15"
            ry="35"
            fill="#8B5A9F"
            transform="rotate(0 100 100)"
          />
          
          {/* Top Right petal - Pink */}
          <Ellipse
            cx="100"
            cy="60"
            rx="15"
            ry="35"
            fill="#E91E63"
            transform="rotate(72 100 100)"
          />
          
          {/* Bottom Right petal - Red */}
          <Ellipse
            cx="100"
            cy="60"
            rx="15"
            ry="35"
            fill="#F44336"
            transform="rotate(144 100 100)"
          />
          
          {/* Bottom Left petal - Orange */}
          <Ellipse
            cx="100"
            cy="60"
            rx="15"
            ry="35"
            fill="#FF9800"
            transform="rotate(216 100 100)"
          />
          
          {/* Top Left petal - Green */}
          <Ellipse
            cx="100"
            cy="60"
            rx="15"
            ry="35"
            fill="#4CAF50"
            transform="rotate(288 100 100)"
          />
          
          {/* Center circle */}
          <Circle
            cx="100"
            cy="100"
            r="12"
            fill="#FFF"
            stroke="#333"
            strokeWidth="2"
          />
        </G>
        
        {/* Text below the flower */}
        <SvgText
          x="100"
          y="150"
          fontSize="16"
          fontWeight="600"
          textAnchor="middle"
          fill="#7B68EE"
        >
          Kubti Hardware
        </SvgText>
        
        <SvgText
          x="100"
          y="170"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
          fill="#DC143C"
          fontStyle="italic"
        >
          & PAINTS
        </SvgText>
      </Svg>
    </View>
  );
};

// Alternative approach - if you want to load the actual SVG file
// You'll need to use react-native-svg-transformer for this approach
export const KubtiSVGFromFile = ({ width = 120, height = 120 }) => {
  // This approach requires additional setup with react-native-svg-transformer
  // For now, we'll use the manual SVG component above
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Placeholder that mimics your actual kubti.svg */}
      <Svg width={width} height={height} viewBox="0 0 300 300">
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5A9F" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Main flower design */}
        <G transform="translate(150,120)">
          {/* Petal paths - creating a more realistic flower shape */}
          <Path
            d="M0,-40 Q-15,-60 -25,-40 Q-15,-20 0,-40"
            fill="#8B5A9F"
            transform="rotate(0)"
          />
          <Path
            d="M0,-40 Q-15,-60 -25,-40 Q-15,-20 0,-40"
            fill="#E91E63"
            transform="rotate(72)"
          />
          <Path
            d="M0,-40 Q-15,-60 -25,-40 Q-15,-20 0,-40"
            fill="#F44336"
            transform="rotate(144)"
          />
          <Path
            d="M0,-40 Q-15,-60 -25,-40 Q-15,-20 0,-40"
            fill="#FF9800"
            transform="rotate(216)"
          />
          <Path
            d="M0,-40 Q-15,-60 -25,-40 Q-15,-20 0,-40"
            fill="#4CAF50"
            transform="rotate(288)"
          />
          
          {/* Center */}
          <Circle cx="0" cy="0" r="8" fill="url(#grad1)" />
        </G>
        
        {/* Company name */}
        <SvgText
          x="150"
          y="200"
          fontSize="20"
          fontWeight="600"
          textAnchor="middle"
          fill="#7B68EE"
        >
          Kubti Hardware
        </SvgText>
        
        <SvgText
          x="150"
          y="220"
          fontSize="14"
          fontWeight="500"
          textAnchor="middle"
          fill="#DC143C"
        >
          & PAINTS
        </SvgText>
      </Svg>
    </View>
  );
};