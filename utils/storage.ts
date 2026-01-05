import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayEntry {
    rating: number; // 1-5
    description: string;
}

const STORAGE_PREFIX = '@DailyReflection:';

/**
 * Save a day's rating and description
 * @param date - Date in YYYY-MM-DD format
 * @param entry - Rating and description
 */
export const saveDayEntry = async (date: string, entry: DayEntry): Promise<void> => {
    try {
        const key = `${STORAGE_PREFIX}${date}`;
        await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
        console.error('Error saving day entry:', error);
        throw error;
    }
};

/**
 * Get a day's entry
 * @param date - Date in YYYY-MM-DD format
 * @returns DayEntry or null if not found
 */
export const getDayEntry = async (date: string): Promise<DayEntry | null> => {
    try {
        const key = `${STORAGE_PREFIX}${date}`;
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error getting day entry:', error);
        return null;
    }
};

/**
 * Get all day entries
 * @returns Object with date keys and DayEntry values
 */
export const getAllDayEntries = async (): Promise<Record<string, DayEntry>> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const dayKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
        const entries = await AsyncStorage.multiGet(dayKeys);

        const result: Record<string, DayEntry> = {};
        entries.forEach(([key, value]) => {
            if (value) {
                const date = key.replace(STORAGE_PREFIX, '');
                result[date] = JSON.parse(value);
            }
        });

        return result;
    } catch (error) {
        console.error('Error getting all day entries:', error);
        return {};
    }
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get color based on rating
 */
export const getRatingColor = (rating: number): string => {
    switch (rating) {
        case 5:
            return '#2ecc71'; // Green - Excellent
        case 4:
            return '#a2ddb8'; // Light Green - Good
        case 3:
            return '#f1c40f'; // Yellow - Neutral
        case 2:
            return '#e67e22'; // Orange - Bad
        case 1:
            return '#e74c3c'; // Red - Terrible
        default:
            return '#95a5a6'; // Gray - No rating
    }
};
