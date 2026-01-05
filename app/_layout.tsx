import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';

import AuthScreen from '@/components/AuthScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAuthEnabled } from '@/utils/auth';
import { setupSmartNotifications } from '@/utils/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if authentication is required
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const required = await isAuthEnabled();
        setAuthRequired(required);

        if (!required) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(true); // Allow access on error
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Re-authenticate when app comes from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && authRequired && isAuthenticated) {
        // App came to foreground, require re-authentication
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [authRequired, isAuthenticated]);

  // Initialize notifications on app launch
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('Initializing smart notifications...');
        await setupSmartNotifications();
        console.log('✅ Smart notification setup complete');
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  // Show nothing while checking auth status
  if (isCheckingAuth) {
    return null;
  }

  // Show auth screen if required and not authenticated
  if (authRequired && !isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
