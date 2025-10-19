# 📚 Magnolia

A beautiful, feature-rich mobile reader app for Android built with React Native and Expo.

## ✨ Features

### 📖 Reading Experience
- **Multiple Format Support**: Read TXT, FB2, and EPUB files
- **Customizable Reader**: Adjust font size, line height, font family, and text alignment
- **Reading Modes**: Vertical scroll or paginated reading
- **Custom Colors**: Full control over text and background colors with theme presets
- **Progress Tracking**: Automatically saves your reading position

### 🎨 Theming
- **Light & Dark Themes**: Switch between light and dark modes
- **Accent Colors**: Choose from 5 beautiful accent colors (Purple, Red, Blue, Green, Orange)
- **Monochrome Mode**: Minimalist grayscale theme for distraction-free reading
- **Material Design 3**: Modern, beautiful UI following Material Design guidelines

### 📚 Library Management
- **Smart Library**: All your books in one place with search functionality
- **Book Metadata**: Displays title, author, format, and reading progress
- **Recent Books**: Books sorted by last opened date
- **Easy Import**: Add books from your device storage

### ⚙️ Settings
- **Persistent Settings**: All preferences saved automatically
- **Reader Customization**: Font, colors, spacing, and reading mode
- **App Theming**: Theme mode, color scheme, and accent color
- **Data Management**: Reset settings or clear all data

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/magnolia.git
cd magnolia
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with Expo Go app on your Android device

## 📱 Building the App

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed instructions on building APK/AAB files.

Quick build command:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Library**: React Native Paper (Material Design 3)
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **File Parsing**: 
  - JSZip (EPUB files)
  - fast-xml-parser (FB2 and EPUB metadata)
- **Gestures**: React Native Gesture Handler

## 📂 Project Structure

```
magnolia/
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout with theme provider
│   ├── index.tsx          # Entry point (redirects to library)
│   ├── library.tsx        # Main library screen
│   ├── settings.tsx       # Settings screen
│   └── reader/
│       └── [id].tsx       # Reader screen (dynamic route)
├── src/
│   ├── components/        # Reusable components
│   │   ├── BookCard.tsx   # Book card component
│   │   └── index.ts       # Component exports
│   ├── context/           # React Context providers
│   │   ├── AppSettingsContext.tsx      # App-wide settings
│   │   ├── ReaderSettingsContext.tsx   # Reader settings
│   │   └── index.ts       # Context exports
│   ├── lib/               # Utilities and parsers
│   │   ├── parsers/       # Book format parsers
│   │   │   ├── epubParser.ts
│   │   │   ├── fb2Parser.ts
│   │   │   └── txtParser.ts
│   │   └── storage.ts     # AsyncStorage utilities
│   └── types/             # TypeScript type definitions
│       ├── book.ts
│       ├── reader.ts
│       ├── settings.ts
│       └── index.ts
├── assets/                # App icons and images
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Key Features Explained

### Reader Controls
- **Bottom-Left Corner Tap**: Tap the bottom-left corner of the screen to show/hide reader controls
- **Font Customization**: Choose from System, Serif, Sans-Serif, or Monospace fonts
- **Color Themes**: Quick presets (Light, Sepia, Dark, Black) or custom hex colors
- **Reading Modes**: Vertical scrolling or page-by-page reading

### Theme System
- **Dynamic Theming**: Entire app responds to theme changes instantly
- **Monochrome Override**: When enabled, uses grayscale colors appropriate for light/dark mode
- **Accent Colors**: Different color palettes for light and dark themes for optimal visibility

### Book Parsing
- **TXT**: Simple text file parsing with UTF-8 support
- **FB2**: XML-based format with metadata extraction
- **EPUB**: ZIP archive parsing with proper content ordering

## 🔧 Configuration

### App Configuration (app.json)
- **App Name**: Magnolia
- **Package**: com.magnolia.app
- **Version**: 1.0.0
- **Permissions**: Storage access for reading book files

### Storage Keys
- `@reader_books`: Book library data
- `@reader_settings`: Reader settings
- `@reader_app_settings`: App-wide settings

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
```bash
# Clear cache and restart
npx expo start --clear
```

**Build fails:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Books won't open:**
- Check file format is supported (TXT, FB2, EPUB)
- Ensure storage permissions are granted
- Try re-importing the book

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ using React Native and Expo

## 🙏 Acknowledgments

- React Native Paper for the beautiful Material Design components
- Expo team for the amazing development experience
- All open-source contributors

---

**Enjoy reading with Magnolia! 📚✨**

