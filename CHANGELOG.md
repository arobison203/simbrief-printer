# Changelog

All notable changes to SimBrief Printer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial desktop application release
- Cross-platform support (macOS, Windows, Linux)
- Auto-update functionality via GitHub Releases
- Network thermal printer support (ESC/POS via TCP/IP)
- SimBrief OFP fetching and formatting
- Live preview of formatted output
- Unit conversion (LBS ↔ KG)
- Printer connection testing
- Receipt-style thermal printer layout (80mm paper)

### Features
- Direct SimBrief API integration (no proxy needed)
- Configurable printer IP and port
- Clean, compact OFP display optimized for thermal printing
- Includes: flight info, routing, fuel planning, weights, weather, performance data

## [0.1.0] - TBD

### Added
- Initial release
- Migration from web app to desktop app
- Tauri-based native application
- Network printer support
- Real-time OFP preview
- Cross-platform installers

---

## Release Types

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerabilities

## Notes

- Releases follow semantic versioning: MAJOR.MINOR.PATCH
- Auto-updates are enabled by default for all platforms
- Users on the latest version will automatically receive updates