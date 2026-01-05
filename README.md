# Daily Reflection App 🌙

A beautiful React Native (Expo) mobile application that helps you track your daily mood and thoughts through a simple rating system and calendar view.

## Features ✨

- **Daily Ratings**: Rate each day from 1-5 with emoji-based buttons
- **Calendar View**: Month-view calendar with color-coded dates based on ratings
- **Daily Reflections**: Add optional diary entries for each day
- **Push Notifications**: Automatic reminder at 9:00 PM every day
- **Local Storage**: All data stored locally using AsyncStorage
- **Clean UI**: Minimal and modern design

## Rating Scale 🎨

- **5 (Excellent)**: Green (#2ecc71) 😄
- **4 (Good)**: Light Green (#a2ddb8) 🙂
- **3 (Neutral)**: Yellow (#f1c40f) 😐
- **2 (Bad)**: Orange (#e67e22) 😕
- **1 (Terrible)**: Red (#e74c3c) 😞

## Installation 🚀

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - **iOS**: Press `i` or run `npm run ios`
   - **Android**: Press `a` or run `npm run android`
   - **Web**: Press `w` or run `npm run web`

## Project Structure 📁

```
DayRatingApp/
├── app/
│   └── (tabs)/
│       └── index.tsx          # Main home screen (Calendar)
├── components/
│   ├── CalendarScreen.tsx     # Calendar view component
│   └── RatingModal.tsx        # Rating input modal
├── utils/
│   ├── storage.ts             # AsyncStorage utilities
│   └── notifications.ts       # Notification setup
└── package.json
```

## How It Works 🔧

### Data Storage

- Data is stored in AsyncStorage with keys in format: `@DailyReflection:YYYY-MM-DD`
- Each entry contains:
  ```typescript
  {
    rating: number,      // 1-5
    description: string  // Optional diary entry
  }
  ```

### Notifications

- Daily notification scheduled at 21:00 (9:00 PM)
- Notification message: "How was your day? Time to reflect!"
- Uses `expo-notifications` for local push notifications
- Requires permission on first launch

### Calendar Display

- Uses `react-native-calendars` for month view
- Each date is colored based on its rating
- Tap any date to add/edit rating and description
- Quick "Add Today's Reflection" button at the bottom

## Usage 📱

1. **First Launch**:
   - Grant notification permissions when prompted
   - The app will schedule daily 9 PM reminders

2. **Adding a Rating**:
   - Tap any date on the calendar OR
   - Use the "Add Today's Reflection" button
   - Select a rating (1-5)
   - Optionally add a description
   - Press "Save"

3. **Viewing Past Entries**:
   - Tap any colored date on the calendar
   - View and edit the rating and description

4. **Daily Reminder**:
   - At 9:00 PM, you'll receive a notification
   - If you open the app after 9 PM and haven't rated today, the modal will appear automatically

## Dependencies 📦

- **expo**: ~54.0.30
- **react-native**: 0.81.5
- **@react-native-async-storage/async-storage**: 2.2.0
- **expo-notifications**: ~0.32.15
- **react-native-calendars**: ^1.1313.0
- **expo-device**: ~8.0.10

## Customization 🎨

### Change Notification Time

Edit `utils/notifications.ts`:
```typescript
trigger: {
  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
  hour: 21, // Change this (0-23)
  minute: 0, // Change this (0-59)
  repeats: true,
}
```

### Change Rating Colors

Edit `utils/storage.ts` in the `getRatingColor` function:
```typescript
export const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 5: return '#2ecc71'; // Your color
    // ... etc
  }
}
```

## Testing 🧪

### Test Notifications

You must use a **physical device** to test notifications (not emulator/simulator).

To check scheduled notifications:
```typescript
import { getScheduledNotifications } from '@/utils/notifications';

const notifications = await getScheduledNotifications();
console.log(notifications);
```

### Test Storage

```typescript
import { getAllDayEntries } from '@/utils/storage';

const entries = await getAllDayEntries();
console.log(entries);
```

## Troubleshooting 🔧

### Notifications Not Working

1. Ensure you're using a physical device
2. Check notification permissions in device settings
3. Verify notification channel is created (Android)

### Data Not Persisting

1. Check AsyncStorage permissions
2. Verify the storage key format is correct
3. Check console for errors

### Calendar Not Updating

1. The calendar reloads when the screen comes into focus
2. Try navigating away and back
3. Check if data is saved in AsyncStorage

## Future Enhancements 💡

- Export data to CSV/JSON
- Statistics and insights (mood trends)
- Custom themes
- Backup to cloud storage
- Multiple daily check-ins
- Mood analytics and charts

## License 📄

This project is open source and available under the MIT License.

## Support 💬

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React Native and Expo
