import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler for LOCAL notifications only
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
        console.log('Must use physical device for notifications');
        return false;
    }

    try {
        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permissions if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permissions denied');
            return false;
        }

        // For Android 8.0+, create notification channel (required)
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('daily-reflection', {
                name: 'Daily Reflection Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2ecc71',
                enableVibrate: true,
            });
            console.log('Android notification channel created');
        }

        console.log('Notification permissions granted');
        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
};

/**
 * Schedule daily LOCAL notification at 9:00 PM (21:00)
 * ONLY if today has NOT been rated yet
 * Uses DailyTriggerInput for Android compatibility
 */
export const scheduleDailyNotification = async (): Promise<string | null> => {
    try {
        // Ensure permissions are granted first
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.log('Cannot schedule notification: permissions not granted');
            return null;
        }

        // Cancel all existing scheduled notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Cancelled all previous notifications');

        // Calculate next 9 PM
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(21, 0, 0, 0); // 9:00 PM

        // If it's already past 9 PM today, schedule for tomorrow
        if (now.getTime() > scheduledTime.getTime()) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Schedule the notification using DAILY trigger (Android compatible)
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌙 Daily Reflection Time',
                body: 'How was your day? Time to reflect!',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === 'android' && {
                    channelId: 'daily-reflection', // Required for Android
                }),
            },
            trigger: {
                // Use DAILY trigger instead of CALENDAR for better Android support
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 21,
                minute: 0,
            },
        });

        console.log('Daily notification scheduled successfully:', notificationId);
        console.log('Next notification at:', scheduledTime.toLocaleString());
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
    }
};

/**
 * Check if today has been rated and schedule notification accordingly
 * This should be called at app launch and also set up a listener for 21:00
 */
export const setupSmartNotifications = async (): Promise<void> => {
    try {
        // Import storage functions dynamically to avoid circular dependency
        const { getDayEntry, formatDate } = await import('./storage');

        const today = formatDate(new Date());
        const todayEntry = await getDayEntry(today);

        if (todayEntry) {
            // Today is already rated, cancel any pending notifications
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('✅ Today already rated - notification cancelled');
        } else {
            // Today not rated yet, schedule the notification
            await scheduleDailyNotification();
            console.log('⏰ Today not rated - notification scheduled for 21:00');
        }
    } catch (error) {
        console.error('Error in setupSmartNotifications:', error);
    }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};
