# 📝 Daily Reflection - Personal Diary & AI Assessment App

A beautiful, privacy-focused mobile application for daily mood tracking, journaling, and AI-powered emotional insights. Built with React Native (Expo) and TypeScript.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-Expo-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 📅 **Daily Mood Tracking**
- Rate your day on a 1-5 scale with color-coded emojis
- Visual calendar showing your emotional journey
- Color-coded dates: 🟢 Excellent → 🔴 Terrible
- Tap any date to view or edit past entries

### 📖 **Daily Diary**
- Write up to 1,512 characters about your day
- Real-time character counter with visual warnings
- Auto-save functionality (saves after 2 seconds of inactivity)
- "💾 Saving..." and "✓ Saved" indicators for peace of mind

### 🤖 **AI Assessment**
- Analyzes your last 30 days of entries
- Professional psychologist-level insights
- Identifies emotional patterns and trends
- Extracts key themes from your diary entries
- Provides personalized, actionable recommendations
- Beautiful visualizations (rating distribution, trend charts)

### 🔒 **Privacy & Security**
- **Biometric Authentication**: Face ID / Fingerprint support
- **4-Digit Passcode**: Fallback authentication method
- **Background Re-Authentication**: Requires auth when returning from background
- **Local-Only Storage**: All data stays on your device
- **No Cloud Sync**: Complete privacy guaranteed

### 🔔 **Smart Notifications**
- Daily reminder at 9:00 PM (21:00)
- **Only notifies if you haven't rated today**
- Automatically cancels if you've already reflected
- Android & iOS compatible (DAILY trigger)

---

## 🎨 Screenshots

### Calendar View
- Month view with color-coded dates
- Legend showing rating colors
- "Add Today's Reflection" quick action
- Automatic modal at 9 PM if not rated

### Rating Modal
- 5 color-coded rating buttons with emojis
- Expanded diary text area (zen mode)
- Character counter: `150 / 1512`
- Auto-save with visual feedback

### AI Assessment
- Summary statistics (days tracked, avg rating, trend)
- Rating distribution bar chart
- Top themes extracted from diary
- AI-generated insights
- Personalized recommendations

### Authentication
- Lock screen with biometric prompt
- 4-digit passcode input with dots
- Shake animation for wrong passcode
- Clean, secure interface

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing notifications & biometrics

### Installation

```bash
# Clone the repository
git clone https://github.com/lucidaumoi/DayRatingApp.git
cd DayRatingApp

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device

1. **Install Expo Go** on your iOS or Android device
2. **Scan the QR code** from the terminal
3. **Grant permissions** when prompted (notifications, biometrics)
4. **Start reflecting!**

---

## 📱 Usage

### First Time Setup

1. **Open the app** - Grant notification permissions
2. **Rate your day** - Select 1-5 and write your thoughts
3. **Save** - Your entry is stored locally
4. **View calendar** - See your mood patterns over time

### Daily Workflow

1. **9:00 PM Notification** - "How was your day? Time to reflect!"
2. **Tap notification** - Opens the app
3. **Rate & Write** - Select rating, write diary entry
4. **Auto-save** - Saves after 2 seconds of inactivity
5. **Done!** - Notification cancelled for today

### Viewing AI Assessment

1. **Tap "AI Assessment" tab** (brain icon)
2. **Wait for analysis** - Processes last 30 days
3. **Review insights** - Emotional patterns, themes, recommendations
4. **Refresh anytime** - Tap "🔄 Refresh Analysis"

### Enabling Authentication

```typescript
// In a settings screen or setup wizard
import { setPasscode, setAuthEnabled } from '@/utils/auth';

// Set a 4-digit passcode
await setPasscode('1234');

// Enable authentication
await setAuthEnabled(true);
```

---

## 🏗️ Project Structure

```
DayRatingApp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home (Calendar Screen)
│   │   ├── ai-assessment.tsx      # AI Assessment Tab
│   │   └── _layout.tsx            # Tab Navigation
│   └── _layout.tsx                # Root Layout (with Auth)
├── components/
│   ├── CalendarScreen.tsx         # Main calendar view
│   ├── RatingModal.tsx            # Daily diary modal
│   ├── AIAssessmentScreen.tsx     # AI analysis UI
│   └── AuthScreen.tsx             # Biometric/Passcode auth
├── utils/
│   ├── storage.ts                 # AsyncStorage operations
│   ├── notifications.ts           # Smart notification system
│   ├── aiAnalysis.ts              # AI assessment logic
│   └── auth.ts                    # Authentication utilities
├── constants/
│   └── theme.ts                   # Colors, fonts, etc.
└── package.json
```

---

## 🛠️ Tech Stack

### Core
- **React Native** - Cross-platform mobile framework
- **Expo** (SDK 54) - Development platform
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation

### Storage & State
- **AsyncStorage** - Local data persistence
- **React Hooks** - State management

### UI Components
- **react-native-calendars** - Calendar view
- **expo-notifications** - Local notifications
- **expo-local-authentication** - Biometrics

### Key Features
- **Smart Notifications** - Conditional daily reminders
- **Auto-Save** - Debounced diary saving
- **Biometric Auth** - Face ID / Fingerprint
- **AI Analysis** - Theme extraction & insights

---

## 📊 Data Structure

### Diary Entry
```typescript
interface DayEntry {
  rating: number;      // 1-5
  description: string; // Up to 1,512 characters
}
```

### Storage Format
```typescript
// AsyncStorage key: "@DailyReflection:YYYY-MM-DD"
// Example:
{
  "@DailyReflection:2026-01-05": {
    "rating": 5,
    "description": "Amazing day! Accomplished so much..."
  }
}
```

### AI Analysis Output
```typescript
interface MonthlyAnalysis {
  period: string;                    // "Last 30 Days"
  totalDays: number;                 // 30
  ratedDays: number;                 // Days with entries
  averageRating: number;             // 1-5 average
  ratingDistribution: {              // Count per rating
    excellent: number;
    good: number;
    neutral: number;
    bad: number;
    terrible: number;
  };
  emotionalTrend: 'improving' | 'declining' | 'stable';
  topThemes: string[];               // Top 3 themes
  insights: string[];                // AI insights
  recommendations: string[];         // Actionable advice
}
```

---

## 🎨 Color Scheme

| Rating | Label | Color | Hex |
|--------|-------|-------|-----|
| 5 | Excellent | 🟢 Green | `#2ecc71` |
| 4 | Good | 🟢 Light Green | `#a2ddb8` |
| 3 | Neutral | 🟡 Yellow | `#f1c40f` |
| 2 | Bad | 🟠 Orange | `#e67e22` |
| 1 | Terrible | 🔴 Red | `#e74c3c` |

---

## 🔧 Configuration

### Notification Time
Change the daily notification time in `utils/notifications.ts`:

```typescript
trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: 21,  // Change this (0-23)
  minute: 0, // Change this (0-59)
}
```

### Character Limit
Adjust the diary character limit in `components/RatingModal.tsx`:

```typescript
const MAX_CHARS = 1512; // Change this value
```

### Analysis Period
Modify the AI analysis timeframe in `utils/aiAnalysis.ts`:

```typescript
const entries = await getEntriesFromLastNDays(30); // Change 30 to desired days
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Daily Diary
- [ ] Character counter updates in real-time
- [ ] Counter turns orange at 90% (1,360 chars)
- [ ] Counter turns red at 100% (1,512 chars)
- [ ] Alert shown when exceeding limit
- [ ] Auto-save triggers after 2 seconds
- [ ] "💾 Saving..." indicator appears
- [ ] "✓ Saved" indicator appears (green)

#### Calendar
- [ ] Dates color-coded by rating
- [ ] Tap date opens modal
- [ ] Past entries load correctly
- [ ] Future dates are disabled (grayed out)
- [ ] maxDate = today

#### AI Assessment
- [ ] Tab appears with brain icon
- [ ] Analysis loads for last 30 days
- [ ] Summary statistics accurate
- [ ] Rating distribution displays
- [ ] Themes extracted from diary
- [ ] Insights are relevant
- [ ] Recommendations are actionable

#### Authentication
- [ ] Biometric prompt on app launch
- [ ] Face ID / Fingerprint works
- [ ] Passcode fallback works
- [ ] Wrong passcode shows shake animation
- [ ] Re-authenticates from background

#### Notifications
- [ ] Notification at 9 PM if not rated
- [ ] No notification if already rated
- [ ] Notification cancelled after rating
- [ ] Tapping notification opens app

---

## 🚀 Building for Production

### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build -p android --profile preview
```

### iOS (IPA)

```bash
# Build for iOS
eas build -p ios --profile preview

# Note: Requires Apple Developer account
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo Team** - Amazing development platform
- **React Native Community** - Excellent libraries and support
- **SF Symbols** - Beautiful icons (iOS)
- **Material Icons** - Icon system (Android)

---

## 📧 Contact

**Project Link**: [https://github.com/lucidaumoi/DayRatingApp](https://github.com/lucidaumoi/DayRatingApp)

**Issues**: [https://github.com/lucidaumoi/DayRatingApp/issues](https://github.com/lucidaumoi/DayRatingApp/issues)

---

## 🗺️ Roadmap

### Planned Features
- [ ] Export diary as PDF
- [ ] Share insights with friends
- [ ] Custom analysis periods (7, 90, 365 days)
- [ ] Mood prediction based on patterns
- [ ] Integration with external AI (GPT-4, Claude)
- [ ] Voice-to-text for diary entries
- [ ] Sentiment analysis visualization
- [ ] Goal setting and tracking
- [ ] Reminder customization
- [ ] Dark mode support
- [ ] Multiple languages
- [ ] Cloud backup (optional, encrypted)
- [ ] Passcode change functionality
- [ ] Data export/import

---

## 📈 Version History

### v1.0.0 (Current)
- ✅ Daily mood tracking with calendar
- ✅ 1,512 character diary with auto-save
- ✅ AI assessment (30-day analysis)
- ✅ Biometric authentication
- ✅ Smart notifications
- ✅ Theme extraction
- ✅ Personalized recommendations

---

## 💡 Tips & Tricks

### For Best Experience
1. **Rate daily** - Consistency gives better AI insights
2. **Write detailed entries** - More context = better analysis
3. **Enable biometrics** - Faster, more secure access
4. **Review AI assessment monthly** - Track your progress
5. **Use auto-save** - Never lose your thoughts

### Privacy Tips
1. **Enable authentication** - Protect your diary
2. **Use strong passcode** - Avoid simple patterns
3. **Keep device secure** - Lock screen enabled
4. **No screenshots** - Protect your privacy
5. **Local only** - Data never leaves your device

---

## ❓ FAQ

**Q: Where is my data stored?**
A: All data is stored locally on your device using AsyncStorage. Nothing is sent to the cloud.

**Q: Can I export my diary?**
A: Export feature is planned for a future update.

**Q: Does the AI analysis require internet?**
A: No, the built-in analysis works offline. External AI integration (optional) would require internet.

**Q: How do I change my passcode?**
A: Passcode change UI is planned for a future update. Currently, you can disable and re-enable authentication.

**Q: Can I use this on multiple devices?**
A: Currently, no. Each device has its own local data. Cloud sync is planned for the future.

**Q: Is my diary really private?**
A: Yes! All data stays on your device. We don't collect, transmit, or store any of your personal information.

---

## 🎯 Quick Start Summary

```bash
# 1. Clone & Install
git clone https://github.com/lucidaumoi/DayRatingApp.git
cd DayRatingApp
npm install

# 2. Run
npm start

# 3. Scan QR code with Expo Go

# 4. Start reflecting! 📝
```

---

**Made with ❤️ for mental health and self-reflection**

*Remember: Taking time to reflect on your day is an act of self-care. Be kind to yourself.* 🌟
