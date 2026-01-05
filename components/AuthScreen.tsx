import {
    authenticateWithBiometrics,
    getBiometricTypes,
    isBiometricEnrolled,
    isBiometricSupported,
    verifyPasscode,
} from '@/utils/auth';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AuthScreenProps {
    onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [passcode, setPasscode] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometric');
    const [shakeAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        checkBiometrics();
        // Auto-trigger biometric auth on mount
        setTimeout(() => {
            handleBiometricAuth();
        }, 500);
    }, []);

    const checkBiometrics = async () => {
        const supported = await isBiometricSupported();
        const enrolled = await isBiometricEnrolled();
        const types = await getBiometricTypes();

        setBiometricAvailable(supported && enrolled);
        if (types.length > 0) {
            setBiometricType(types[0]);
        }
    };

    const handleBiometricAuth = async () => {
        if (!biometricAvailable) return;

        const success = await authenticateWithBiometrics();
        if (success) {
            onAuthenticated();
        }
    };

    const handlePasscodeSubmit = async () => {
        if (passcode.length !== 4) {
            Alert.alert('Invalid Passcode', 'Please enter a 4-digit passcode');
            return;
        }

        const isValid = await verifyPasscode(passcode);
        if (isValid) {
            onAuthenticated();
        } else {
            // Shake animation for wrong passcode
            Animated.sequence([
                Animated.timing(shakeAnimation, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: -10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            setPasscode('');
            Alert.alert('Incorrect Passcode', 'Please try again');
        }
    };

    const handlePasscodeChange = (text: string) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');
        if (numericText.length <= 4) {
            setPasscode(numericText);

            // Auto-submit when 4 digits entered
            if (numericText.length === 4) {
                setTimeout(() => {
                    handlePasscodeSubmit();
                }, 200);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Lock Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.lockIcon}>🔒</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Daily Reflection</Text>
                <Text style={styles.subtitle}>Your private diary is protected</Text>

                {/* Passcode Input */}
                <Animated.View
                    style={[
                        styles.passcodeContainer,
                        { transform: [{ translateX: shakeAnimation }] },
                    ]}
                >
                    <View style={styles.passcodeDotsContainer}>
                        {[0, 1, 2, 3].map((index) => (
                            <View
                                key={index}
                                style={[
                                    styles.passcodeDot,
                                    passcode.length > index && styles.passcodeDotFilled,
                                ]}
                            />
                        ))}
                    </View>
                    <TextInput
                        style={styles.hiddenInput}
                        value={passcode}
                        onChangeText={handlePasscodeChange}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                        autoFocus
                    />
                </Animated.View>

                <Text style={styles.instruction}>Enter 4-digit passcode</Text>

                {/* Biometric Button */}
                {biometricAvailable && (
                    <TouchableOpacity
                        style={styles.biometricButton}
                        onPress={handleBiometricAuth}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.biometricIcon}>
                            {biometricType === 'Face ID' ? '👤' : '👆'}
                        </Text>
                        <Text style={styles.biometricText}>
                            Use {biometricType}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Help Text */}
                <Text style={styles.helpText}>
                    Your diary entries are stored securely on this device
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
        padding: 40,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    lockIcon: {
        fontSize: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 48,
    },
    passcodeContainer: {
        marginBottom: 16,
    },
    passcodeDotsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    passcodeDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#bdc3c7',
        backgroundColor: 'transparent',
    },
    passcodeDotFilled: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
    },
    instruction: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 32,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 12,
    },
    biometricIcon: {
        fontSize: 24,
    },
    biometricText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3498db',
    },
    helpText: {
        fontSize: 12,
        color: '#95a5a6',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});
