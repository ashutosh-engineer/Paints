import { View, Text, StyleSheet } from 'react-native';

// Simple text-based icons as fallback
export const SimpleHomeIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🏠</Text>
    </View>
);

export const SimpleCartIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🛒</Text>
    </View>
);

export const SimpleBellIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🔔</Text>
    </View>
);

export const SimpleUserIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>👤</Text>
    </View>
);

export const SimpleGiftIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🎁</Text>
    </View>
);

export const SimpleTagIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🏷️</Text>
    </View>
);

export const SimplePaintIcon = ({ size = 24, color = '#333' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Text style={[styles.iconText, { color, fontSize: size * 0.6 }]}>🎨</Text>
    </View>
);

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        textAlign: 'center',
    },
});

// Export all icons with consistent naming
export const HomeIcon = SimpleHomeIcon;
export const ShoppingCartIcon = SimpleCartIcon;
export const BellIcon = SimpleBellIcon;
export const UserIcon = SimpleUserIcon;
export const GiftIcon = SimpleGiftIcon;
export const TagIcon = SimpleTagIcon;
export const PaintBrushIcon = SimplePaintIcon;
export const EditIcon = SimpleUserIcon;
export const LocationIcon = SimpleHomeIcon;
export const LogoutIcon = SimpleUserIcon;
export const PaintCategoryIcon = SimplePaintIcon;