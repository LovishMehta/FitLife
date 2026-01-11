# Health Tracker - Step Counter App

A beautiful, modern mobile app for tracking your daily steps with weekly history visualization. Built with React Native and Expo.

## Features

- 📊 Real-time step counting using device health APIs (HealthKit on iOS, step counter sensor on Android)
- 🎯 Daily step goals with circular progress visualization
- 📈 Weekly step history with bar chart
- 💾 Automatic data persistence
- 🎨 Dark theme with smooth animations
- 🔄 Pull-to-refresh functionality
- 📱 Cross-platform (iOS & Android)

## Screenshots

The app features:
- Large step counter with animated updates
- Circular progress ring showing goal completion
- Weekly bar chart with statistics (average, total, goals hit)
- Clean, modern dark UI design

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **expo-sensors** - Pedometer access (HealthKit/step counter sensor)
- **AsyncStorage** - Local data persistence
- **react-native-chart-kit** - Data visualization
- **react-native-svg** - Chart rendering

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with the Expo Go app
   - **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app

## Permissions

### iOS
The app requests motion & fitness permissions to access step data from HealthKit.
The permission message is: "This app uses motion data to count your daily steps and track your fitness activity."

### Android
The app requires the `ACTIVITY_RECOGNITION` permission to access step counter sensor data.

## Project Structure

```
health-tracker/
├── src/
│   ├── screens/
│   │   └── HomeScreen.js         # Main dashboard
│   ├── components/
│   │   ├── StepCounter.js        # Today's step display
│   │   ├── GoalProgress.js       # Circular progress ring
│   │   └── WeeklyChart.js        # 7-day bar chart
│   └── services/
│       ├── stepService.js        # Pedometer API wrapper
│       └── storageService.js     # AsyncStorage wrapper
├── App.js                        # App entry point
├── app.json                      # Expo configuration
└── package.json                  # Dependencies
```

## How It Works

1. **Step Tracking**: Uses the device's built-in pedometer sensor
   - iOS: Reads from HealthKit
   - Android: Reads from step counter sensor

2. **Data Storage**: Step counts are saved daily using AsyncStorage
   - History is maintained for charting
   - Default daily goal is 10,000 steps

3. **Real-time Updates**: The app subscribes to step count changes and updates the UI automatically

## Building for Production

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Building Standalone Apps
Use EAS Build for creating production builds:
```bash
npx eas-cli build --platform ios
npx eas-cli build --platform android
```

## Customization

### Change Daily Goal
Edit the default goal in `src/services/storageService.js`:
```javascript
this.DEFAULT_GOAL = 10000; // Change this value
```

### Theme Colors
Main colors are defined in component stylesheets:
- Primary: `#4CAF50` (Green)
- Background: `#121212` (Dark)
- Cards: `#1E1E1E` (Dark gray)

## Troubleshooting

**Step counter not working?**
- Make sure you've granted motion & fitness permissions
- Try closing and reopening the app
- Check if your device has a built-in pedometer sensor

**iOS: "Pedometer not available"**
- Go to Settings > Privacy > Motion & Fitness
- Enable both "Fitness Tracking" and allow the app

**Android: Steps not updating**
- Go to Settings > Apps > Health Tracker > Permissions
- Enable "Physical activity" permission

## License

MIT

## Author

Built with ❤️ for health-conscious mobile users

