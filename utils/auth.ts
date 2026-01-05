import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const PASSCODE_KEY = '@DailyReflection:passcode';
const AUTH_ENABLED_KEY = '@DailyReflection:authEnabled';

export interface AuthConfig {
    enabled: boolean;
    passcode?: string;
    useBiometrics: boolean;
}

/**
 * Check if device supports biometric authentication
 */
export const isBiometricSupported = async (): Promise<boolean> => {
    try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        return compatible;
    } catch (error) {
        console.error('Error checking biometric support:', error);
        return false;
    }
};

/**
 * Check if biometrics are enrolled
 */
export const isBiometricEnrolled = async (): Promise<boolean> => {
    try {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return enrolled;
    } catch (error) {
        console.error('Error checking biometric enrollment:', error);
        return false;
    }
};

/**
 * Get available biometric types
 */
export const getBiometricTypes = async (): Promise<string[]> => {
    try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        return types.map(type => {
            switch (type) {
                case LocalAuthentication.AuthenticationType.FINGERPRINT:
                    return 'Fingerprint';
                case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                    return 'Face ID';
                case LocalAuthentication.AuthenticationType.IRIS:
                    return 'Iris';
                default:
                    return 'Biometric';
            }
        });
    } catch (error) {
        console.error('Error getting biometric types:', error);
        return [];
    }
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to access your Daily Diary',
            fallbackLabel: 'Use Passcode',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
        });

        return result.success;
    } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
    }
};

/**
 * Set up passcode
 */
export const setPasscode = async (passcode: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(PASSCODE_KEY, passcode);
    } catch (error) {
        console.error('Error setting passcode:', error);
        throw error;
    }
};

/**
 * Verify passcode
 */
export const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
        const storedPasscode = await AsyncStorage.getItem(PASSCODE_KEY);
        return storedPasscode === passcode;
    } catch (error) {
        console.error('Error verifying passcode:', error);
        return false;
    }
};

/**
 * Check if passcode is set
 */
export const hasPasscode = async (): Promise<boolean> => {
    try {
        const passcode = await AsyncStorage.getItem(PASSCODE_KEY);
        return passcode !== null;
    } catch (error) {
        console.error('Error checking passcode:', error);
        return false;
    }
};

/**
 * Enable/disable authentication
 */
export const setAuthEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(AUTH_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
        console.error('Error setting auth enabled:', error);
        throw error;
    }
};

/**
 * Check if authentication is enabled
 */
export const isAuthEnabled = async (): Promise<boolean> => {
    try {
        const enabled = await AsyncStorage.getItem(AUTH_ENABLED_KEY);
        return enabled === 'true';
    } catch (error) {
        console.error('Error checking auth enabled:', error);
        return false;
    }
};

/**
 * Get authentication configuration
 */
export const getAuthConfig = async (): Promise<AuthConfig> => {
    try {
        const enabled = await isAuthEnabled();
        const hasPass = await hasPasscode();
        const biometricSupported = await isBiometricSupported();
        const biometricEnrolled = await isBiometricEnrolled();

        return {
            enabled,
            passcode: hasPass ? '****' : undefined,
            useBiometrics: biometricSupported && biometricEnrolled,
        };
    } catch (error) {
        console.error('Error getting auth config:', error);
        return {
            enabled: false,
            useBiometrics: false,
        };
    }
};

/**
 * Main authentication function
 * Tries biometrics first, falls back to passcode
 */
export const authenticate = async (): Promise<boolean> => {
    try {
        const config = await getAuthConfig();

        if (!config.enabled) {
            return true; // Auth disabled, allow access
        }

        // Try biometrics first if available
        if (config.useBiometrics) {
            const biometricSuccess = await authenticateWithBiometrics();
            if (biometricSuccess) {
                return true;
            }
            // If biometric fails, user can still try passcode
        }

        // Passcode authentication handled by UI component
        return false; // Requires passcode input
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
};

/**
 * Remove passcode and disable auth
 */
export const clearAuth = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PASSCODE_KEY);
        await AsyncStorage.removeItem(AUTH_ENABLED_KEY);
    } catch (error) {
        console.error('Error clearing auth:', error);
        throw error;
    }
};
