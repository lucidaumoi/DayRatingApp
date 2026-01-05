/**
 * Example usage of the Daily Reflection App utilities
 * 
 * This file demonstrates how to use the storage and notification utilities
 * in your own components or for testing purposes.
 */

import {
    DayEntry,
    formatDate,
    getAllDayEntries,
    getDayEntry,
    getRatingColor,
    saveDayEntry,
} from './utils/storage';

import {
    cancelAllNotifications,
    getScheduledNotifications,
    requestNotificationPermissions,
    scheduleDailyNotification,
} from './utils/notifications';

// ============================================
// STORAGE EXAMPLES
// ============================================

/**
 * Example 1: Save a day's entry
 */
export const exampleSaveEntry = async () => {
    const today = formatDate(new Date());
    const entry: DayEntry = {
        rating: 5,
        description: 'Had an amazing day! Completed my project and went for a run.',
    };

    await saveDayEntry(today, entry);
    console.log('Entry saved for', today);
};

/**
 * Example 2: Get a specific day's entry
 */
export const exampleGetEntry = async () => {
    const today = formatDate(new Date());
    const entry = await getDayEntry(today);

    if (entry) {
        console.log('Rating:', entry.rating);
        console.log('Description:', entry.description);
        console.log('Color:', getRatingColor(entry.rating));
    } else {
        console.log('No entry found for', today);
    }
};

/**
 * Example 3: Get all entries
 */
export const exampleGetAllEntries = async () => {
    const allEntries = await getAllDayEntries();

    console.log('Total entries:', Object.keys(allEntries).length);

    // Loop through all entries
    Object.keys(allEntries).forEach((date) => {
        const entry = allEntries[date];
        console.log(`${date}: Rating ${entry.rating} - ${entry.description}`);
    });
};

/**
 * Example 4: Format dates
 */
export const exampleFormatDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log('Today:', formatDate(today));
    console.log('Yesterday:', formatDate(yesterday));

    // Format a specific date
    const specificDate = new Date(2026, 0, 1); // January 1, 2026
    console.log('Specific date:', formatDate(specificDate));
};

/**
 * Example 5: Get rating colors
 */
export const exampleRatingColors = () => {
    for (let rating = 1; rating <= 5; rating++) {
        console.log(`Rating ${rating}:`, getRatingColor(rating));
    }
};

// ============================================
// NOTIFICATION EXAMPLES
// ============================================

/**
 * Example 6: Setup notifications
 */
export const exampleSetupNotifications = async () => {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();

    if (hasPermission) {
        console.log('Notification permissions granted');

        // Schedule daily notification
        const notificationId = await scheduleDailyNotification();
        console.log('Notification scheduled with ID:', notificationId);
    } else {
        console.log('Notification permissions denied');
    }
};

/**
 * Example 7: Check scheduled notifications
 */
export const exampleCheckNotifications = async () => {
    const notifications = await getScheduledNotifications();
    console.log('Scheduled notifications:', notifications);
};

/**
 * Example 8: Cancel all notifications
 */
export const exampleCancelNotifications = async () => {
    await cancelAllNotifications();
    console.log('All notifications cancelled');
};

// ============================================
// SAMPLE DATA FOR TESTING
// ============================================

/**
 * Example 9: Populate sample data for testing
 */
export const populateSampleData = async () => {
    const today = new Date();

    // Add entries for the past 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dateString = formatDate(date);
        const rating = Math.floor(Math.random() * 5) + 1; // Random rating 1-5

        const descriptions = [
            'Great day with lots of productivity!',
            'Had some challenges but overcame them.',
            'Feeling neutral today, nothing special.',
            'Rough day, but tomorrow will be better.',
            'Amazing day! Everything went perfectly.',
        ];

        const entry: DayEntry = {
            rating,
            description: descriptions[rating - 1],
        };

        await saveDayEntry(dateString, entry);
        console.log(`Added sample entry for ${dateString}: Rating ${rating}`);
    }

    console.log('Sample data populated!');
};

// ============================================
// DATA STRUCTURE REFERENCE
// ============================================

/**
 * DayEntry Interface:
 * {
 *   rating: number;      // Integer from 1 to 5
 *   description: string; // Text diary entry (can be empty)
 * }
 *
 * Storage Key Format:
 * @DailyReflection:YYYY-MM-DD
 *
 * Example:
 * @DailyReflection:2026-01-05
 *
 * Stored Value:
 * {
 *   "rating": 5,
 *   "description": "Had an amazing day!"
 * }
 */

// ============================================
// USAGE IN COMPONENTS
// ============================================

/**
 * Example 10: Use in a React component
 */
/*
import { useState, useEffect } from 'react';
import { formatDate, getDayEntry, DayEntry } from '@/utils/storage';

export default function MyComponent() {
  const [todayEntry, setTodayEntry] = useState<DayEntry | null>(null);

  useEffect(() => {
    const loadTodayEntry = async () => {
      const today = formatDate(new Date());
      const entry = await getDayEntry(today);
      setTodayEntry(entry);
    };

    loadTodayEntry();
  }, []);

  return (
    <View>
      {todayEntry ? (
        <Text>Today's rating: {todayEntry.rating}</Text>
      ) : (
        <Text>No entry for today</Text>
      )}
    </View>
  );
}
*/
