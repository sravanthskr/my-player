# Video Player Application

## Overview

This is a VLC-style video player application built with React and Express. It allows users to upload video files, load subtitles, and play videos with comprehensive controls including keyboard shortcuts, subtitle management, and full-screen support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application uses a monorepo structure with client-server separation:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state, React hooks for local state

## Key Components

### Frontend Architecture
- **React Router**: Using `wouter` for client-side routing
- **Component Structure**: Modular components with UI library (shadcn/ui)
- **Video Player**: Custom video player with controls, subtitles, and keyboard shortcuts
- **File Upload**: Drag-and-drop interface for video and subtitle files
- **State Management**: React Query for API calls and caching

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **File Upload**: Multer for handling multipart/form-data uploads
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Development Setup**: Vite integration for hot reloading in development

### Database Schema
- **Video Files Table**: Stores video metadata, audio tracks, subtitle tracks
- **Subtitle Files Table**: Stores subtitle content, format, and language information
- **Drizzle ORM**: Type-safe database operations with PostgreSQL

## Data Flow

1. **File Upload**: Users upload videos/subtitles via drag-and-drop or file input
2. **Metadata Extraction**: Server extracts video metadata (duration, tracks, etc.)
3. **Database Storage**: File information stored in PostgreSQL via Drizzle ORM
4. **Video Playback**: Frontend fetches video list and plays selected videos
5. **Subtitle Processing**: Subtitles parsed and synchronized with video playback

## External Dependencies

### Core Technologies
- **React**: Frontend framework with hooks and context
- **Express**: Backend web framework
- **PostgreSQL**: Primary database (via Neon serverless)
- **Drizzle ORM**: Database ORM with type safety
- **Vite**: Development server and build tool

### UI Libraries
- **shadcn/ui**: Pre-built React components
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### File Handling
- **Multer**: File upload middleware
- **FFprobe**: Video metadata extraction (mocked in current implementation)

## Deployment Strategy

### Development
- **Vite Dev Server**: Frontend development with hot reloading
- **Express Server**: Backend API with file watching via tsx
- **Database**: Neon serverless PostgreSQL connection

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Static Files**: Express serves built frontend files
- **Database**: Production PostgreSQL via environment variables

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **NODE_ENV**: Environment mode (development/production)
- **File Storage**: Local uploads directory with 5GB limit

The application is designed to be easily deployable on platforms like Replit, with proper environment variable configuration for the database connection.

## Recent Changes

### 2025-01-15: Offline Local File Support
- Modified video player to work offline with local files using URL.createObjectURL
- Replaced server upload system with direct local file handling
- Added proper MKV file support and enhanced video format detection
- Improved YouTube-style hold-space-for-2x-speed functionality
- Enhanced fullscreen experience with cursor hiding and faster control fade
- Fixed file upload API to properly handle FormData vs JSON
- Updated UI to emphasize local file loading instead of server uploads
- Application now works completely offline with local video files

### 2025-01-15: Bug Fixes and UI Improvements
- Fixed video seeking functionality to properly handle mouse click/drag on progress bar
- Moved playback speed controls from separate button to integrated sidebar menu
- Added total video duration display with toggleable remaining time (-9:00) format
- Added proper file size display in MB/GB format throughout the application
- Changed application title from "VLC-Style Video Player" to "Video Player"
- Enhanced progress bar with better mouse interaction and immediate seeking response
- Fixed playback rate state management between sidebar and video player components

### 2025-01-15: Performance Optimization and Features Enhancement
- Optimized video seeking performance with immediate UI updates for smooth experience
- Fixed video duration detection with multiple fallback methods for better compatibility
- Enhanced video metadata loading to handle edge cases and improve reliability
- Added comprehensive Features section in sidebar listing all capabilities
- Implemented working aspect ratio controls (Default, 16:9, 4:3, 21:9)
- Added automatic video position restoration when switching between videos
- Improved video loading with proper URL object management and cleanup
- Enhanced storage system to save and restore video position every 10 seconds

### 2025-01-16: Enhanced Subtitle Synchronization and UX Improvements
- Fixed subtitle delay functionality with proper timing calculation and wider range (-10s to +10s)
- Added custom delay input field for precise manual adjustment
- Enhanced keyboard shortcuts: G/H (±100ms), J/K (±1s), comma/period (±10ms)
- Implemented precise adjustment buttons: -1s, -0.1s, +0.1s, +1s with reset option
- Added auto-hiding cursor during video playback (hides after 3 seconds of no movement)
- Improved subtitle overlay with better positioning, styling, and text shadow for readability
- Enhanced subtitle size controls with larger range (12px to 48px)

### 2025-01-16: Migration to Replit and Deployment Fixes
- Successfully migrated project from Replit Agent to standard Replit environment
- Fixed video player functionality: duration display, playback controls, space bar functionality
- Updated video file handling to properly work with local files using object URLs
- Fixed type definitions for VideoFile and SubtitleFile to support local file properties
- Added comprehensive deployment configuration for Render.com and other platforms
- Created deployment scripts and documentation for external hosting
- Improved server configuration to handle PORT environment variable for platform compatibility

### 2025-01-16: Migration to Replit and Deployment Fixes
- Successfully migrated from Replit Agent to standard Replit environment
- Fixed video player control functionality (play/pause, seeking, volume controls)
- Resolved video duration and remaining time display issues
- Fixed video file handling for local file playback with proper URL object management
- Updated schema types to support local file properties (localUrl, file)
- Enhanced server configuration for better production deployment compatibility
- Added comprehensive deployment documentation for Render.com and other platforms
- Created deployment scripts and configuration files (deploy.sh, render.yaml)
- Improved port configuration to work with deployment platforms (PORT environment variable)