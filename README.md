# Movie Database - CRI App

A modern Angular application for browsing IMDb movies with timeline and favorites functionality. This project serves as a technical assessment demonstrating modern Angular development practices, reactive programming with RxJS, and clean architecture patterns.

> **Note:** This project is a complete rewrite of an original movie-site application I built **8 years** ago as a test assessment. You can find the original version at [github.com/Smiranin/movie-site](https://github.com/Smiranin/movie-site). This rewrite reflects my current understanding of how Angular applications should be architected and represents the patterns, practices, and principles I actively implement in my professional development workflow.

## 🎯 Project Overview

This application provides a comprehensive movie browsing experience with the following key features:

- **Movie Browsing**: Browse top-rated movies with detailed information
- **Timeline View**: Explore movies organized chronologically by decades
- **Favorites Management**: Save and manage your favorite movies with persistent storage
- **Theme Switching**: Toggle between dark and light themes with automatic persistence

## 🏗️ Architecture & Design Philosophy

The application follows clean architecture principles with a focus on maintainability, testability, and future scalability:

### Service-Based Architecture

All data interactions are handled through a well-structured service layer:

- **`MovieDataService`** - Facade service providing unified interface for all movie operations
- **`MovieApiService`** - External API interactions (currently using mock data)
- **`MovieStateService`** - Caching and state management for movie data
- **`MovieFavoritesService`** - User favorites management with localStorage persistence
- **`BrowserApiService`** - Reactive interface for browser APIs (localStorage, window, document)
- **`ThemeService`** - Theme management with system preference detection

### Component Structure

- **Pages**: Route-level components (`home`, `chronology`, `favorites`)
- **Components**: Reusable UI components (`movie-card`, `trailer-preview`)
- **Pipes**: Data transformation utilities (`poster-src`, `join`, `truncate`)

### Key Design Decisions

1. **Mock Data Strategy**: Currently uses static data for development, but the architecture allows seamless migration to real APIs
2. **Reactive Programming**: Extensive use of RxJS for state management and data flow
3. **Type Safety**: Strong TypeScript typing throughout the application
4. **Modern Angular**: Utilizes Angular 19 features including signals, standalone components, and inject() function
5. **Testability**: Services are well-documented and designed for easy unit testing

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200/`

3. **Run tests:**
   ```bash
   npm test
   ```

## 📋 Available Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm start`            | Start development server            |
| `npm test`             | Run unit tests                      |
| `npm run build`        | Build for production                |
| `npm run lint`         | Run ESLint checks                   |
| `npm run lint:fix`     | Fix ESLint issues automatically     |
| `npm run format:check` | Check code formatting with Prettier |

## 🛠️ Development Environment

The project includes a comprehensive development setup:

### Code Quality Tools

- **ESLint**: TypeScript and Angular-specific linting rules
- **Prettier**: Code formatting with team-consistent style
- **Husky**: Pre-commit hooks for automated quality checks
- **lint-staged**: Run linting and formatting on staged files only

### Pre-commit Hooks

The project automatically runs the following checks before each commit:

- TypeScript files: ESLint with auto-fix
- HTML templates: ESLint with auto-fix
- Styles & other files: Prettier formatting

## 🎨 Features

### Core Functionality

- **Home Page**: Displays top-rated movies with favorite toggle functionality
- **Chronology Page**: Movies organized by decades in timeline format
- **Favorites Page**: User's saved favorite movies with local storage persistence
- **Movie Details**: Detailed view with trailer preview capability

### Theme System

- Light and dark theme support
- Automatic system preference detection
- Persistent theme selection via localStorage
- Smooth transitions between themes

### Technical Features

- **Caching Strategy**: Intelligent caching to prevent unnecessary API calls
- **Error Handling**: Graceful error handling with user-friendly fallbacks
- **Loading States**: Reactive loading indicators throughout the application

## 🧪 Testing

The project includes unit tests demonstrating testing best practices:

- **PosterSrcPipe**: Comprehensive pipe testing with various scenarios
- **Testing Strategy**: Focus on business logic, service interactions, and edge cases
- **Mock Strategy**: Clean mocking of dependencies for isolated testing

Run tests with detailed output:

```bash
npm test
```

## 🔧 Technical Stack

- **Angular 19**: Latest Angular with standalone components and signals
- **TypeScript 5.7**: Strong typing and modern ES features
- **RxJS**: Reactive programming and state management
- **SCSS**: Styling with CSS variables for theming
- **Jasmine & Karma**: Unit testing framework

## 📄 License

This project is developed as a technical assessment and is available for educational purposes.

---

_This project demonstrates modern Angular development practices and clean architecture principles suitable for enterprise-level applications._
