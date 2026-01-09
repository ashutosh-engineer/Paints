import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { Colors } from '../constants/theme';
import { UserIcon, HomeIcon } from './ProfessionalIcons';
import ProfessionalButton from './ProfessionalButton';
import ProfessionalCard from './ProfessionalCard';

class ProfessionalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });

        // Log error to crash reporting service
        console.error('Error Boundary caught an error:', error, errorInfo);

        // You can also log the error to an external service here
        // crashlytics().recordError(error);
    }

    handleRestart = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        });
    };

    toggleDetails = () => {
        this.setState({ showDetails: !this.state.showDetails });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <StatusBar backgroundColor={Colors.danger} barStyle="light-content" />

                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <UserIcon size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.headerTitle}>Oops! Something went wrong</Text>
                        <Text style={styles.headerSubtitle}>
                            We're sorry for the inconvenience
                        </Text>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <ProfessionalCard variant="elevated" padding="large" style={styles.errorCard}>
                            <View style={styles.errorIconContainer}>
                                <View style={styles.errorIcon}>
                                    <Text style={styles.errorIconText}>!</Text>
                                </View>
                            </View>

                            <Text style={styles.errorTitle}>Application Error</Text>
                            <Text style={styles.errorMessage}>
                                The application encountered an unexpected error and needs to restart.
                                Your data is safe and this issue has been reported to our team.
                            </Text>

                            <View style={styles.actionButtons}>
                                <ProfessionalButton
                                    title="Restart App"
                                    variant="primary"
                                    size="large"
                                    onPress={this.handleRestart}
                                    icon={<HomeIcon size={20} color={Colors.white} />}
                                    style={styles.restartButton}
                                />

                                <ProfessionalButton
                                    title={this.state.showDetails ? "Hide Details" : "Show Details"}
                                    variant="outline"
                                    size="medium"
                                    onPress={this.toggleDetails}
                                    style={styles.detailsButton}
                                />
                            </View>
                        </ProfessionalCard>

                        {this.state.showDetails && (
                            <ProfessionalCard variant="outlined" padding="medium" style={styles.detailsCard}>
                                <Text style={styles.detailsTitle}>Technical Details</Text>

                                <View style={styles.errorDetails}>
                                    <Text style={styles.errorLabel}>Error:</Text>
                                    <Text style={styles.errorText}>
                                        {this.state.error && this.state.error.toString()}
                                    </Text>
                                </View>

                                <View style={styles.errorDetails}>
                                    <Text style={styles.errorLabel}>Stack Trace:</Text>
                                    <ScrollView style={styles.stackTraceContainer} nestedScrollEnabled>
                                        <Text style={styles.stackTraceText}>
                                            {this.state.errorInfo.componentStack}
                                        </Text>
                                    </ScrollView>
                                </View>
                            </ProfessionalCard>
                        )}

                        <ProfessionalCard variant="default" padding="medium" style={styles.supportCard}>
                            <Text style={styles.supportTitle}>Need Help?</Text>
                            <Text style={styles.supportMessage}>
                                If this problem persists, please contact our support team with the error details above.
                            </Text>

                            <View style={styles.supportInfo}>
                                <Text style={styles.supportInfoText}>
                                    📧 support@kubtihardware.com
                                </Text>
                                <Text style={styles.supportInfoText}>
                                    📞 +91 XXXXX XXXXX
                                </Text>
                            </View>
                        </ProfessionalCard>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.danger,
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    errorCard: {
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIconContainer: {
        marginBottom: 20,
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    errorIconText: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.white,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    actionButtons: {
        width: '100%',
        gap: 12,
    },
    restartButton: {
        // Additional styling if needed
    },
    detailsButton: {
        // Additional styling if needed
    },
    detailsCard: {
        marginBottom: 20,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    errorDetails: {
        marginBottom: 16,
    },
    errorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 13,
        color: Colors.danger,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        backgroundColor: Colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stackTraceContainer: {
        maxHeight: 200,
        backgroundColor: Colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stackTraceText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        padding: 12,
        lineHeight: 16,
    },
    supportCard: {
        marginBottom: 20,
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    supportMessage: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    supportInfo: {
        gap: 8,
    },
    supportInfoText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
});

export default ProfessionalErrorBoundary;